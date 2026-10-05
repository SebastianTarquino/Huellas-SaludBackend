const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Conexión a PostgreSQL en Render

// Auto-migración segura para columna avatar_base64 en la tabla users
pool.query(`
  ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_base64 TEXT;
`).catch(err => console.error('[Users Schema Init Error]:', err.message));

// GET: Listar todos los usuarios directamente de PostgreSQL con su avatar
router.get('/user/list-users', async (req, res) => {
  try {
    const query = 'SELECT id, document_number, email, name, last_name, role, avatar_base64 FROM users ORDER BY id ASC';
    const { rows } = await pool.query(query);

    const formatted = rows.map(u => ({
      data: {
        id: u.id,
        name: u.name,
        lastName: u.last_name,
        role: u.role,
        documentNumber: u.document_number,
        email: u.email,
        avatarBase64: u.avatar_base64 || null
      }
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

// GET: Obtener usuario por ID, documento o email
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, document_number, email, name, last_name, role, avatar_base64 
      FROM users 
      WHERE id::text = $1 OR document_number = $1 OR LOWER(email) = LOWER($1) OR LOWER(name) = LOWER($1) OR LOWER(CONCAT(name, ' ', last_name)) = LOWER($1)
    `;
    const { rows } = await pool.query(query, [id.toString().trim()]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const u = rows[0];
    res.json({
      data: {
        id: u.id,
        documentNumber: u.document_number,
        email: u.email,
        name: u.name,
        lastName: u.last_name,
        role: u.role,
        avatarBase64: u.avatar_base64 || null
      }
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

// POST: Registrar nuevo usuario en PostgreSQL
router.post('/user/create', async (req, res) => {
  try {
    const bodyData = req.body.data || req.body;
    const email = bodyData.email || '';
    const documentNumber = bodyData.documentNumber || bodyData.document || '';

    if (!email || !documentNumber) {
      return res.status(400).json({ message: 'El correo y el número de documento son obligatorios' });
    }

    // Verificar duplicados en la base de datos
    const checkQuery = 'SELECT id FROM users WHERE email = $1 OR document_number = $2';
    const existing = await pool.query(checkQuery, [email, documentNumber]);

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Ya existe un usuario registrado con este correo o documento' });
    }

    const name = bodyData.name || 'Nuevo';
    const lastName = bodyData.lastName || bodyData.lasName || 'Cliente';
    const role = bodyData.role || 'CLIENTE';
    const password = bodyData.password || 'password123';
    const avatarBase64 = bodyData.avatarBase64 || bodyData.avatar || null;

    const insertQuery = `
      INSERT INTO users (document_number, email, name, last_name, role, password_hash, avatar_base64)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, document_number, email, name, last_name, role, avatar_base64
    `;
    const values = [documentNumber, email, name, lastName, role, password, avatarBase64];
    const result = await pool.query(insertQuery, values);
    const createdUser = result.rows[0];

    res.status(201).json({
      status: 'success',
      message: 'Usuario cliente creado exitosamente',
      data: {
        id: createdUser.id,
        documentNumber: createdUser.document_number,
        email: createdUser.email,
        name: createdUser.name,
        lastName: createdUser.last_name,
        role: createdUser.role,
        avatarBase64: createdUser.avatar_base64
      }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

// PUT: Actualizar foto de perfil (avatar) de un usuario en PostgreSQL
router.put('/user/:id/avatar', async (req, res) => {
  try {
    const { id } = req.params;
    const bodyData = req.body.data || req.body;
    const avatarBase64 = bodyData.avatarBase64 || bodyData.avatar || req.body.avatarBase64;

    if (!avatarBase64) {
      return res.status(400).json({ message: 'Se requiere avatarBase64' });
    }

    const updateQuery = `
      UPDATE users 
      SET avatar_base64 = $1
      WHERE id::text = $2 OR document_number = $2 OR LOWER(email) = LOWER($2) OR LOWER(name) = LOWER($2) OR LOWER(CONCAT(name, ' ', last_name)) = LOWER($2)
      RETURNING id, document_number, email, name, last_name, role, avatar_base64
    `;
    const result = await pool.query(updateQuery, [avatarBase64, id.toString().trim()]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const u = result.rows[0];
    res.json({
      status: 'success',
      message: 'Foto de perfil actualizada exitosamente',
      data: {
        id: u.id,
        documentNumber: u.document_number,
        email: u.email,
        name: u.name,
        lastName: u.last_name,
        role: u.role,
        avatarBase64: u.avatar_base64
      }
    });
  } catch (error) {
    console.error('Error al actualizar avatar de usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

// PUT: Actualizar usuario en PostgreSQL
router.put('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bodyData = (req.body.data && typeof req.body.data === 'object' && !Array.isArray(req.body.data))
      ? req.body.data
      : req.body;

    const findQuery = 'SELECT * FROM users WHERE id::text = $1 OR document_number = $1 OR LOWER(email) = LOWER($1)';
    const userResult = await pool.query(findQuery, [id.toString().trim()]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const current = userResult.rows[0];
    const newDoc = bodyData.documentNumber ?? bodyData.document ?? current.document_number;
    const newEmail = bodyData.email ?? current.email;
    const newName = bodyData.name ?? current.name;
    const newLastName = bodyData.lastName ?? bodyData.lasName ?? current.last_name;
    const newRole = bodyData.role ?? current.role;
    const newPass = bodyData.password ?? current.password_hash;
    const newAvatar = bodyData.avatarBase64 ?? bodyData.avatar ?? current.avatar_base64;

    const updateQuery = `
      UPDATE users 
      SET document_number = $1, email = $2, name = $3, last_name = $4, role = $5, password_hash = $6, avatar_base64 = $7
      WHERE id = $8
      RETURNING id, document_number, email, name, last_name, role, avatar_base64
    `;
    const updateResult = await pool.query(updateQuery, [newDoc, newEmail, newName, newLastName, newRole, newPass, newAvatar, current.id]);
    const u = updateResult.rows[0];

    res.json({
      message: 'Usuario actualizado exitosamente',
      data: {
        id: u.id,
        documentNumber: u.document_number,
        email: u.email,
        name: u.name,
        lastName: u.last_name,
        role: u.role,
        avatarBase64: u.avatar_base64
      }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

// DELETE: Eliminar usuario de PostgreSQL
router.delete('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteQuery = 'DELETE FROM users WHERE id::text = $1 OR document_number = $1 OR LOWER(email) = LOWER($1) RETURNING id, name, last_name';
    const result = await pool.query(deleteQuery, [id.toString().trim()]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente', data: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

module.exports = router;
