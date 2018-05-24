/* Fichero para configuración de Express */

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

/***	Cargar Rutas 	***/
var user_routes = require('./routes/user');
var follow_routes = require('./routes/follow');
var publication_routes = require('./routes/publication');
var message_routes = require('./routes/message');


/****	Middlewares 	***/ 
//--> necesario para el bodyParser --> convierte lo que llegue en json
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


/****	Cors 	***/
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
});


/****	Rutas	***/
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);
app.use('/api', message_routes);


/* Al principio lo pusimos así:
app.get('/', (req, res) => {
	res.status(200).send({
		message: 'Hola Mundo desde el servidor de NodeJS'
	});
});

app.post('/pruebas', (req, res) => {
	//console.log(req.body);
	res.status(200).send({
		message: 'Acción de pruebas en el servidor de Nodejs'
	});
});*/


/****	Exportar 	***/
module.exports = app;