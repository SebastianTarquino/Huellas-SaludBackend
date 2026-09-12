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

module.exports = router;
