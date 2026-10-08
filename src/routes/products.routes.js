const express = require('express');
const pool = require('../config/db');
const router = express.Router();

const formatProduct = (p) => ({
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

// GET: Listar productos
router.get('/product/list-products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id ASC');
    const formatted = rows.map(formatProduct);
    res.json(formatted);
  } catch (error) {
    console.error('Error al listar productos desde DB:', error);
    res.status(500).json({ message: 'Error al consultar la base de datos', error: error.message });
  }
});

// GET: Detalle por ID
router.get('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM products WHERE id::text = $1', [id.toString().trim()]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(formatProduct(rows[0]));
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
    const category = bodyData.category || 'General';
    const animalType = bodyData.animalType || bodyData.animal_type || 'Mascotas';
    const description = bodyData.description || '';
    const price = bodyData.price || 0;
    const stock = bodyData.stock || 10;
    const imageUrl = bodyData.image_url || bodyData.imageUrl || (bodyData.mediaFile ? bodyData.mediaFile.attachment : null);

    const insertQuery = `
      INSERT INTO products (name, category, animal_type, description, price, stock, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const { rows } = await pool.query(insertQuery, [name, category, animalType, description, price, stock, imageUrl]);
    const p = rows[0];

    res.status(201).json({
      message: 'Producto creado exitosamente',
      ...formatProduct(p)
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

router.post('/product/create', createProductHandler);
router.post('/product/create-product', createProductHandler);

// PUT: Actualizar producto por ID
router.put('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bodyData = req.body.data || req.body;

    const { rows: current } = await pool.query('SELECT * FROM products WHERE id::text = $1', [id.toString().trim()]);
    if (current.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const old = current[0];
    const name = bodyData.name ?? old.name;
    const category = bodyData.category ?? old.category;
    const animalType = bodyData.animalType ?? bodyData.animal_type ?? old.animal_type;
    const description = bodyData.description ?? old.description;
    const price = bodyData.price ?? old.price;
    const stock = bodyData.stock ?? old.stock;
    const imageUrl = bodyData.imageUrl ?? bodyData.image_url ?? (bodyData.mediaFile ? bodyData.mediaFile.attachment : old.image_url);

    const updateQuery = `
      UPDATE products
      SET name = $1, category = $2, animal_type = $3, description = $4, price = $5, stock = $6, image_url = $7
      WHERE id = $8
      RETURNING *
    `;
    const { rows } = await pool.query(updateQuery, [name, category, animalType, description, price, stock, imageUrl, old.id]);
    const p = rows[0];

    res.json({
      message: 'Producto actualizado exitosamente',
      ...formatProduct(p)
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
    const { rows } = await pool.query('DELETE FROM products WHERE id::text = $1 RETURNING *', [id.toString().trim()]);
    
    // Si no existia en BD (o era un id simulado), responder 200 para removerlo del cliente
    if (rows.length === 0) {
      return res.json({ message: 'Producto eliminado exitosamente', data: { id } });
    }
    
    res.json({ message: 'Producto eliminado exitosamente', data: rows[0] });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

module.exports = router;
