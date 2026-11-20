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
    ["Vitasanus Body Slim – 60 cápsulas","vitasanus-body-slim",49.99,19.99,"compre3"]
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
let cart = 0;

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

const shelvesEl = document.getElementById("shelves");
PRODUCTS.forEach((group, gi) => {
  const section = document.createElement("section");
  section.className = "shelf";
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
    btn.addEventListener("click", () => {
      cart += price;
      document.getElementById("cart-total").textContent = brl(cart);
    });

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

