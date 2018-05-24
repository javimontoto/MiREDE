'use strict'

/* Servicio que nos va a permitir implementar el uso de TOKENS */

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'esta_es_mi_clave_secreta_de_mi_curso_de_red_social'; // string secreto que sólo lo conoce el programador del backend

exports.createToken = function(user){
	var payload = {
		sub: user._id,
		name: user.name,
		surname: user.surname,
		nick: user.nick,
		email: user.email,
		role: user.role,
		image: user.image,
		iat: moment().unix(), // fecha de creación del token
		exp: moment().add(30, 'days').unix() // fecha de expiración
	};

	return jwt.encode(payload, secret); // esto genera un hash
};