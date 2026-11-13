const menuData = require('../data/db.json');

if (!Array.isArray(menuData.menu)) {
   throw new Error('db.json debe contener un arreglo "menu".');
}

function getMenu() {
   return menuData.menu;
}

module.exports = { getMenu };
