/**
* @author Supal Dubey
* http://roadtobe.com/supaldubey/
**/

var http = require('http'),
	Stomp = require('stomp-client'),
	cluster = require('cluster'),
	pg = require('pg'),
    url = require('url');

/*var config = {
  user: 'kevin', //env var: PGUSER
  database: 'giv2rail', //env var: PGDATABASE
  password: 'kevin', //env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};*/

//var pool = new pg.Pool(config);

/*var destino = '/topic/jms.topic.test';
var cliente;*/

function start(dispatch, handlers)
{
	/*if(cluster.isMaster)
	{*/
		http.createServer(function(req, res) {
		var _url = url.parse(req.url).pathname;
		dispatch(handlers, _url, req, res);
		}).listen(8000);
		console.log("Server started !! ");
		//cluster.fork();

	/*}
	else
	{
		client = new Stomp('130.206.138.15', 61613, '','');

		client.connect(function(sessionId) {
		    client.subscribe(destino, function(body, headers) {
		    	var jsonObj = JSON.parse(body);
		      	//Obtengo mensajes de la posicion de los trenes y almacenaría en la base de datos
		      	pool.connect(function(err, client, done) {
				  if(err) {
				    return console.error('Error al obtener un cliente de la "piscina"', err);
				  }
				  client.query('INSERT INTO Posiciones(latitud, longitud, id_trenasoc) values($1, $2, $3)',
    				   [jsonObj.latitud, jsonObj.longitud, jsonObj.idtren]);
				  //console.log("añadido");
				  /*client.query("SELECT * FROM Trenes WHERE id_tren='tren1'", function(err, result) {
				    //call `done()` to release the client back to the pool
				    console.log(result.rowCount);
				    done();

				    if(err) {
				      return console.error('Error al realizar la inserción de una posición', err);
				    }
				    //output: 1
				  });
				  
				});
		    });

		    //client.publish(destination, 'Oh herrow');
		});
	}*/
}

/*pool.on('error', function (err, client) {
  console.error('Error en el cliente en standby', err.message, err.stack)
});*/

exports.start = start;
