const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Conexión a PostgreSQL en Render

// GET: Listar todos los usuarios directamente de PostgreSQL
router.get('/user/list-users', async (req, res) => {
  try {
    const query = 'SELECT id, document_number, email, name, last_name, role FROM users ORDER BY id ASC';
    const { rows } = await pool.query(query);

    const formatted = rows.map(u => ({
      data: {
        id: u.id,
        name: u.name,
        lastName: u.last_name,
        role: u.role,
        documentNumber: u.document_number,
        email: u.email
      }
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

// GET: Obtener usuario por ID o documento
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, document_number, email, name, last_name, role 
      FROM users 
      WHERE id::text = $1 OR document_number = $1
    `;
    const { rows } = await pool.query(query, [id]);

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
        role: u.role
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
    const role = 'CLIENTE';
    const password = bodyData.password || 'password123';

    const insertQuery = `
      INSERT INTO users (document_number, email, name, last_name, role, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, document_number, email, name, last_name, role
    `;
    const values = [documentNumber, email, name, lastName, role, password];
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
        role: createdUser.role
      }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
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

    const findQuery = 'SELECT * FROM users WHERE id::text = $1 OR document_number = $1';
    const userResult = await pool.query(findQuery, [id]);

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

    const updateQuery = `
      UPDATE users 
      SET document_number = $1, email = $2, name = $3, last_name = $4, role = $5, password_hash = $6
      WHERE id = $7
      RETURNING id, document_number, email, name, last_name, role
    `;
    const updateResult = await pool.query(updateQuery, [newDoc, newEmail, newName, newLastName, newRole, newPass, current.id]);
    const u = updateResult.rows[0];

    res.json({
      message: 'Usuario actualizado exitosamente',
      data: {
        id: u.id,
        documentNumber: u.document_number,
        email: u.email,
        name: u.name,
        lastName: u.last_name,
        role: u.role
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
    const deleteQuery = 'DELETE FROM users WHERE id::text = $1 OR document_number = $1 RETURNING id, name, last_name';
    const result = await pool.query(deleteQuery, [id]);

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
