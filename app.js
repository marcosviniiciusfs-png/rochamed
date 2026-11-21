// Produtos da Live Pré-Black Friday (relação de preços promocionais).
// Campos: [nome, slug da imagem em assets/produtos/, valor original (ou null), valor com desconto, observação]
// observação "compre3" = preço por unidade válido na compra de 3.
const PRODUCTS = [
  {sec:"Perfumaria importada", items:[
    ["Al Absar Divine Sahra Feminino – 100 ml","al-absar-divine-sahra",615,384.99],
    ["Al Absar Divine Dahab Feminino – 100 ml","al-absar-divine-dahab",615,399.99],
    ["Khadlaj Zayaan Gold Eau de Parfum – 100 ml","khadlaj-zayaan-gold",438,284.99]
  ]},
  {sec:"Beleza e cuidados pessoais", items:[
    ["Carmed Body Splash – todas as fragrâncias","carmed-body-splash",53.99,32.99],
    ["Desodorante Dove Stick Tropical Hibiscus – 45 g","dove-desodorante-hibiscus",38.99,29.99],
    ["Máscara Concentrada Eudora Siàge Nutri Acid Complex – 250 g","eudora-mascara-nutri-acid",95.70,69.99],
    ["Eudora Siàge Shampoo Hair-Plastia – 250 ml","eudora-shampoo-hair-plastia",61.40,49.99],
    ["Eudora Siàge Shampoo Cica-Therapy – 250 ml","eudora-shampoo-cica-therapy",60.88,49.99]
  ]},
  {sec:"Ofertas especiais – compre 3 unidades", items:[
    ["MJ Natural","mj-natural",49.99,19.99,"compre3"],
    ["OZP Natural – 60 comprimidos","ozp-natural",49.99,19.99,"compre3"],
    ["Vitasanus Body Slim – 120 cápsulas","vitasanus-body-slim",49.99,19.99,"compre3"]
  ]},
  {sec:"Eudora Siàge – tratamento capilar", items:[
    ["Siàge Kit CCT 250 g + Ampola Pro Chronology","siage-kit-cct-chronology",165.46,133.99],
    ["Siàge CCT Combate ao Frizz – 250 g","siage-cct-frizz",87.70,69.99],
    ["Siàge Acidificante Resgate Imediato – 150 ml","siage-acidificante",89.07,69.99],
    ["Siàge Shampoo Regeneração Pós-Química – 250 ml","siage-shampoo-regeneracao",60.91,49.99]
  ]},
  {sec:"Haskell – Cavalo Forte", items:[
    ["Máscara Cavalo Forte Haskell – 900 g","haskell-mascara-cavalo-forte",107.99,68.99],
    ["Promopack Cavalo Forte – shampoo 300 ml + condicionador 300 ml","haskell-promopack-cavalo-forte",94.60,79.99]
  ]},
  {sec:"Desodorantes e perfumaria nacional", items:[
    ["Desodorante Nivea Aerosol Defende Masculino – 150 ml","nivea-desodorante-defende-masc",24.00,17.99],
    ["Natura Colônia Essencial Masculino – 100 ml","natura-colonia-essencial-masc",278.90,149.99]
  ]},
  {sec:"Elseve – finalizadores e tratamento capilar", items:[
    ["Sérum Leave-in Elseve Liso dos Sonhos – 100 ml","elseve-serum-liso-dos-sonhos",null,34.99],
    ["Óleo Extraordinário Elseve","elseve-oleo-extraordinario",null,36.99]
  ]},
  {sec:"La Roche-Posay – dermocosméticos e proteção solar", items:[
    ["Hyalu B5 Sérum Anti-idade – 30 ml","lrp-hyalu-b5",295.70,239.99],
    ["Anthelios Dermo Pediatrics FPS 60 – 120 ml","lrp-anthelios-dermo-pediatrics",166.70,139.99],
    ["Anthelios Ultra Cover FPS 60 – cor 4.0 – 30 g","lrp-ultra-cover-40",110.75,89.99],
    ["Anthelios Ultra Cover FPS 60 – cor 3.0 – 30 g","lrp-ultra-cover-30",110.75,89.99],
    ["Effaclar Solução Micelar Ultra – 200 ml","lrp-effaclar-micelar",143.71,119.99],
    ["Anthelios XL Protect FPS 50 – 200 ml","lrp-xl-protect-50",163.10,134.99],
    ["Anthelios Age Correct FPS 50 – sem cor – 50 g","lrp-age-correct-50",221.00,184.99],
    ["Anthelios XL Protect FPS 60 – cor clara – 40 g","lrp-xl-protect-60-clara",102.60,89.99],
    ["Anthelios Age Correct 2.0 FPS 50","lrp-age-correct-2",155.80,139.99]
  ]}
];

