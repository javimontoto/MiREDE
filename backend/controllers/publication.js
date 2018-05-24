'use strict'

var path = require('path');
var fs = require('fs'); // librería de NodeJS para trabajar con arvhivos
var mongoosePaginate = require('mongoose-pagination');
var moment = require('moment');

var Publication = require('../models/publication');
var Follow = require('../models/follow');
var User = require('../models/user');



/*** Método de pruebas ***/
function probando(req, res){
	res.status(200).send({message: 'Hola desde el controlador de Publicaciones'});
}

/*** Método para guardar nuevas publicaciones ***/
function savePublication(req, res){
	var params = req.body;

	/*
	text: String,
	file: String,
	created_at: String,
	user: { type: Schema.ObjectId, ref: 'User' }
	*/

	if(!params.text) return res.status(200).send({message: 'ERROR: Debes enviar un texto'});
	var publication = new Publication();
	publication.text = params.text;
	publication.file = null;
	publication.user = req.user.sub;
	publication.created_at = moment().unix();

	publication.save((err, publicationStored) => {
		if(err) return res.status(500).send({message: 'ERROR al guardar la publicación!!!'});
		if(!publicationStored) return res.status(404).send({message: 'ERROR: la publicación no ha sido guardada'});

		return res.status(200).send({publicationStored});
	});
}

/*** Método para devolver las publicaciones de los usuarios que estoy siguiendo ***/
function getPublications(req, res){

	var page = 1;
	if(req.params.page){
		page = req.params.page;
	}

	var items_per_page = 4;

	Follow.find({user: req.user.sub}).populate('followed', 'name surname _id').exec((err,follows) => {
		if(err) return res.status(500).send({message: 'ERROR al devolver el seguimiento!!!'});

		var follows_clean = [];

		follows.forEach((follow) => {
			follows_clean.push(follow.followed);
		});

		Publication.find({user: {'$in': follows_clean}}).sort('-created_at').populate('user', 'name surname _id').paginate(page, items_per_page, (err, publications, total) => {
			if(err) return res.status(500).send({message: 'ERROR al devolver publicaciones!!!'});
			if(total == 0) return res.status(404).send({message: 'NO hay publicaciones'});

			return res.status(200).send({
				total_items: total,
				pages: Math.ceil(total/items_per_page),
				page: page,
				publications
			})
		});
	});
}

/*** Método para devolver una publicación por su id ***/
function getPublication(req, res){
	var publication_id = req.params.id;

	Publication.findById(publication_id, (err, publication) => {
		if(err) return res.status(500).send({message: 'ERROR al devolver la publicacion!!!'});
		if(publication.length == 0) res.status(404).send({message: 'NO existe la publiación!!'});

		return res.status(200).send({publication});
	});
}

function deletePublication(req, res){
	var publication_id = req.params.id;

	Publication.findOneAndRemove({user: req.user.sub, '_id':publication_id},(err, publicationRemoved) => {
		if(err) return res.status(500).send({message: 'ERROR al borrar la publicacion!!!'});
		if(!publicationRemoved) res.status(404).send({message: 'NO se ha borrado la publicación!! Comprueba que seas su autor.'});

		return res.status(200).send({message: 'Publicación eliminada correctamente'});
	});
}

/*** Método para subir archivos a la publicación ***/
function uploadImage(req, res){
	var publication_id = req.params.id;

	if(req.files){ //comprobamos que hay archivos para subir
		var file_path = req.files.image.path;
		var file_split = file_path.split('\\'); // devuelve un array con los elementos separados donde había una '\'

		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){

			Publication.findOne({'user': req.user.sub, '_id':publication_id}).exec((err, publication) => {
				if (publication){
					Publication.findByIdAndUpdate(publication_id, {file: file_name}, {new:true}, (err, publicationUpdated) => {
						if(err) return res.status(500).send({message: 'Error en la petición!!'});
						if(!publicationUpdated) return res.status(404).send({message: 'NO se ha podido actualizar la publicación!!'});

						return res.status(200).send({publication: publicationUpdated});
					});
				}else{
					return removeFilesUploads(res, file_path, 'No tienes permiso para actualizar esta publicación!!');
				}
			});

		} else {
			return removeFilesUploads(res, file_path, 'Extensión no válida!!');
		}

	} else {
		return res.status(200).send({message: 'NO se han subido archivos!!!'});
	}
}

/*** Método para mostrar el archivo de la publicación ***/
function getImageFile(req, res){
	var image_file = req.params.imageFile;
	var path_file = './uploads/publications/'+image_file;

	fs.exists(path_file, (exists) => {
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({message: 'NO existe la imagen!!!'});
		}
	});
}


module.exports = {
	probando,
	savePublication,
	getPublications,
	getPublication,
	deletePublication,
	uploadImage,
	getImageFile,
}


//** FUNCIONES AUXILIARES **//

/*** Método auxiliar para borrar ficheros subidos ***/
function removeFilesUploads(res, file_path, message){
	fs.unlink(file_path, (err) => {
		return res.status(200).send({message: message});
	});
}