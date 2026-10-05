const express = require('express');
const jwt = require('jsonwebtoken');
const seedData = require('../data/seedData');
const db = require('../config/db'); // 👈 Conexión a PostgreSQL en Render
const router = express.Router();

router.post('/user/login', async (req, res) => {
  const { data } = req.body || {};
  const { emailOrDoc, password } = data || {};

  if (!emailOrDoc || !password) {
    return res.status(400).json({ message: 'Se requiere documento/correo y contraseña' });
  }

  const searchVal = emailOrDoc.toString().trim();

  try {
    // 1. Consultar usuario en PostgreSQL en Render
    const query = `
      SELECT id, document_number, email, name, last_name, role, password_hash, avatar_base64 
      FROM users 
      WHERE LOWER(email) = LOWER($1) OR document_number = $1
    `;
    const result = await db.query(query, [searchVal]);

    if (result.rows && result.rows.length > 0) {
      const dbUser = result.rows[0];
      if (dbUser.password_hash === password) {
        const token = jwt.sign(
          { id: dbUser.id, email: dbUser.email, role: dbUser.role },
          process.env.JWT_SECRET || 'huellas_secret',
          { expiresIn: '7d' }
        );

        console.log('[Login DB Exitoso] Usuario autenticado desde PostgreSQL:', dbUser.email);
        return res.status(200).json({
          token,
          access_token: token,
          data: {
            id: dbUser.id,
            documentNumber: dbUser.document_number,
            email: dbUser.email,
            name: dbUser.name,
            lastName: dbUser.last_name,
            role: dbUser.role,
            avatarBase64: dbUser.avatar_base64 || null,
            token
          }
        });
      }
    }
  } catch (dbErr) {
    console.error('[Login DB Error]:', dbErr.message);
  }

  // 2. Respaldo en seedData si la BD no responde o no se encuentra el usuario
  const seedUser = seedData.users.find(u => 
    u.email?.toLowerCase() === searchVal.toLowerCase() || 
    u.documentNumber?.toString() === searchVal
  );

  if (seedUser && seedUser.password === password) {
    const token = jwt.sign(
      { id: seedUser.id, email: seedUser.email, role: seedUser.role },
      process.env.JWT_SECRET || 'huellas_secret',
      { expiresIn: '7d' }
    );

    console.log('[Login Seed Exitoso] Usuario autenticado en memoria:', seedUser.email);
    return res.status(200).json({
      token,
      access_token: token,
      data: {
        id: seedUser.id,
        documentNumber: seedUser.documentNumber,
        email: seedUser.email,
        name: seedUser.name,
        lastName: seedUser.lastName,
        role: seedUser.role,
        token
      }
    });
  }

  return res.status(401).json({ message: 'Credenciales inválidas' });
});

module.exports = router;
