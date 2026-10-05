const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const seedData = require('../data/seedData');
const db = require('../config/db'); // 👈 Importamos la conexión a PostgreSQL

const router = express.Router();

// Crear directorio uploads si no existe
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Auto-migración segura para tabla announcements en PostgreSQL
db.query(`
  CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(100) PRIMARY KEY,
    description TEXT NOT NULL,
    cell_phone VARCHAR(20),
    status BOOLEAN DEFAULT TRUE,
    name_user_created VARCHAR(100),
    email_user_created VARCHAR(100),
    role_user_created VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ALTER TABLE announcements ADD COLUMN IF NOT EXISTS name_user_created VARCHAR(100);
  ALTER TABLE announcements ADD COLUMN IF NOT EXISTS email_user_created VARCHAR(100);
  ALTER TABLE announcements ADD COLUMN IF NOT EXISTS role_user_created VARCHAR(30);
  ALTER TABLE announcements ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
`).catch(err => console.error('[Announcements Schema Init Error]:', err.message));

// 1. OBTENER ANUNCIOS (Consulta a PostgreSQL con respaldo en seedData)
router.get('/announcement/list-announcements', async (req, res) => {
  try {
    let result;
    try {
      result = await db.query('SELECT * FROM announcements ORDER BY created_at DESC');
    } catch (orderErr) {
      console.warn('[Get Announcements DB Order Warning]:', orderErr.message);
      result = await db.query('SELECT * FROM announcements');
    }

    if (result.rows && result.rows.length > 0) {
      const formatted = result.rows.map(ann => ({
        data: {
          idAnnouncement: ann.id,
          description: ann.description,
          cellPhone: ann.cell_phone,
          status: ann.status,
          nameUserCreated: ann.name_user_created || 'Usuario',
          emailUserCreated: ann.email_user_created || 'user@huellassalud.com',
          roleUserCreated: ann.role_user_created || 'CLIENTE',
          imageDataUrl: ann.image_data_url || null
        },
        meta: {
          nameUserCreated: ann.name_user_created || 'Usuario',
          emailUserCreated: ann.email_user_created || 'user@huellassalud.com',
          roleUserCreated: ann.role_user_created || 'CLIENTE'
        }
      }));
      return res.json(formatted);
    }
  } catch (err) {
    console.error('[Get Announcements DB Error]:', err.message);
  }

  // Fallback a seedData si la BD aún no tiene registros o falla la red
  const formattedSeed = seedData.announcements.map(ann => ({
    data: ann,
    meta: {
      nameUserCreated: ann.nameUserCreated || 'Usuario',
      emailUserCreated: ann.emailUserCreated || 'user@huellassalud.com',
      roleUserCreated: ann.roleUserCreated || 'CLIENTE'
    }
  }));
  res.json(formattedSeed);
});

// 2. CREAR ANUNCIO (Inserta en PostgreSQL guardando el nombre del usuario)
router.post('/announcement/create', async (req, res) => {
  const bodyData = req.body.data || req.body;
  const newAnn = {
    idAnnouncement: bodyData.idAnnouncement || ('ann-' + Date.now()),
    description: bodyData.description || 'Sin descripción',
    cellPhone: bodyData.cellPhone || '',
    status: true,
    nameUserCreated: bodyData.nameUserCreated || req.body.nameUserCreated || 'Usuario',
    emailUserCreated: bodyData.emailUserCreated || req.body.emailUserCreated || 'user@huellassalud.com',
    roleUserCreated: bodyData.roleUserCreated || req.body.roleUserCreated || 'CLIENTE',
    imageDataUrl: bodyData.imageBase64 || bodyData.imageDataUrl || null
  };

  try {
    // Guardar en PostgreSQL incluyendo name_user_created, email_user_created y role_user_created
    await db.query(
      `INSERT INTO announcements (id, description, cell_phone, status, name_user_created, email_user_created, role_user_created) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET 
         description = EXCLUDED.description, 
         cell_phone = EXCLUDED.cell_phone,
         name_user_created = EXCLUDED.name_user_created,
         email_user_created = EXCLUDED.email_user_created,
         role_user_created = EXCLUDED.role_user_created`,
      [
        newAnn.idAnnouncement, 
        newAnn.description, 
        newAnn.cellPhone, 
        newAnn.status,
        newAnn.nameUserCreated,
        newAnn.emailUserCreated,
        newAnn.roleUserCreated
      ]
    );

    console.log('[Create Announcement DB] Guardado en PostgreSQL con autor:', newAnn.nameUserCreated);
  } catch (err) {
    console.error('[Create Announcement DB Error]:', err.message);
  }

  // Guardar en memoria para mantener sincronizado
  seedData.announcements.push(newAnn);
  res.status(201).json({ status: 'success', data: newAnn });
});

