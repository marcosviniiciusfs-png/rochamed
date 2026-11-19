// Dados fictícios de demonstração (nada aqui vem do site original).
const SHELVES = [
  [["Analgésico 1g 20 comprimidos","💊",14.9,19.9],["Probiótico 10 frascos","🧫",89.9,109.9],["Colírio lubrificante 10ml","💧",42.5,null],["Goma de nicotina 30 un","🍬",64.9,79.9],["Antiespasmódico 20 comp","💊",23.9,null],["Vitamina B12 60 comp","🟠",39.9,52.9]],
  [["Fralda calça XG 80 un","👶",119.9,149.9],["Fórmula infantil 800g","🍼",79.9,null],["Protetor solar FPS 50","☀️",69.9,89.9],["Sérum facial 30ml","🧴",129.9,159.9],["Shampoo anticaspa 200ml","🚿",24.9,null],["Reparador labial 10ml","💄",31.9,39.9]],
  [["Loção hidratante 473ml","🧴",84.9,104.9],["Tônico facial em disco","✨",99.9,null],["Ampola facial 55ml","💧",79.9,99.9],["Gel-creme facial 100ml","🧖",74.9,null],["Máscara capilar 30g","💆",19.9,24.9],["Óleo de limpeza 230ml","🫧",44.9,54.9]]
];
const brl = n => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
let cart = 0;
document.querySelectorAll(".cards").forEach(el=>{
  SHELVES[+el.dataset.shelf].forEach(([name,emoji,price,old])=>{
    const c = document.createElement("article");
    c.className = "card";
    c.innerHTML = `<div class="img">${emoji}</div><h3></h3>${old?`<span class="old">${brl(old)}</span>`:`<span class="old">&nbsp;</span>`}<span class="price">${brl(price)}</span><button>Adicionar</button>`;
    c.querySelector("h3").textContent = name;
    c.querySelector("button").addEventListener("click",()=>{cart+=price;document.getElementById("cart-total").textContent=brl(cart)});
    el.appendChild(c);
  });
});
// Carrossel
const slides = document.getElementById("slides"), dots = document.getElementById("dots"), n = slides.children.length;
let i = 0, timer;
for(let k=0;k<n;k++){const d=document.createElement("i");d.onclick=()=>go(k);dots.appendChild(d)}
function go(k){i=(k+n)%n;slides.style.transform=`translateX(-${i*100}%)`;[...dots.children].forEach((d,j)=>d.classList.toggle("on",j===i));clearInterval(timer);timer=setInterval(()=>go(i+1),5000)}
go(0);
// Cookies
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>document.getElementById("cookies").remove());
