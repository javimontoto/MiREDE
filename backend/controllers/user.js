'use strict'

var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs'); // librería de NodeJS para trabajar con arvhivos
var path = require('path');

var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
var jwt = require('../services/jwt'); // servicio de tokens



/*** Método de Inicio ***/
function home(req, res) {
	res.status(200).send({
		message: 'Hola Mundo desde el servidor de NodeJS'
	});
}

/*** Método de Pruebas ***/
function pruebas(req, res) {
	//console.log(req.body);
	res.status(200).send({
		message: 'Acción de pruebas en el servidor de Nodejs'
	});
}

/*** Método para Guardar Usuarios ***/
function saveUser(req, res){
	var params = req.body;
	var user = new User();

	if (params.name && params.surname && params.nick && params.email && params.password){
		user.name = params.name;
		user.surname = params.surname;
		user.nick = params.nick;
		user.email = params.email;
		user.role = 'ROLE_USER';
		user.image = null;

		// Comprobamos que no haya usuarios duplicados
		User.find({ $or: [
			{email: user.email.toLowerCase()},
			{nick: user.nick.toLowerCase()}
			]}).exec((err, users) => {
				if(err) return res.status(500).send({message: 'Error en la petición de usuarios!!'});
				if(users && users.length >= 1){
					return res.status(200).send({message: 'El usuario que intenta registrar ya existe!!'});
				} else {
					// Guardamos la contraseña cifrada
					bcrypt.hash(params.password, null, null, (err, hash) => {
						user.password = hash;

						// Guardamos el usuario
						user.save((err, userStore) => {
							if(err) return res.status(500).send({message: 'Error al guarda el usuario'});
							if(userStore){
								res.status(200).send({user: userStore});
							} else {
								res.status(404).send({message: 'No se ha registrado el usuario'});
							}
						});
					});
				}
			});
	} else {
		res.status(200).send({message: 'Envía todos los campos necesarios!!'});
	}
}

/*** Método para Loguear Usuarios ***/
function loginUser(req, res){
	var params = req.body;

	var email = params.email;
	var password = params.password;

	User.findOne({email: email}, (err, user) => {
		if (err) return res.status(500).send({message: 'Error en la petición!!'});
		if (user){
			bcrypt.compare(password, user.password, (err, check) => {
				if (check){
					if (params.gettoken){ // gettoken es un parametro (true/false) que si está a true indica que queremos el token
						// generar y devolver token
						return res.status(200).send({token: jwt.createToken(user)});
					} else {
						// devolver datos de usuario
						user.password = undefined;
						return res.status(200).send({user});
					}

				} else {
					return res.status(404).send({message: 'Email o contraseña incorrectos!!'});
				}
			});
		} else {
			return res.status(404).send({message: 'Email o contraseña incorrectos!!!!'});
		}
	});
}

/*** Metodo para Sacar Datos de un Usuario ***/
function getUser(req, res){
	var user_id = req.params.id;

	User.findById(user_id, (err, user) => {
		if(err) return res.status(500).send({message: 'Error en la petición!!'});
		if(!user) return res.status(404).send({message: 'El usuario no existe!!'});

		// Compruebo si ya estoy siguiendo al usuario o si me está siguiendo
		/* 	Con el siguiente código comprobamos si lo seguimos, pero para saber si nos sigue
		*	tendríamos que hacer otro callback anidado
		Follow.findOne({user:req.user.sub, followed:user_id}).exec((err, follow) => {
			if(err) return res.status(500).send({message: 'Error en la petición!!'});
			return res.status(200).send({user, follow});
		});*/

		followThisUser(req.user.sub, user_id).then((value) => {
			return res.status(200).send({user, value});
		});
	});
}

/*** Médoto para Devolver un Listado de Usuarios ***/
function getUsers(req, res){
	var identity_user_id = req.user.sub;

	var page = 1; // nos indica en que página estamos, por defecto la 1
	if (req.params.page){
		page = req.params.page;
	}

	var itemsPerPage = 10;
	User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
		if(err) return res.status(500).send({message: 'Error en la petición!!'});
		if(!users) return res.status(404).send({message: 'No hay usuarios disponibles!!'});

		followUserIds(identity_user_id).then((value) => {
			return res.status(200).send({
				users : users,	// --> se puede poner solo users, pq no cambiamos el nombre
				users_followgin : value.following,
				users_follow_me : value.followed,
				total : total,
				pages : Math.ceil(total/itemsPerPage)
			});
		});
	});
}

/*** Método para actualizar datos de Usuario ***/
function updateUser(req, res){
	var userId = req.params.id;
	var update = req.body;

	// borramos la propiedad de password
	delete update.password;

	if(userId != req.user.sub){
		return res.status(500).send({message: 'NO tienes permisos para actualizar los datos del usuario!!'});
	}

	User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) => { // con new indicamos que userUpdated sea el usuario actualizado, sino de devuelve el original
		if(err) return res.status(500).send({message: 'Error en la petición!!'});
		if(!userUpdated) return res.status(404).send({message: 'NO se ha podido actualizar el usuario!!'});

		return res.status(200).send({user: userUpdated});
	});
}

