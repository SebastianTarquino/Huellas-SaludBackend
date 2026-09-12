const express = require('express');
const seedData = require('../data/seedData');
const router = express.Router();

router.get('/product/list-products', (req, res) => {
  const formatted = seedData.products.map(p => ({ data: p }));
  res.json(formatted);
});

router.get('/product/:id', (req, res) => {
  const product = seedData.products.find(p => p.idProduct == req.params.id);
  if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
  res.json({ data: product });
});

module.exports = router;
