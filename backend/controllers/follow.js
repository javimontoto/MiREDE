'use strict'

//var path = require('path');
//var fs = require('fs'); // librería de NodeJS para trabajar con arvhivos
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');

/*** Método de prueba ***/
function prueba(req, res){
	res.status(200).send({message: 'Hola mundo desde el controlador Follow'});
}

/*** Método para seguir a un usuario ***/
function saveFollow(req, res){
	var params = req.body;

	var follow = new Follow();
	follow.user = req.user.sub;
	follow.followed = params.followed;

	Follow.findOne({user:follow.user,followed:follow.followed}, (err, result) => { // evitamos duplicados
		if(err) return res.status(500).send({message: 'ERROR al guardar el follow!!!'});
		if(result) return res.status(200).send({message: 'YA está siguiendo a ese usuario!!!'});
		follow.save((err, followStored) => {
			if(err) return res.status(500).send({message: 'ERROR al guardar el follow!!!'});
			if(!followStored) return res.status(404).send({message: 'ERROR el follow no se ha guardado!!!'});

			return res.status(200).send({follow: followStored});
		});
	});
}

/*** Método para dejar de seguir a un usuario ***/
function deleteFollow(req, res){
	var user_id = req.user.sub;
	var follow_id = req.params.id;

	Follow.find({'user':user_id, 'followed':follow_id}).remove(err => {
		if(err) return res.status(500).send({message: 'ERROR al borrar el follow!!!'});
		return res.status(200).send({message: 'El follow se ha eliminado'});
	});
}

/***	
*	Método paginado para listar usuarios seguidos, por defecto del usuario actual,
*	pero si recibe un id por url, serían los seguidos por ese usuario 
***/
function getFollowingUsers(req, res){
	var user_id = req.user.sub;
	var page = 1;

	if(req.params.id && req.params.page){
		user_id = req.params.id;
		page = req.params.page;
	}
	if(req.params.id){
		if(req.params.id.length>=4){ // el id es un string largo
			user_id = req.params.id;
		}else{
			page = req.params.id;
		}
	}

	var items_per_page = 3;

	// con populate() lo que hacemos es recuperar el usuario seguido completo
	Follow.find({user:user_id}).populate('followed', 'name surname _id').paginate(page, items_per_page, (err, follows, total) => {
		if(err) return res.status(500).send({message: 'ERROR en el servidor!!!'});
		if(total == 0) return res.status(404).send({message: 'NO sigues a ningún usuario!!!'});

		return res.status(200).send({
			total : total,
			pages : Math.ceil(total/items_per_page),
			follows : follows
		});
	});
}

/*** Método paginado para sacar los usuarios que nos siguen ***/
function getFollowedUsers(req, res){
	var user_id = req.user.sub;
	var page = 1;

	if(req.params.id && req.params.page){
		user_id = req.params.id;
		page = req.params.page;
	}
	if(req.params.id){
		if(req.params.id.length>=4){ // el id es un string largo
			user_id = req.params.id;
		}else{
			page = req.params.id;
		}
	}

	var items_per_page = 3;

	// con populate() lo que hacemos es recuperar el usuario seguido completo
	Follow.find({followed:user_id}).populate('user', 'name surname _id').paginate(page, items_per_page, (err, follows, total) => {
		if(err) return res.status(500).send({message: 'ERROR en el servidor!!!'});
		if(total == 0) return res.status(404).send({message: 'NO te sigue ningún usuario!!!'});

		return res.status(200).send({
			total : total,
			pages : Math.ceil(total/items_per_page),
			follows : follows
		});
	});
}

/*** Método no paginado para listar los usuarios que estoy siguiendo ***/
function getMyFollows(req, res){
	var user_id = req.user.sub;

	Follow.find({user: user_id}).populate('user followed', 'name surname _id').exec((err, follows) => {
		if(err) return res.status(500).send({message: 'ERROR en el servidor!!!'});
		if(follows.length == 0) return res.status(404).send({message: 'NO sigues a ningún usuario!!!'});

		return res.status(200).send({follows});
	});
}

/*** Método no paginado para listar los usuarios que nos están siguiendo ***/
function getFollowBacks(req, res){
	var user_id = req.user.sub;

	Follow.find({followed: user_id}).populate('user followed', 'name surname _id').exec((err, follows) => {
		if(err) return res.status(500).send({message: 'ERROR en el servidor!!!'});
		if(follows.length == 0) return res.status(404).send({message: 'NO te sigue ningún usuario!!!'});

		return res.status(200).send({follows});
	});
}

module.exports = {
	prueba,
	saveFollow,
	deleteFollow,
	getFollowingUsers,
	getFollowedUsers,
	getMyFollows,
	getFollowBacks,
}