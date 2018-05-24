'use strict'

var express = require('express');
var PublicacionController = require('../controllers/publication');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/publications/'});

api.get('/probando-pub', md_auth.ensureAuth, PublicacionController.probando);
api.post('/publication', md_auth.ensureAuth, PublicacionController.savePublication);
api.get('/publications/:page?', md_auth.ensureAuth, PublicacionController.getPublications);
api.get('/publication/:id', md_auth.ensureAuth, PublicacionController.getPublication);
api.delete('/publication/:id', md_auth.ensureAuth, PublicacionController.deletePublication);
api.post('/upload-image-pub/:id', [md_auth.ensureAuth,md_upload], PublicacionController.uploadImage);
api.get('/get-image-pub/:imageFile', PublicacionController.getImageFile);


module.exports = api;