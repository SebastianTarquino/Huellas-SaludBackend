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
    idAnnouncement: 'ann-' + (seedData.announcements.length + 1),
    description: bodyData.description || 'Sin descripción',
    cellPhone: bodyData.cellPhone || '',
    status: true,
    nameUserCreated: bodyData.nameUserCreated || req.body.nameUserCreated || 'Usuario',
    emailUserCreated: bodyData.emailUserCreated || req.body.emailUserCreated || 'user@huellassalud.com',
    roleUserCreated: bodyData.roleUserCreated || req.body.roleUserCreated || 'CLIENTE'
  };
  seedData.announcements.push(newAnn);
  res.status(201).json({ status: 'success', data: newAnn });
});

router.put('/announcement/:id', (req, res) => {
  const idx = seedData.announcements.findIndex(a => a.idAnnouncement == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Anuncio no encontrado' });
  seedData.announcements[idx] = { ...seedData.announcements[idx], ...req.body };
  res.json({ message: 'Anuncio actualizado exitosamente', data: seedData.announcements[idx] });
});

router.delete('/announcement/:id', (req, res) => {
  const idx = seedData.announcements.findIndex(a => a.idAnnouncement.toLowerCase() == req.params.id.toLowerCase());
  if (idx === -1) return res.status(404).json({ message: 'Anuncio no encontrado' });
  const deleted = seedData.announcements.splice(idx, 1);
  res.json({ message: 'Anuncio eliminado exitosamente', data: deleted[0] });
});

// Guardar imagen subida
router.post('/avatar-user/announcement/:id', upload.single('fileUpload'), (req, res) => {
  const ann = seedData.announcements.find(a => a.idAnnouncement == req.params.id);
  if (ann && req.file) {
    ann.imagePath = req.file.path;
  }
  res.json({ message: 'Imagen subida con éxito', file: req.file });
});

// Servir la imagen del anuncio (Soporta /Announcement/:id y /announcement/:id)
const handleGetAnnouncementImage = (req, res) => {
  const ann = seedData.announcements.find(a => a.idAnnouncement.toLowerCase() == req.params.id.toLowerCase());
  if (ann && ann.imagePath && fs.existsSync(ann.imagePath)) {
    return res.sendFile(path.resolve(ann.imagePath));
  }
  // Si tiene un URL directo guardado
  if (ann && ann.imageUrl) {
    return res.redirect(ann.imageUrl);
  }
  // Imagen por defecto si no ha subido una personalizada
  res.redirect('https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80');
};

router.get('/avatar-user/Announcement/:id', handleGetAnnouncementImage);
router.get('/avatar-user/announcement/:id', handleGetAnnouncementImage);

module.exports = router;
