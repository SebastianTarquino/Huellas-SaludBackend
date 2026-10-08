const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// GET: Listar todos los productos desde la base de datos PostgreSQL
router.get('/product/list-products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id ASC');
    const formatted = rows.map(p => ({
      data: {
        idProduct: p.id,
        id: p.id,
        name: p.name,
        category: p.category || 'General',
        animalType: p.animal_type || p.animalType || 'Mascotas',
        description: p.description || '',
        price: Number(p.price) || 0,
        stock: p.stock || 0,
        mediaFile: p.image_url ? {
          fileName: 'product.jpg',
          contentType: 'image/jpeg',
          attachment: p.image_url
        } : null
      }
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error al listar productos desde DB:', error);
    res.status(500).json({ message: 'Error al consultar la base de datos', error: error.message });
  }
});

// GET: Detalle de producto por ID
router.get('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    const p = rows[0];
    res.json({
      data: {
        idProduct: p.id,
        id: p.id,
        name: p.name,
        category: p.category || 'General',
        animalType: p.animal_type || p.animalType || 'Mascotas',
        description: p.description || '',
        price: Number(p.price) || 0,
        stock: p.stock || 0,
        mediaFile: p.image_url ? {
          fileName: 'product.jpg',
          contentType: 'image/jpeg',
          attachment: p.image_url
        } : null
      }
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

// Handler para crear producto
const createProductHandler = async (req, res) => {
  try {
    const bodyData = req.body.data || req.body;
    const name = bodyData.name || 'Nuevo Producto';
    const description = bodyData.description || '';
    const price = bodyData.price || 0;
    const stock = bodyData.stock || 10;
    const imageUrl = bodyData.image_url || bodyData.imageUrl || (bodyData.mediaFile ? bodyData.mediaFile.attachment : null);

    const insertQuery = `
      INSERT INTO products (name, description, price, stock, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const { rows } = await pool.query(insertQuery, [name, description, price, stock, imageUrl]);
    const p = rows[0];

    res.status(201).json({
      message: 'Producto creado exitosamente',
      data: {
        idProduct: p.id,
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        stock: p.stock,
        mediaFile: p.image_url ? {
          fileName: 'product.jpg',
          contentType: 'image/jpeg',
          attachment: p.image_url
        } : null
      }
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// POST: Crear producto (soporta /product/create y /product/create-product)
router.post('/product/create', createProductHandler);
router.post('/product/create-product', createProductHandler);

// PUT: Actualizar producto por ID
router.put('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bodyData = req.body.data || req.body;

    const { rows: current } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (current.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const old = current[0];
    const name = bodyData.name ?? old.name;
    const description = bodyData.description ?? old.description;
    const price = bodyData.price ?? old.price;
    const stock = bodyData.stock ?? old.stock;
    const imageUrl = bodyData.image_url ?? bodyData.imageUrl ?? (bodyData.mediaFile ? bodyData.mediaFile.attachment : old.image_url);

    const updateQuery = `
      UPDATE products
      SET name = $1, description = $2, price = $3, stock = $4, image_url = $5
      WHERE id = $6
      RETURNING *
    `;
    const { rows } = await pool.query(updateQuery, [name, description, price, stock, imageUrl, id]);
    const p = rows[0];

    res.json({
      message: 'Producto actualizado exitosamente',
      data: {
        idProduct: p.id,
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        stock: p.stock,
        mediaFile: p.image_url ? {
          fileName: 'product.jpg',
          contentType: 'image/jpeg',
          attachment: p.image_url
        } : null
      }
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

// DELETE: Eliminar producto por ID
router.delete('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado exitosamente', data: rows[0] });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

module.exports = router;
