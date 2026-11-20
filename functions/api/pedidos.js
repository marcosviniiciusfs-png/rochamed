// Pages Function: recebe o pedido da cesta, gera um código único e grava no D1 (binding DB).
// Rota: /api/pedidos

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

export async function onRequestOptions(){
  return new Response(null, {status: 204, headers: CORS});
}

export async function onRequestPost({request, env}){
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
      return json({codigo, nome, telefone, itens, total, criado_em: criadoEm}, 201);
    }catch(err){
      if (!String(err?.message ?? err).includes("UNIQUE")) {
        console.error("Erro ao gravar pedido", err);
        return json({erro: "Não foi possível salvar o pedido. Tente novamente."}, 500);
      }
    }
  }
  return json({erro: "Não foi possível gerar o código do pedido. Tente novamente."}, 500);
}
