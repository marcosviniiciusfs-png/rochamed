// Worker do Rochamed (modo avançado do Pages). Não é publicado como arquivo estático:
// só trata /api/pedidos e entrega todo o resto ao site.
// Recebe o pedido da cesta, gera um código único e grava no D1 (binding DB).

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (corpo, status = 200) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: {"Content-Type": "application/json; charset=utf-8", ...CORS},
  });

// Sem caracteres ambíguos (0/O, 1/I/L).
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function gerarCodigo(){
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let sufixo = "";
  for (const b of bytes) sufixo += ALFABETO[b % ALFABETO.length];
  return `RM-${sufixo}`;
}

// ---- WhatsApp Cloud API (oficial da Meta) ----
// Só envia quando as chaves estiverem configuradas (secrets do Pages). Sem elas, o pedido é salvo
// e o site usa o link wa.me como plano B.
// Variáveis: WHATSAPP_TOKEN (secret), WHATSAPP_PHONE_ID (número remetente), WHATSAPP_DESTINO
// (número da loja, com 55), WHATSAPP_TEMPLATE (nome do modelo aprovado), WHATSAPP_API_VERSION (opcional).
// O modelo deve ter 5 variáveis, nesta ordem: {{1}} código, {{2}} cliente, {{3}} telefone,
// {{4}} itens em uma linha, {{5}} total. Parâmetros não aceitam quebra de linha: o layout fica no modelo.

const valorBR = n => "R$ " + Number(n).toFixed(2).replace(".", ",");
const linhaUnica = s => String(s).replace(/[\r\n\t]+/g, " ").replace(/ {4,}/g, "   ").trim();

async function enviarPeloWhatsApp(env, p){
  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_ID || !env.WHATSAPP_DESTINO || !env.WHATSAPP_TEMPLATE)
    return false;
  const versao = env.WHATSAPP_API_VERSION || "v21.0";
  const itensResumo = p.itens.map(i => `${i.quantidade}x ${i.nome} (${valorBR(i.preco * i.quantidade)})`).join(" | ");
  const corpo = {
    messaging_product: "whatsapp",
    to: env.WHATSAPP_DESTINO,
    type: "template",
    template: {
      name: env.WHATSAPP_TEMPLATE,
      language: {code: "pt_BR"},
      components: [{
        type: "body",
        parameters: [
          {type: "text", text: linhaUnica(p.codigo)},
          {type: "text", text: linhaUnica(p.nome)},
          {type: "text", text: linhaUnica(p.telefone)},
          {type: "text", text: linhaUnica(itensResumo)},
          {type: "text", text: linhaUnica(valorBR(p.total))},
        ],
      }],
    },
  };
  try{
    const r = await fetch(`https://graph.facebook.com/${versao}/${env.WHATSAPP_PHONE_ID}/messages`, {
      method: "POST",
      headers: {Authorization: `Bearer ${env.WHATSAPP_TOKEN}`, "Content-Type": "application/json"},
      body: JSON.stringify(corpo),
    });
    if (!r.ok){
      console.error("WhatsApp recusou o envio", r.status, await r.text());
      return false;
    }
    return true;
  }catch(err){
    console.error("Falha ao chamar a API do WhatsApp", err);
    return false;
  }
}

async function criarPedido(request, env){
  let dados;
  try{ dados = await request.json(); }
  catch{ return json({erro: "Pedido inválido."}, 400); }

  const nome = String(dados?.nome ?? "").trim().slice(0, 120);
  const telefone = String(dados?.telefone ?? "").replace(/\D/g, "");
  const itensRecebidos = Array.isArray(dados?.itens) ? dados.itens.slice(0, 50) : [];

  if (nome.length < 3) return json({erro: "Informe seu nome."}, 400);
  if (telefone.length < 10 || telefone.length > 13) return json({erro: "Telefone inválido."}, 400);

  const itens = itensRecebidos
    .map(i => ({
      nome: String(i?.nome ?? "").trim().slice(0, 200),
      quantidade: Math.floor(Number(i?.quantidade)),
      preco: Math.round(Number(i?.preco) * 100) / 100,
    }))
    .filter(i => i.nome && i.quantidade >= 1 && i.quantidade <= 99 && i.preco >= 0 && i.preco <= 100000);

  if (itens.length === 0 || itens.length !== itensRecebidos.length)
    return json({erro: "Carrinho inválido. Atualize a página e tente de novo."}, 400);

  const total = Math.round(itens.reduce((s, i) => s + i.preco * i.quantidade, 0) * 100) / 100;
  const criadoEm = new Date().toISOString();

  // O código é a chave primária: se repetir (raro), tenta outro.
  for (let tentativa = 0; tentativa < 5; tentativa++){
    const codigo = gerarCodigo();
    try{
      await env.DB.prepare(
        "INSERT INTO pedidos (codigo, nome, telefone, itens, total, criado_em) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(codigo, nome, telefone, JSON.stringify(itens), total, criadoEm).run();
      const whatsappEnviado = await enviarPeloWhatsApp(env, {codigo, nome, telefone, itens, total});
      return json({codigo, nome, telefone, itens, total, criado_em: criadoEm, whatsapp_enviado: whatsappEnviado}, 201);
    }catch(err){
      if (!String(err?.message ?? err).includes("UNIQUE")) {
        console.error("Erro ao gravar pedido", err);
        return json({erro: "Não foi possível salvar o pedido. Tente novamente."}, 500);
      }
    }
  }
  return json({erro: "Não foi possível gerar o código do pedido. Tente novamente."}, 500);
}

export default {
  async fetch(request, env){
    const url = new URL(request.url);
    // Arquivos internos do projeto não são entregues ao navegador.
    if (url.pathname === "/_worker.js" || url.pathname.startsWith("/functions/"))
      return new Response("Não encontrado", {status: 404});
    if (url.pathname === "/api/pedidos"){
      if (request.method === "OPTIONS") return new Response(null, {status: 204, headers: CORS});
      if (request.method !== "POST") return json({erro: "Método não permitido."}, 405);
      return criarPedido(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
