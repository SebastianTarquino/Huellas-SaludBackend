const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const seedData = require('../data/seedData');
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

router.get('/announcement/list-announcements', (req, res) => {
  const formatted = seedData.announcements.map(ann => ({
    data: ann,
    meta: {
      nameUserCreated: ann.nameUserCreated || 'Usuario',
      emailUserCreated: ann.emailUserCreated || 'user@huellassalud.com',
      roleUserCreated: ann.roleUserCreated || 'CLIENTE'
    }
  }));
  res.json(formatted);
});

router.post('/announcement/create', (req, res) => {
  const bodyData = req.body.data || req.body;
  const newAnn = {
    idAnnouncement: 'ann-' + Date.now(),
    description: bodyData.description || 'Sin descripción',
    cellPhone: bodyData.cellPhone || '',
    status: true,
    nameUserCreated: bodyData.nameUserCreated || req.body.nameUserCreated || 'Usuario',
    emailUserCreated: bodyData.emailUserCreated || req.body.emailUserCreated || 'user@huellassalud.com',
    roleUserCreated: bodyData.roleUserCreated || req.body.roleUserCreated || 'CLIENTE',
    imagePath: null,
    imageDataUrl: bodyData.imageBase64 || bodyData.imageDataUrl || null,
    imageUrl: null,
    updatedAt: Date.now()
  };
  seedData.announcements.push(newAnn);
  console.log('[Create Announcement] Created:', newAnn.idAnnouncement, 'Has Image:', !!newAnn.imageDataUrl);
  res.status(201).json({ status: 'success', data: newAnn });
});

router.put('/announcement/:id', (req, res) => {
  const idx = seedData.announcements.findIndex(a => a.idAnnouncement.toLowerCase() == req.params.id.toLowerCase());
  if (idx === -1) return res.status(404).json({ message: 'Anuncio no encontrado' });
  
  const bodyData = req.body.data || req.body;
  
  seedData.announcements[idx] = { 
    ...seedData.announcements[idx], 
    ...bodyData,
    updatedAt: Date.now()
  };
  if (bodyData.imageBase64) {
    seedData.announcements[idx].imageDataUrl = bodyData.imageBase64;
  }
  
  res.json({ message: 'Anuncio actualizado exitosamente', data: seedData.announcements[idx] });
});

router.delete('/announcement/:id', (req, res) => {
  const idx = seedData.announcements.findIndex(a => a.idAnnouncement.toLowerCase() == req.params.id.toLowerCase());
  if (idx === -1) return res.status(404).json({ message: 'Anuncio no encontrado' });
  const deleted = seedData.announcements.splice(idx, 1);
  res.json({ message: 'Anuncio eliminado exitosamente', data: deleted[0] });
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

  // 1. Si el anuncio tiene imagen en Base64 en memoria
  if (ann && ann.imageDataUrl) {
    const matches = ann.imageDataUrl.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      const contentType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      res.setHeader('Content-Type', contentType);
      return res.send(buffer);
    }
  }

  // 2. Si el anuncio tiene imagePath físico en disco
  if (ann && ann.imagePath && fs.existsSync(ann.imagePath)) {
    return res.sendFile(path.resolve(ann.imagePath));
  }

  // 3. Si tiene una URL externa directa
  if (ann && ann.imageUrl) {
    return res.redirect(ann.imageUrl);
  }

  // 4. Imagen banner por defecto limpia de mascotas
  res.redirect('https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80');
};

router.get('/avatar-user/Announcement/:id', handleGetAnnouncementImage);
router.get('/avatar-user/announcement/:id', handleGetAnnouncementImage);

module.exports = router;
