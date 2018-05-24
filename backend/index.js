'use strict' //--> permite utilizar nuevas instrucciones de los nuevos estandars de javascript

var mongoose = require('mongoose'); //--> declaramos dependencia con mongoose
var app = require('./app'); //--> configuración de Express
var port = 3800; //--> puerto estático

/* Conexión DataBase */
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/curso_mean_social') //--> definimos la conexión con la base de datos
		.then(() => {  //--> conexión correcta
			console.log("La conexión a la base de datos realizada conrrectamente!!!");

			/* Crear Servidor */
			app.listen(port, () => {
				console.log("Servidor corriendo en el puerto " + String(port));
			});

		})
		.catch(err => console.log(err));  //--> conexión fallida
