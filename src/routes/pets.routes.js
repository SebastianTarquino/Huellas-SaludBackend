const express = require('express');
const seedData = require('../data/seedData');
const router = express.Router();

router.get('/pet/list-pets', (req, res) => {
  const formatted = seedData.pets.map(p => ({ data: p }));
  res.json(formatted);
});

router.get('/pet/:id', (req, res) => {
  const pet = seedData.pets.find(p => p.idPet == req.params.id);
  if (!pet) return res.status(404).json({ message: 'Mascota no encontrada' });
  res.json({ data: pet });
});

module.exports = router;
