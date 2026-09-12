
const express = require('express');
const seedData = require('../data/seedData');
const router = express.Router();

router.get('/user/list-users', (req, res) => {
  const formatted = seedData.users.map(u => ({
    data: {
      id: u.id,
      name: u.name,
      lastName: u.lastName,
      role: u.role,
      documentNumber: u.documentNumber,
      email: u.email
    }
  }));
  res.json(formatted);
});

router.get('/user/:id', (req, res) => {
  const user = seedData.users.find(u => u.id == req.params.id || u.documentNumber == req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json({ data: user });
});

router.post('/user/create', (req, res) => {
  const newUser = {
    id: seedData.users.length + 1,
    documentNumber: req.body.documentNumber || req.body.data?.documentNumber || '00000000',
    email: req.body.email || req.body.data?.email || 'nuevo@usuario.com',
    name: req.body.name || req.body.data?.name || 'Nuevo',
    lastName: req.body.lastName || req.body.data?.lastName || 'Usuario',
    role: req.body.role || req.body.data?.role || 'CLIENTE',
    password: req.body.password || req.body.data?.password || 'password123'
  };
  seedData.users.push(newUser);
  res.status(201).json({ message: 'Usuario creado exitosamente', data: newUser });
});

router.put('/user/:id', (req, res) => {
  const idx = seedData.users.findIndex(u => u.id == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Usuario no encontrado' });
  seedData.users[idx] = { ...seedData.users[idx], ...req.body };
  res.json({ message: 'Usuario actualizado exitosamente', data: seedData.users[idx] });
});

router.delete('/user/:id', (req, res) => {
  const idx = seedData.users.findIndex(u => u.id == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Usuario no encontrado' });
  const deleted = seedData.users.splice(idx, 1);
  res.json({ message: 'Usuario eliminado exitosamente', data: deleted[0] });
});

module.exports = router;
