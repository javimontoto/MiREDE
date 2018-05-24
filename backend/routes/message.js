'use strict'

var express = require('express');
var MessageController = require('../controllers/message');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');


//** RUTAS **//
api.get('/pruebas-msg', md_auth.ensureAuth, MessageController.pruebasMessage);
api.post('/message', md_auth.ensureAuth, MessageController.saveMessage);
api.get('/my-messages/:page?', md_auth.ensureAuth, MessageController.getReceivedMessages);
api.get('/messages/:page?', md_auth.ensureAuth, MessageController.getEmittedMessages);
api.get('/unviewed-messages/:page?', md_auth.ensureAuth, MessageController.getUnviewedMessages);
api.get('/count-unviewed-messages', md_auth.ensureAuth, MessageController.countUnviewedMessages);
api.get('/set-viewed-messages', md_auth.ensureAuth, MessageController.setViewedMessages);

//** FIN RUTAS **//

module.exports = api;