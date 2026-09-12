
const express = require('express');
const seedData = require('../data/seedData');
const router = express.Router();

router.get('/invoice/list-invoices', (req, res) => {
  res.json(seedData.invoices);
});

router.get('/invoice/:id', (req, res) => {
  const inv = seedData.invoices.find(i => i.idInvoice == req.params.id || i.numero == req.params.id);
  if (!inv) return res.status(404).json({ message: 'Factura no encontrada' });
  res.json(inv);
});

router.post('/invoice/create', (req, res) => {
  const num = seedData.invoices.length + 147;
  const newInv = {
    idInvoice: 'F-' + num,
    numero: num,
    idClient: req.body.idClient || '123456789',
    cliente: req.body.cliente || 'Cliente General',
    mascota: req.body.mascota || 'Mascota',
    fecha: new Date().toLocaleDateString(),
    monto: req.body.monto || 100000,
    estado: 'Pagada',
    items: req.body.items || []
  };
  seedData.invoices.push(newInv);
  res.status(201).json({ message: 'Factura creada exitosamente', data: newInv });
});

router.put('/invoice/:id', (req, res) => {
  const idx = seedData.invoices.findIndex(i => i.idInvoice == req.params.id || i.numero == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Factura no encontrada' });
  seedData.invoices[idx] = { ...seedData.invoices[idx], ...req.body };
  res.json({ message: 'Factura actualizada exitosamente', data: seedData.invoices[idx] });
});

module.exports = router;
