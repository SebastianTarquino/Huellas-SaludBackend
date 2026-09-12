
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
  
  // Extraer body limpio incluso si el usuario envio envoltorio data o message
  const bodyData = req.body.data && typeof req.body.data === 'object' ? req.body.data : req.body;
  
  const updatedProduct = {
    idProduct: Number(req.params.id),
    name: bodyData.name ?? seedData.products[idx].name,
    category: bodyData.category ?? seedData.products[idx].category,
    animalType: bodyData.animalType ?? seedData.products[idx].animalType,
    description: bodyData.description ?? seedData.products[idx].description,
    price: bodyData.price ?? seedData.products[idx].price,
    mediaFile: bodyData.mediaFile ?? seedData.products[idx].mediaFile
  };

  seedData.products[idx] = updatedProduct;
  res.json({ message: 'Producto actualizado exitosamente', data: updatedProduct });
});

router.delete('/product/:id', (req, res) => {
  const idx = seedData.products.findIndex(p => p.idProduct == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Producto no encontrado' });
  const deleted = seedData.products.splice(idx, 1);
  res.json({ message: 'Producto eliminado exitosamente', data: deleted[0] });
});

module.exports = router;
