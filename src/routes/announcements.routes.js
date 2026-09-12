const express = require('express');
const multer = require('multer');
const path = require('path');
const seedData = require('../data/seedData');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.get('/announcement/list-announcements', (req, res) => {
  const formatted = seedData.announcements.map(ann => ({
    data: ann,
    meta: {
      nameUserCreated: ann.nameUserCreated,
      emailUserCreated: ann.emailUserCreated,
      roleUserCreated: ann.roleUserCreated
    }
  }));
  res.json(formatted);
});

router.post('/announcement/create', (req, res) => {
  const { data } = req.body || {};
  const newAnn = {
    idAnnouncement: 'ann-' + (seedData.announcements.length + 1),
    description: data?.description || 'Sin descripción',
    cellPhone: data?.cellPhone || '',
    status: true,
    nameUserCreated: 'Usuario',
    emailUserCreated: 'user@huellassalud.com',
    roleUserCreated: 'CLIENTE'
  };
  seedData.announcements.push(newAnn);
  res.status(201).json({ status: 'success', data: newAnn });
});

router.post('/avatar-user/announcement/:id', upload.single('fileUpload'), (req, res) => {
  res.json({ message: 'Imagen subida con éxito', file: req.file });
});

router.get('/avatar-user/Announcement/:id', (req, res) => {
  res.status(404).send('Imagen no encontrada');
});

module.exports = router;
