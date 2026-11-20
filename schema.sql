-- Banco de pedidos do Rochamed (Cloudflare D1: rochamed-demo).
-- itens: JSON com nome, quantidade e preço unitário de cada produto.
CREATE TABLE IF NOT EXISTS pedidos (
  codigo TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  itens TEXT NOT NULL,
  total REAL NOT NULL,
  criado_em TEXT NOT NULL
);
