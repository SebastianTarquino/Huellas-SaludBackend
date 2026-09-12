const express = require('express');
const jwt = require('jsonwebtoken');
const seedData = require('../data/seedData');
const router = express.Router();

router.post('/user/login', (req, res) => {
  const { data } = req.body || {};
  const { emailOrDoc, password } = data || {};

  if (!emailOrDoc || !password) {
    return res.status(400).json({ message: 'Se requiere documento/correo y contraseña' });
  }

  const user = seedData.users.find(u => u.email === emailOrDoc || u.documentNumber === emailOrDoc);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'huellas_secret',
    { expiresIn: '7d' }
  );

  return res.status(200).json({
    token,
    access_token: token,
    data: {
      id: user.id,
      documentNumber: user.documentNumber,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      role: user.role,
      token
    }
  });
});

module.exports = router;