/*** Método para subir archivos/avatar ***/
function uploadImage(req, res){
	var userId = req.params.id;

	if(req.files){ //comprobamos que hay archivos para subir
		//console.log(req.files);
		var file_path = req.files.image.path;
		//console.log(file_path);
		var file_split = file_path.split('\\'); // devuelve un array con los elementos separados donde había una '\'
		//console.log(file_split);

		var file_name = file_split[2];
		//console.log(file_name);

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];
		//console.log(file_ext);

		if(userId != req.user.sub){
			return removeFilesUploads(res, file_path, 'NO tienes permisos para actualizar la imagen!');
		}

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
			//console.log('Extensión válida nos ponemos a trabajar...');
			User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, userUpdated) => {
				if(err) return res.status(500).send({message: 'Error en la petición!!'});
				if(!userUpdated) return res.status(404).send({message: 'NO se ha podido actualizar el usuario!!'});

				return res.status(200).send({user: userUpdated});
			});

		} else {
			return removeFilesUploads(res, file_path, 'Extensión no válida!!');
		}

	} else {
		return res.status(200).send({message: 'NO se han subido archivos!!!'});
	}
}

/*** Método para mostrar imagen del usuario ***/
function getImageFile(req, res){
	var image_file = req.params.imageFile;
	var path_file = './uploads/users/'+image_file;

	fs.exists(path_file, (exists) => {
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({message: 'NO existe la imagen!!!'});
		}
	});
}

/*** Método para sacar los contadores; opcional: id de usuario ***/
function getCounters(req, res){
	var user_id = req.user.sub;

	if(req.params.id){
		user_id = req.params.id;
	}

	getCountFollow(user_id).then((value) => {
		return res.status(200).send({value});
	});
}

module.exports = {
	home,
	pruebas,
	saveUser,
	loginUser, 
	getUser,
	getUsers,
	updateUser,
	uploadImage,
	getImageFile,
	getCounters,
}


//** FUNCIONES AUXILIARES **//

/*** Método auxiliar ASÍNCRONO para los contadores ***/
async function getCountFollow(user_id){
	try{
		var following = await Follow.count({'user':user_id}).exec()
			.then((count) => {
				return count;
			})
			.catch((err) => {
				return handleError(err);
			});

		var followed = await Follow.count({'followed':user_id}).exec()
			.then((count) => {
				return count;
			})
			.catch((err) => {
				return handleError(err);
			});

		var publications = await Publication.count({'user':user_id}).exec()
			.then((count) => {
				return count;
			})
			.catch((err) => {
				return handleError(err);
			});

		return {
			following: following,
			followed: followed,
			publications: publications
		}
	} catch(e){
		console.log(e);
	}
}

/*** Método auxiliar ASÍNCRONO para saber si seguimos a un usuario y si nos sigue ***/
async function followThisUser(identity_user_id, user_id){
	try{
		var following = await Follow.findOne({'user':identity_user_id, 'followed':user_id}).exec()
			.then((following) => {
				return following;
			})
			.catch((err) => {
				return handleError(err);
			});

		var followed = await Follow.findOne({'user':user_id, 'followed':identity_user_id}).exec()
			.then((followed) => {
				return followed;
			})
			.catch((err) => {
				return handleError(err);
			});

		return {
			following: following,
			followed: followed
		}
	} catch(e){
		console.log(e);
	}
}

/*** Método auxiliar ASÍNCRONO para sacar los ids de los usuarios seguidos y que me siguen ***/
async function followUserIds(user_id){
	try{
		// con select 'valor':0 lo que hago es deseleccionar ese campo
		var followings = await Follow.find({'user':user_id}).select({'_id':0, '_v':0, 'user':0}).exec()
			.then((followings) => {
				var follows_clean = [];

				followings.forEach((follow) => {
					follows_clean.push(follow.followed);
				});

				return follows_clean;
			})
			.catch((err) => {
				return handleError(err);
			});

		var followeds = await Follow.find({'followed':user_id}).select({'_id':0, '_v':0, 'followed':0}).exec()
			.then((followeds) => {
				var follows_clean = [];

				followeds.forEach((follow) => {
					follows_clean.push(follow.user);
				});

				return follows_clean;
			})
			.catch((err) => {
				return handleError(err);
			});

		return {
			following: followings,
			followed: followeds
		}

	} catch(e){
		console.log(e);
	}
}

/*** Método auxiliar para borrar ficheros subidos ***/
function removeFilesUploads(res, file_path, message){
	fs.unlink(file_path, (err) => {
		return res.status(200).send({message: message});
	});
}