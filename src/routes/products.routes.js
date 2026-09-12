
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

router.post('/product/create', (req, res) => {
  const newProd = {
    idProduct: seedData.products.length + 1,
    name: req.body.name || req.body.data?.name || 'Nuevo Producto',
    category: req.body.category || req.body.data?.category || 'General',
    animalType: req.body.animalType || req.body.data?.animalType || 'Todos',
    description: req.body.description || req.body.data?.description || '',
    price: req.body.price || req.body.data?.price || 10000,
    mediaFile: null
  };
  seedData.products.push(newProd);
  res.status(201).json({ message: 'Producto creado exitosamente', data: newProd });
});

router.put('/product/:id', (req, res) => {
  const idx = seedData.products.findIndex(p => p.idProduct == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Producto no encontrado' });
  seedData.products[idx] = { ...seedData.products[idx], ...req.body };
  res.json({ message: 'Producto actualizado exitosamente', data: seedData.products[idx] });
});

router.delete('/product/:id', (req, res) => {
  const idx = seedData.products.findIndex(p => p.idProduct == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Producto no encontrado' });
  const deleted = seedData.products.splice(idx, 1);
  res.json({ message: 'Producto eliminado exitosamente', data: deleted[0] });
});

module.exports = router;
