/**
* @author Supal Dubey
* http://roadtobe.com/supaldubey/
**/

var server = require('./server');	
var controller = require("./controller");
var urlResponseHandlers = require("./urlResponseHandlers");

var handle = {};
  
handle["/"] = urlResponseHandlers.autenticar;
handle["/index"] = urlResponseHandlers.index;
handle["/idtren"] = urlResponseHandlers.obtenerTrenCodigo;
handle["/trenesFecha"] = urlResponseHandlers.obtenerTrenesFecha;
handle["/posicion"] = urlResponseHandlers.anadirPosicion;
handle["/registrar"] = urlResponseHandlers.registrarCliente;
handle["/autenticar"] = urlResponseHandlers.autenticar;


server.start(controller.dispatch, handle);

