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

server.start(controller.dispatch, handle);