const brl = n => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

// ---- Configuração do pedido ----
const WHATSAPP_NUMERO = "5594992144384";
const CART_KEY = "rochamed-cart";
// No GitHub Pages a API fica no domínio do Cloudflare Pages; no próprio Cloudflare usa o caminho relativo.
const API_PEDIDOS = location.hostname.endsWith("github.io")
  ? "https://rochamed.pages.dev/api/pedidos"
  : "/api/pedidos";

// Imagem do produto: tenta .jpg, .webp e .png; sem arquivo, mostra um ícone neutro.
function productImage(slug){
  const exts = ["jpg","webp","png"];
  const img = document.createElement("img");
  img.alt = "";
  img.loading = "lazy";
  let k = 0;
  img.src = `assets/produtos/${slug}.${exts[k]}`;
  img.onerror = () => {
    k++;
    if (k < exts.length) { img.src = `assets/produtos/${slug}.${exts[k]}`; return; }
    const ph = document.createElement("span");
    ph.textContent = "🧴";
    ph.style.fontSize = "44px";
    img.replaceWith(ph);
  };
  return img;
}

// ---- Carrinho (fica guardado neste navegador) ----
function lerCarrinho(){
  try{
    const obj = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
    return obj && typeof obj === "object" ? obj : {};
  }catch{ return {}; }
}
function gravarCarrinho(){
  try{ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }catch{}
}
let cart = lerCarrinho();
const itensCarrinho = () => Object.values(cart);
const quantidadeTotal = () => itensCarrinho().reduce((s,i)=>s+i.qty,0);
// Regra "compre 3": o preço por unidade só vale com 3 ou mais unidades; abaixo disso vale o preço original.
const precoDoItem = i => (i.perUnit && i.qty < 3 ? (i.oldPrice ?? i.price) : i.price);
const valorTotal = () => itensCarrinho().reduce((s,i)=>s+precoDoItem(i)*i.qty,0);

function atualizarCesta(){
  const qtd = quantidadeTotal();
  const badge = document.getElementById("cart-count");
  badge.textContent = qtd;
  badge.hidden = qtd === 0;
  document.getElementById("cart-total").textContent = brl(valorTotal());
  document.getElementById("cart-btn").setAttribute("aria-label", `Abrir cesta, ${qtd} ${qtd === 1 ? "item" : "itens"}`);
}

let avisoTimer;
function mostrarAviso(texto){
  const aviso = document.getElementById("toast");
  document.getElementById("toast-msg").textContent = texto;
  aviso.classList.add("show");
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => aviso.classList.remove("show"), 4500);
}

function adicionarAoCarrinho(p){
  const atual = cart[p.slug];
  cart[p.slug] = atual
    ? {...atual, qty: Math.min(atual.qty + 1, 99)}
    : {slug:p.slug, name:p.name, price:p.price, oldPrice:p.old, perUnit:p.perUnit, qty:1};
  gravarCarrinho();
  atualizarCesta();
  mostrarAviso("✅ Item adicionado ao carrinho! Acesse a cesta 🧺 para finalizar a compra.");
}

// ---- Tela da cesta ----
const sheet = document.getElementById("cart-sheet");

function el(tag, cls, texto){
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  e.textContent = texto;
  return e;
}
function botao(texto, aoClicar, rotulo){
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = texto;
  b.setAttribute("aria-label", rotulo);
  b.addEventListener("click", aoClicar);
  return b;
}

function mudarQuantidade(slug, delta){
  if (!cart[slug]) return;
  const nova = cart[slug].qty + delta;
  if (nova < 1) delete cart[slug];
  else cart[slug].qty = Math.min(nova, 99);
  gravarCarrinho();
  atualizarCesta();
  renderizarCesta();
}
function removerDoCarrinho(slug){
  delete cart[slug];
  gravarCarrinho();
  atualizarCesta();
  renderizarCesta();
}

