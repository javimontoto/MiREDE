'use strict'

var mongoosePaginate = require('mongoose-pagination');
var moment = require('moment');

var User = require ('../models/user');
var Follow = require ('../models/follow');
var Message = require ('../models/message');


/*** Método para pruebas ***/
function pruebasMessage(req, res){
	res.status(200).send({message: 'Saludos desde el contralador de Messages'});
}

/*** Método que envía lo mensajes entre los usuarios ***/
function saveMessage(req, res){
	var params = req.body;

	if(!params.text || !params.receiver) return res.status(200).send({message: 'ERROR: Envía los datos necesarios!!!'});

	var message = new Message();
	message.emitter = req.user.sub;
	message.receiver = params.receiver;
	message.text = params.text;
	message.created_at = moment().unix();
	message.viewed = false;

	message.save((err, messageStored) => {
		if(err) return res.status(500).send({message: 'ERROR en la petición!!!'});
		if(!messageStored) return res.status(404).send({message: 'ERROR al enviar el mensaje!!!'});

		return res.status(200).send({message: messageStored});
	});
}

/*** Método para listar los mensajes recibidos ***/
function getReceivedMessages(req, res){
	var user_id = req.user.sub;

	var page = 1;
	if (req.params.page) {
		page = req.params.page;
	}

	var items_per_page = 4;

	Message.find({receiver: user_id}).populate('emitter', '_id name surname nick image').paginate(page, items_per_page, (err, messages, total) => {
		if(err) return res.status(500).send({message: 'ERROR en la petición!!!'});
		if(total == 0) return res.status(404).send({message: 'No hay mensajes recibidos'});

		return res.status(200).send({
			total : total,
			pages : Math.ceil(total/items_per_page),
			messages : messages
		});
	});
}

/*** Método para listar los mensajes enviados ***/
function getEmittedMessages(req, res){
	var user_id = req.user.sub;

	var page = 1;
	if (req.params.page) {
		page = req.params.page;
	}

	var items_per_page = 4;

	Message.find({emitter: user_id}).populate('emitter receiver', '_id name surname nick image').paginate(page, items_per_page, (err, messages, total) => {
		if(err) return res.status(500).send({message: 'ERROR en la petición!!!'});
		if(total == 0) return res.status(404).send({message: 'No hay mensajes recibidos'});

		return res.status(200).send({
			total : total,
			pages : Math.ceil(total/items_per_page),
			messages : messages
		});
	});
}

/*** Método para listar los mensajes no leidos ***/
function getUnviewedMessages(req, res){
	var user_id = req.user.sub;

	var page = 1;
	if (req.params.page) {
		page = req.params.page;
	}

	var items_per_page = 4;

	Message.find({receiver: user_id, viewed: false}).populate('emitter receiver', '_id name surname nick image').paginate(page, items_per_page, (err, messages, total) => {
		if(err) return res.status(500).send({message: 'ERROR en la petición!!!'});
		if(total == 0) return res.status(404).send({message: 'No hay mensajes no leidos'});

		return res.status(200).send({
			total : total,
			pages : Math.ceil(total/items_per_page),
			messages : messages
		});
	});
}

/*** Método para contar los mensajes no leidos ***/
function countUnviewedMessages(req, res){
	var user_id = req.user.sub;

	Message.count({receiver: user_id, viewed: false}).exec((err, count) => {
		if(err) return res.status(500).send({message: 'ERROR en la petición!!!'});
		//if(count == 0) return res.status(404).send({message: 'No hay mensajes no leidos'});

		return res.status(200).send({
			'unviewed' : count
			});
	});
}

/*** Método para marcar como leidos los mensajes ***/
function setViewedMessages(req, res){
	var user_id = req.user.sub;

	// con "multi" actualiza todos los documentos
	Message.update({receiver: user_id, viewed: false}, {viewed: true}, {'multi':true}).exec((err, messagesUpdated) => {
		if(err) return res.status(500).send({message: 'ERROR en la petición!!!'});

		return res.status(200).send({
			messages : messagesUpdated
		});
	});
}

module.exports = {
	pruebasMessage,
	saveMessage,
	getReceivedMessages,
	getEmittedMessages,
	getUnviewedMessages,
	countUnviewedMessages,
	setViewedMessages
}