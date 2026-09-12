const express = require('express');
const seedData = require('../data/seedData');
const router = express.Router();

router.get('/user/list-users', (req, res) => {
  const formatted = seedData.users.map(u => ({
    data: {
      name: u.name,
      lastName: u.lastName,
      role: u.role,
      documentNumber: u.documentNumber
    }
  }));
  res.json(formatted);
});

router.get('/user/:id', (req, res) => {
  const user = seedData.users.find(u => u.id == req.params.id || u.documentNumber == req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(user);
});

router.post('/user/create', (req, res) => {
  const newUser = { id: seedData.users.length + 1, ...req.body };
  seedData.users.push(newUser);
  res.status(201).json({ message: 'Usuario creado exitosamente', data: newUser });
});

module.exports = router;
