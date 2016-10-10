/**
* @author Supal Dubey
* http://roadtobe.com/supaldubey/
**/

var http = require('http'),
	Stomp = require('stomp-client'),
	cluster = require('cluster'),
    url = require('url');

var destino = '/topic/jms.topic.test';
var cliente;

function start(dispatch, handlers)
{
	if(cluster.isMaster)
	{
		http.createServer(function(req, res) {
		var _url = url.parse(req.url).pathname;
		dispatch(handlers, _url, req, res);
		}).listen(8888);
		console.log("Server started !! ");
		cluster.fork();

	}
	else
	{
		client = new Stomp('130.206.138.15', 61613, '','');

		client.connect(function(sessionId) {
		    client.subscribe(destino, function(body, headers) {
		      //Obtengo mensajes de la posicion de los trenes y almacenaría en la base de datos

		    });

		    //client.publish(destination, 'Oh herrow');
		});
	}
	

	

	
}

exports.start = start;