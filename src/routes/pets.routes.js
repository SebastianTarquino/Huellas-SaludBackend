
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

router.post('/pet/create', (req, res) => {
  const newPet = {
    idPet: seedData.pets.length + 1,
    name: req.body.name || req.body.data?.name || 'Mascota Nueva',
    species: req.body.species || req.body.data?.species || 'Perro',
    sex: req.body.sex || req.body.data?.sex || 'Macho',
    age: req.body.age || req.body.data?.age || 1,
    mediaFile: null,
    medicalHistory: []
  };
  seedData.pets.push(newPet);
  res.status(201).json({ message: 'Mascota creada exitosamente', data: newPet });
});

router.put('/pet/:id', (req, res) => {
  const idx = seedData.pets.findIndex(p => p.idPet == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Mascota no encontrada' });
  seedData.pets[idx] = { ...seedData.pets[idx], ...req.body };
  res.json({ message: 'Mascota actualizada exitosamente', data: seedData.pets[idx] });
});

router.delete('/pet/:id', (req, res) => {
  const idx = seedData.pets.findIndex(p => p.idPet == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Mascota no encontrada' });
  const deleted = seedData.pets.splice(idx, 1);
  res.json({ message: 'Mascota eliminada exitosamente', data: deleted[0] });
});

module.exports = router;
