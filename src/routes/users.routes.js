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
  const bodyData = req.body.data || req.body;
  const email = bodyData.email || '';
  const documentNumber = bodyData.documentNumber || bodyData.document || '';

  if (!email || !documentNumber) {
    return res.status(400).json({ message: 'El correo y el número de documento son obligatorios' });
  }

  // Verificar si ya existe
  const existing = seedData.users.find(u => u.email === email || u.documentNumber === documentNumber);
  if (existing) {
    return res.status(400).json({ message: 'Ya existe un usuario registrado con este correo o documento' });
  }

  const newUser = {
    id: seedData.users.length + 1,
    documentNumber: documentNumber,
    email: email,
    name: bodyData.name || 'Nuevo',
    lastName: bodyData.lastName || bodyData.lasName || 'Cliente',
    role: 'CLIENTE', // SIEMPRE ROL CLIENTE PARA REGISTROS PÚBLICOS
    password: bodyData.password || 'password123',
    phone: bodyData.phone || '',
    address: bodyData.address || ''
  };

  seedData.users.push(newUser);
  res.status(201).json({ status: 'success', message: 'Usuario cliente creado exitosamente', data: newUser });
});

router.put('/user/:id', (req, res) => {
  const idx = seedData.users.findIndex(u => u.id == req.params.id || u.documentNumber == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Usuario no encontrado' });

  // Si el usuario envio data anidada (ej: copiar respuesta previa en Swagger)
  const bodyData = (req.body.data && typeof req.body.data === 'object' && !Array.isArray(req.body.data))
    ? req.body.data
    : req.body;

  const currentUser = seedData.users[idx];

  const updatedUser = {
    id: currentUser.id,
    documentNumber: bodyData.documentNumber ?? bodyData.document ?? currentUser.documentNumber,
    email: bodyData.email ?? currentUser.email,
    name: bodyData.name ?? currentUser.name,
    lastName: bodyData.lastName ?? bodyData.lasName ?? currentUser.lastName,
    role: bodyData.role ?? currentUser.role,
    password: bodyData.password ?? currentUser.password,
    phone: bodyData.phone ?? currentUser.phone || '',
    address: bodyData.address ?? currentUser.address || ''
  };

  seedData.users[idx] = updatedUser;
  res.json({ message: 'Usuario actualizado exitosamente', data: updatedUser });
});

router.delete('/user/:id', (req, res) => {
  const idx = seedData.users.findIndex(u => u.id == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Usuario no encontrado' });
  const deleted = seedData.users.splice(idx, 1);
  res.json({ message: 'Usuario eliminado exitosamente', data: deleted[0] });
});

module.exports = router;