// 3. ACTUALIZAR ANUNCIO (En PostgreSQL)
router.put('/announcement/:id', async (req, res) => {
  const id = req.params.id;
  const bodyData = req.body.data || req.body;

  try {
    await db.query(
      `UPDATE announcements 
       SET description = COALESCE($1, description), cell_phone = COALESCE($2, cell_phone) 
       WHERE LOWER(id) = LOWER($3)`,
      [bodyData.description, bodyData.cellPhone, id]
    );
  } catch (err) {
    console.error('[Update Announcement DB Error]:', err.message);
  }

  const idx = seedData.announcements.findIndex(a => a.idAnnouncement.toLowerCase() == id.toLowerCase());
  if (idx !== -1) {
    seedData.announcements[idx] = { 
      ...seedData.announcements[idx], 
      ...bodyData,
      updatedAt: Date.now()
    };
  }

  res.json({ message: 'Anuncio actualizado exitosamente' });
});

// 4. ELIMINAR ANUNCIO (En PostgreSQL)
router.delete('/announcement/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await db.query('DELETE FROM announcements WHERE LOWER(id) = LOWER($1)', [id]);
  } catch (err) {
    console.error('[Delete Announcement DB Error]:', err.message);
  }

  const idx = seedData.announcements.findIndex(a => a.idAnnouncement.toLowerCase() == id.toLowerCase());
  if (idx !== -1) {
    seedData.announcements.splice(idx, 1);
  }

  res.json({ message: 'Anuncio eliminado exitosamente' });
});

// Guardar imagen subida (Multipart/form-data)
const handleUploadImage = (req, res) => {
  const annId = req.params.id.toLowerCase();
  const ann = seedData.announcements.find(a => a.idAnnouncement.toLowerCase() == annId);

  if (req.file) {
    let base64Data = null;
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const mimeType = req.file.mimetype || 'image/png';
      base64Data = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    } catch (err) {
      console.error('[Upload Image] Error reading file buffer:', err);
    }

    if (ann) {
      ann.imagePath = req.file.path;
      if (base64Data) ann.imageDataUrl = base64Data;
      ann.updatedAt = Date.now();
    }

    return res.json({
      status: 'success',
      message: 'Imagen subida con éxito',
      file: req.file
    });
  }

  res.status(400).json({ status: 'error', message: 'No se recibió ningún archivo' });
};

router.post('/avatar-user/announcement/:id', upload.single('fileUpload'), handleUploadImage);
router.post('/avatar-user/Announcement/:id', upload.single('fileUpload'), handleUploadImage);

// Servir imagen del anuncio
const handleGetAnnouncementImage = (req, res) => {
  const annId = req.params.id.toLowerCase();
  const ann = seedData.announcements.find(a => a.idAnnouncement.toLowerCase() == annId);

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (ann && ann.imageDataUrl) {
    const matches = ann.imageDataUrl.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      const contentType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      res.setHeader('Content-Type', contentType);
      return res.send(buffer);
    }
  }

  if (ann && ann.imagePath && fs.existsSync(ann.imagePath)) {
    return res.sendFile(path.resolve(ann.imagePath));
  }

  if (ann && ann.imageUrl) {
    return res.redirect(ann.imageUrl);
  }

  res.redirect('https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80');
};

router.get('/avatar-user/Announcement/:id', handleGetAnnouncementImage);
router.get('/avatar-user/announcement/:id', handleGetAnnouncementImage);

module.exports = router;