function renderizarCesta(){
  const lista = document.getElementById("cart-lines");
  lista.replaceChildren();
  const itens = itensCarrinho();
  const vazia = itens.length === 0;
  document.getElementById("cart-empty").hidden = !vazia;
  document.getElementById("checkout").hidden = vazia;
  document.getElementById("sheet-total").textContent = brl(valorTotal());

  for (const item of itens){
    const li = document.createElement("li");
    li.className = "line";
    const qtd = document.createElement("div");
    qtd.className = "qty";
    qtd.append(
      botao("−", () => mudarQuantidade(item.slug, -1), `Diminuir ${item.name}`),
      el("span", "", String(item.qty)),
      botao("+", () => mudarQuantidade(item.slug, 1), `Aumentar ${item.name}`)
    );
    const remover = botao("Remover", () => removerDoCarrinho(item.slug), `Remover ${item.name}`);
    remover.className = "rm";
    const miniatura = document.createElement("span");
    miniatura.className = "thumb";
    miniatura.appendChild(productImage(item.slug));
    li.append(
      miniatura,
      el("div", "n", item.name),
      el("div", "sub", brl(precoDoItem(item) * item.qty)),
      el("div", "p", `${brl(precoDoItem(item))}${item.perUnit ? "/un." : ""} cada`),
      qtd,
      remover
    );
    if (item.perUnit && item.qty < 3)
      li.appendChild(el("div", "hint", `Leve 3 e pague ${brl(item.price)}/un. (faltam ${3 - item.qty})`));
    lista.appendChild(li);
  }
}

function mostrarPedidoFeito(feito, dados){
  document.getElementById("cart-view").hidden = feito;
  document.getElementById("done-view").hidden = !feito;
  document.getElementById("cart-title").textContent = feito ? "Pedido enviado" : "Sua cesta";
  if (feito){
    document.getElementById("done-code").textContent = dados.codigo;
    document.getElementById("wa-link").href =
      `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(montarMensagem(dados))}`;
  }
}

function abrirCesta(){
  mostrarPedidoFeito(false);
  renderizarCesta();
  sheet.hidden = false;
  document.body.style.overflow = "hidden";
  const primeiro = itensCarrinho().length ? document.getElementById("f-nome") : document.getElementById("cart-close");
  primeiro.focus();
}
function fecharCesta(){
  sheet.hidden = true;
  document.body.style.overflow = "";
}

// ---- Formulário e envio ----
function formatarTelefone(d){
  return d.length === 11
    ? `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
    : `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
}

const NUMEROS = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
const LINHA = "━━━━━━━━━━━━━━━━━━";

function montarMensagem(p){
  const itens = p.itens.map((i, n) =>
    `${NUMEROS[n] ?? "🔹"} *${i.nome}*\n` +
    `    🔢 Qtd: ${i.quantidade} × ${brl(i.preco)}\n` +
    `    🏷️ Subtotal: *${brl(i.preco * i.quantidade)}*`
  );
  return [
    "🛒✨ *NOVO PEDIDO – ROCHAMED* ✨🛒",
    LINHA,
    `🔖 *Código do pedido:* ${p.codigo}`,
    `📅 *Data:* ${new Date(p.criado_em).toLocaleString("pt-BR")}`,
    LINHA,
    "👤 *DADOS DO CLIENTE*",
    `🙋 Nome: ${p.nome}`,
    `📱 Telefone: ${formatarTelefone(p.telefone)}`,
    LINHA,
    "📦 *ITENS DO PEDIDO*",
    "",
    ...itens.flatMap(t => [t, ""]).slice(0, -1),
    LINHA,
    `💰 *TOTAL: ${brl(p.total)}*`,
    LINHA,
    "✅ Pedido registrado no sistema.",
    "⏳ Aguardando confirmação! 🙌"
  ].join("\n");
}

const campoNome = document.getElementById("f-nome");
const campoTel = document.getElementById("f-tel");

