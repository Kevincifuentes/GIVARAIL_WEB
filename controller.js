/**
* @author Supal Dubey
* http://roadtobe.com/supaldubey/
**/

var staticHandler = require('./staticHandler'),
    path = require('path');

function dispatch(handler, pathname, req, res) {
   console.log("Se va ha enviar el fichero " + pathname);
   //Si exste una entrada para ese path
  if (typeof handler[pathname] === 'function') {
    handler[pathname](res, req, pathname);
  } else {

      //Si no llama a HandleStatic 
    console.log("No se encontro gestor para " + pathname +". Se pasará a enviar algo estático.");
    staticHandler.handleStatic(pathname, res);
    
  }
}

exports.dispatch = dispatch;