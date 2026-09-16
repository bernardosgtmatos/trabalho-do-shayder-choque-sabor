const fs = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, '../../fotos_cardapio');
const URL_BASE = '/fotos_cardapio'

function listarFotosCardapio() {
  if (!fs.existsSync(DIR)) return [];
  const fotos_cardapio = fs
    .readdirSync(DIR, { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => path.join(DIR, e.name));
  return fotos_cardapio;
}

const fotos_cardapio = listarFotosCardapio();
console.log(fotos_cardapio)

module.exports = { fotos_cardapio, listarFotosCardapio, DIR };