document.getElementById("checkout").addEventListener("submit", async ev => {
  ev.preventDefault();
  const nome = campoNome.value.trim();
  const telefone = campoTel.value.replace(/\D/g, "");
  const nomeOk = nome.length >= 3;
  const telOk = telefone.length === 10 || telefone.length === 11;
  document.getElementById("e-nome").hidden = nomeOk;
  document.getElementById("e-tel").hidden = telOk;
  campoNome.classList.toggle("invalid", !nomeOk);
  campoTel.classList.toggle("invalid", !telOk);
  if (!nomeOk || !telOk) return;

  const btn = document.getElementById("send-btn");
  const erro = document.getElementById("e-geral");
  btn.disabled = true;
  btn.textContent = "Enviando…";
  erro.hidden = true;
  try{
    const resposta = await fetch(API_PEDIDOS, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        nome,
        telefone,
        itens: itensCarrinho().map(i => ({nome: i.name, quantidade: i.qty, preco: precoDoItem(i)}))
      })
    });
    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) throw new Error(dados.erro || "Não foi possível enviar o pedido.");
    cart = {};
    gravarCarrinho();
    atualizarCesta();
    mostrarPedidoFeito(true, dados);
  }catch(err){
    erro.textContent = err instanceof TypeError
      ? "Sem conexão com o servidor. Tente novamente."
      : err.message;
    erro.hidden = false;
  }finally{
    btn.disabled = false;
    btn.textContent = "Enviar pedido";
  }
});

document.getElementById("cart-btn").addEventListener("click", abrirCesta);
document.getElementById("toast-go").addEventListener("click", abrirCesta);
document.getElementById("cart-close").addEventListener("click", fecharCesta);
document.getElementById("done-close").addEventListener("click", fecharCesta);
sheet.addEventListener("click", ev => { if (ev.target === sheet) fecharCesta(); });
document.addEventListener("keydown", ev => { if (ev.key === "Escape" && !sheet.hidden) fecharCesta(); });

// ---- Vitrine ----
const shelvesEl = document.getElementById("shelves");

// Atalhos para as seções, no topo da vitrine (quebram linha em vez de rolar para o lado).
const atalhos = document.createElement("nav");
atalhos.className = "jump";
atalhos.setAttribute("aria-label", "Ir para uma seção de produtos");
// Nomes curtos para caber em até 3 linhas no celular (mesma ordem de PRODUCTS).
const ATALHOS_CURTOS = ["Perfumaria", "Beleza", "Ofertas compre 3", "Capilar Siàge", "Haskell", "Desodorantes", "Elseve", "La Roche-Posay"];
PRODUCTS.forEach((group, gi) => {
  const link = document.createElement("a");
  link.href = `#secao-${gi}`;
  link.textContent = ATALHOS_CURTOS[gi] ?? group.sec;
  atalhos.appendChild(link);
});
shelvesEl.appendChild(atalhos);

PRODUCTS.forEach((group, gi) => {
  const section = document.createElement("section");
  section.className = "shelf";
  section.id = `secao-${gi}`;
  const title = document.createElement("h2");
  title.textContent = group.sec;
  const cards = document.createElement("div");
  // A primeira seção (Perfumaria importada) mantém o próprio ajuste de largura.
  cards.className = gi === 0 ? "cards stretch" : "cards";
  section.append(title, cards);

  group.items.forEach(([name, slug, old, price, note]) => {
    const perUnit = note === "compre3";
    const c = document.createElement("article");
    c.className = "card";

    const box = document.createElement("div");
    box.className = "img";
    box.appendChild(productImage(slug));

    const h3 = document.createElement("h3");
    h3.textContent = name;

    const oldEl = document.createElement("span");
    oldEl.className = "old";
    oldEl.innerHTML = old != null ? brl(old) + (perUnit ? "/un." : "") : "&nbsp;";

    const priceEl = document.createElement("span");
    priceEl.className = "price";
    priceEl.textContent = brl(price) + (perUnit ? "/un." : "");

    const btn = document.createElement("button");
    btn.textContent = "Adicionar";
    btn.addEventListener("click", () => adicionarAoCarrinho({slug, name, price, old, perUnit}));

    c.append(box, h3, oldEl, priceEl);
    if (perUnit) {
      const tag = document.createElement("span");
      tag.className = "note";
      tag.textContent = "Na compra de 3 unidades";
      c.appendChild(tag);
    }
    c.appendChild(btn);
    cards.appendChild(c);
  });

  shelvesEl.appendChild(section);
});

atualizarCesta();
