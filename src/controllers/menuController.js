const { getMenu: readMenu } = require('../models/menuModel');

function getMenu(req, res) {
   res.json(readMenu());
}

module.exports = { getMenu };
