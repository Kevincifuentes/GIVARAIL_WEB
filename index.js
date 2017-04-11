/**
* @author Supal Dubey
* http://roadtobe.com/supaldubey/
**/

var server = require('./server');	
var controller = require("./controller");
var urlResponseHandlers = require("./urlResponseHandlers");

var handle = {};
  
handle["/"] = urlResponseHandlers.index;
handle["/index"] = urlResponseHandlers.index;
handle["/idtren"] = urlResponseHandlers.obtenerTrenCodigo;
handle["/idtrenCSV"] = urlResponseHandlers.obtenerTrenCodigoCSV;
handle["/trenesFecha"] = urlResponseHandlers.obtenerTrenesFecha;
handle["/trenesFechaCSV"] = urlResponseHandlers.obtenerTrenesFechaCSV;
handle["/trenesIDFecha"] = urlResponseHandlers.obtenerTrenesCodigoFecha;
handle["/trenesIDFechaCSV"] = urlResponseHandlers.obtenerTrenesCodigoFechaCSV;
handle["/posicion"] = urlResponseHandlers.anadirPosicion;
handle["/registrar"] = urlResponseHandlers.registrarCliente;
handle["/autenticar"] = urlResponseHandlers.autenticar;
handle["/login"] = urlResponseHandlers.login;
handle["/trenes"] = urlResponseHandlers.obtenerTrenes;
handle["/ultimapos"] = urlResponseHandlers.obtenerUltimaPos;
handle["/ultimaActualizacion"] = urlResponseHandlers.ultimaActualizacion;


server.start(controller.dispatch, handle);

