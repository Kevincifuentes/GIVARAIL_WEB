var http = require('http'),
    fs = require('fs'),
    util = require('util'),
    nodemailer = require('nodemailer'),
    formidable = require("formidable"),
    pg = require('pg'),
    ejs = require('ejs'),
    qs = require('querystring'),
	url = require("url");

var config = {
  user: 'kevin', //env var: PGUSER
  database: 'giv2rail', //env var: PGDATABASE
  password: 'kevin', //env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

var pool = new pg.Pool(config);
var conexionesCliente = [];

function index(res) {
	console.log("SE HA LLAMADO A INDEX");
	fs.readFile('./static/index.html', function (err, html) {
    if (err) {
        throw err; 
    }
    res.writeHead(200, {"Content-Type": "text/html"});  
    res.write(html);
    res.end();
    });
}

function obtenerTrenCodigo(res, req){
    console.log("SE HA LLAMADO A OBTENER TREN CON CODIGO");
    var body = "";
    req.on('data', function (chunk) {
            body += chunk;
    });
    req.on('end', function () {
        var query = url.parse(req.url).query;
        var jsonObj = JSON.parse(decodeURIComponent(query));
        // Utilizar jsonObj.idtren para obtener el ID del tren enviado
        
        pool.connect(function(err, client, done) {
          if(err) {
            return console.error('Error al obtener un cliente de la "piscina"', err);
          }
          const results = [];
          const query = client.query("SELECT * FROM Posiciones WHERE id_trenasoc=($1)", [jsonObj.idtren]);
          //call `done()` to release the client back to the pool

          query.on('row', (row) => {
            results.push(row);
          });
          // After all data is returned, close connection and return results
          query.on('end', function() {
            res.writeHead(200, {"Content-Type": "application/json"});
            if(results.length == 0)
            {
                var nohay = {'noHay' : true};
                res.write(JSON.stringify(nohay)); 
            }
            else
            {
                console.log(results);
                res.write(JSON.stringify(results)); 
            }
            res.end();
            console.log("Respuesta dada");
            done();
          });

          if(err) {
            return console.error('Error al obtener las posiciones para el tren con ID: '+jsonObj.idtren, err);
          }
                  
        });
        
    });


}

function obtenerTrenCodigoCSV(res, req){
    console.log("SE HA LLAMADO A DESCARGAR INFORMACION DE TREN CON CODIGO");
    var body = "";
    req.on('data', function (chunk) {
            body += chunk;
    });
    req.on('end', function () {
        var query = url.parse(req.url).query;
        var jsonObj = JSON.parse(decodeURIComponent(query));
        // Utilizar jsonObj.idtren para obtener el ID del tren enviado
        
        pool.connect(function(err, client, done) {
          if(err) {
            return console.error('Error al obtener un cliente de la "piscina"', err);
          }
          const results = [];
          const query = client.query("SELECT * FROM Posiciones WHERE id_trenasoc=($1)", [jsonObj.idtren]);
          //call `done()` to release the client back to the pool

          query.on('row', (row) => {
            results.push(row);
          });
          // After all data is returned, close connection and return results
          query.on('end', function() {
            if(results.length == 0)
            {
                nombreDocumento = jsonObj.idtren+"_"+new Date().toUTCString()+".csv";
                nombreDocumento = nombreDocumento.replace(/\s+/g, '');
                res.setHeader('Content-disposition', 'attachment; filename='+nombreDocumento);
                res.setHeader("Set-Cookie", "fileDownload=true; path=/");
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                res.setHeader('Content-type', 'binary');
                console.log("CSV");
                contenido ="No hay información disponible con el id de tren "+ jsonObj.idtren;
                res.end(contenido); 
            }
            else
            {
                nombreDocumento = jsonObj.idtren+"_"+new Date().toUTCString()+".csv";
                nombreDocumento = nombreDocumento.replace(/\s+/g, '');
                res.setHeader('Content-disposition', 'attachment; filename='+nombreDocumento);
                res.setHeader("Set-Cookie", "fileDownload=true; path=/");
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                res.setHeader('Content-type', 'binary');
                console.log("CSV");
                contenido ="";
                for(i =0; i<results.length; i++){
                    contenido = contenido + results[i].latitud+","+results[i].longitud+","+results[i].momento+"\n";
                }
        
                res.end(contenido);
            }
            console.log("Respuesta dada");
            done();
          });

          if(err) {
            return console.error('Error al obtener las posiciones para el tren con ID: '+jsonObj.idtren, err);
          }
                  
        });
        
    });


}

function obtenerTrenesFecha(res, req){
    console.log("SE HA LLAMADO A OBTENER TRENES CON FECHA");
    var body = "";
    req.on('data', function (chunk) {
            body += chunk;
    });
    req.on('end', function () {
        var query = url.parse(req.url).query;
        var jsonObj = JSON.parse(decodeURIComponent(query));
        // Utilizar jsonObj.fecha para obtener la fecha
        var desde = jsonObj.desde+".00";
        var hasta = jsonObj.hasta+".00";
        console.log(desde);
        console.log(hasta);
        pool.connect(function(err, client, done) {
          if(err) {
            return console.error('Error al obtener un cliente de la "piscina"', err);
          }
          const results = [];
          const query = client.query("SELECT * FROM Posiciones WHERE momento BETWEEN ($1)::timestamp AND ($2)::timestamp;", [desde, hasta]);
          //call `done()` to release the client back to the pool
          console.log(query);
          query.on('row', (row) => {
            results.push(row);
          });
          // After all data is returned, close connection and return results
          query.on('end', function() {
            res.writeHead(200, {"Content-Type": "application/json"});
            if(results.length == 0)
            {
                var nohay = {'noHay' : true};
                res.write(JSON.stringify(nohay)); 
            }
            else
            {
                console.log(results);
                res.write(JSON.stringify(results)); 
            }
            res.end();
            console.log("Respuesta dada");
            done();
          });

          if(err) {
            return console.error('Error al obtener las posiciones para el tren con ID: '+jsonObj.idtren, err);
          }        
        });
        
    });
}

function obtenerTrenesFechaCSV(res, req){
    console.log("SE HA LLAMADO A DESCARGAR TRENES CON FECHA");
    var body = "";
    req.on('data', function (chunk) {
            body += chunk;
    });
    req.on('end', function () {
        var query = url.parse(req.url).query;
        var jsonObj = JSON.parse(decodeURIComponent(query));
        // Utilizar jsonObj.fecha para obtener la fecha
        var desde = jsonObj.desde+".00";
        var hasta = jsonObj.hasta+".00";
        console.log(desde);
        console.log(hasta);
        pool.connect(function(err, client, done) {
          if(err) {
            return console.error('Error al obtener un cliente de la "piscina"', err);
          }
          const results = [];
          const query = client.query("SELECT * FROM Posiciones WHERE momento BETWEEN ($1)::timestamp AND ($2)::timestamp;", [desde, hasta]);
          //call `done()` to release the client back to the pool
          console.log(query);
          query.on('row', (row) => {
            results.push(row);
          });
          // After all data is returned, close connection and return results
          query.on('end', function() {
            if(results.length == 0)
            {
                nombreDocumento = "from_"+desde+"_desde_"+hasta+".csv";
                nombreDocumento = nombreDocumento.replace(/\s+/g, '');
                res.setHeader('Content-disposition', 'attachment; filename='+nombreDocumento);
                res.setHeader("Set-Cookie", "fileDownload=true; path=/");
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                res.setHeader('Content-type', 'binary');
                console.log("CSV");
                contenido ="No hay información disponible desde la fecha "+ desde+" hasta la fecha "+ hasta;
                res.end(contenido); 
            }
            else
            {
                nombreDocumento = "from_"+desde+"_desde_"+hasta+".csv";
                nombreDocumento = nombreDocumento.replace(/\s+/g, '');
                res.setHeader('Content-disposition', 'attachment; filename='+nombreDocumento);
                res.setHeader("Set-Cookie", "fileDownload=true; path=/");
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                res.setHeader('Content-type', 'binary');
                console.log("CSV");
                contenido ="";
                for(i =0; i<results.length; i++){
                    contenido = contenido + results[i].latitud+","+results[i].longitud+","+results[i].momento+"\n";
                }
                res.end(contenido);
            }
            res.end();
            console.log("Respuesta dada");
            done();
          });

          if(err) {
            return console.error('Error al obtener las posiciones para el tren con ID: '+jsonObj.idtren, err);
          }        
        });
        
    });
}

function obtenerTrenesCodigoFecha(res, req){
    console.log("SE HA LLAMADO A OBTENER TRENES CON ID y Fecha");
    var body = "";
    req.on('data', function (chunk) {
            body += chunk;
    });
    req.on('end', function () {
        var query = url.parse(req.url).query;
        var jsonObj = JSON.parse(decodeURIComponent(query));
        // Utilizar jsonObj.fecha para obtener la fecha
        var desde = jsonObj.desde+".00";
        var hasta = jsonObj.hasta+".00";
        var id = jsonObj.id;
        pool.connect(function(err, client, done) {
          if(err) {
            return console.error('Error al obtener un cliente de la "piscina"', err);
          }
          const results = [];
          const query = client.query("SELECT * FROM Posiciones WHERE id_trenasoc=($1) AND momento BETWEEN ($2)::timestamp AND ($3)::timestamp;", [id, desde, hasta]);
          //call `done()` to release the client back to the pool
          console.log(query);
          query.on('row', (row) => {
            results.push(row);
          });
          // After all data is returned, close connection and return results
          query.on('end', function() {
            res.writeHead(200, {"Content-Type": "application/json"});
            if(results.length == 0)
            {
                var nohay = {'noHay' : true};
                res.write(JSON.stringify(nohay)); 
            }
            else
            {
                console.log(results);
                res.write(JSON.stringify(results)); 
            }
            res.end();
            console.log("Respuesta dada");
            done();
          });

          if(err) {
            return console.error('Error al obtener las posiciones para el tren con ID : '+jsonObj.idtren+ " entre las fechas "+desde+ " -> "+hasta, err);
          }        
        });
        
    });
}

function obtenerTrenesCodigoFechaCSV(res, req){
    console.log("SE HA LLAMADO A DESCARGAR TRENES CON ID y Fecha");
    var body = "";
    req.on('data', function (chunk) {
            body += chunk;
    });
    req.on('end', function () {
        var query = url.parse(req.url).query;
        var jsonObj = JSON.parse(decodeURIComponent(query));
        // Utilizar jsonObj.fecha para obtener la fecha
        var desde = jsonObj.desde+".00";
        var hasta = jsonObj.hasta+".00";
        var id = jsonObj.id;
        pool.connect(function(err, client, done) {
          if(err) {
            return console.error('Error al obtener un cliente de la "piscina"', err);
          }
          const results = [];
          const query = client.query("SELECT * FROM Posiciones WHERE id_trenasoc=($1) AND momento BETWEEN ($2)::timestamp AND ($3)::timestamp;", [id, desde, hasta]);
          //call `done()` to release the client back to the pool
          console.log(query);
          query.on('row', (row) => {
            results.push(row);
          });
          // After all data is returned, close connection and return results
          query.on('end', function() {
            if(results.length == 0)
            {
                nombreDocumento = "from_"+desde+"_desde_"+hasta+".csv";
                nombreDocumento = nombreDocumento.replace(/\s+/g, '');
                res.setHeader('Content-disposition', 'attachment; filename='+nombreDocumento);
                res.setHeader("Set-Cookie", "fileDownload=true; path=/");
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                res.setHeader('Content-type', 'binary');
                console.log("CSV");
                contenido ="No hay información disponible para el tren con id "+ jsonObj.id+" desde la fecha "+ desde+" hasta la fecha "+ hasta;
                res.end(contenido);  
            }
            else
            {
                nombreDocumento = jsonObj.id+"_from_"+desde+"_desde_"+hasta+".csv";
                nombreDocumento = nombreDocumento.replace(/\s+/g, '');
                res.setHeader('Content-disposition', 'attachment; filename='+nombreDocumento);
                res.setHeader("Set-Cookie", "fileDownload=true; path=/");
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                res.setHeader('Content-type', 'binary');
                console.log("CSV");
                contenido ="";
                for(i =0; i<results.length; i++){
                    contenido = contenido + results[i].latitud+","+results[i].longitud+","+results[i].momento+"\n";
                }
                res.end(contenido);
            }
            res.end();
            console.log("Respuesta dada");
            done();
          });

          if(err) {
            return console.error('Error al obtener las posiciones para el tren con ID : '+jsonObj.idtren+ " entre las fechas "+desde+ " -> "+hasta, err);
          }        
        });
        
    });
}

function anadirPosicion(res, req){
    console.log("SE HA LLAMADO A ANADIRPOSICION");
    var body = "";
    req.on('data', function (chunk) {
            body += chunk;
    });
    req.on('end', function () {
        var jsonObj = JSON.parse(body);
        // Utilizar jsonObj.fecha para obtener la fecha
        conexionesCliente.forEach(function(resp) {
            var d = new Date();
            resp.write('id: ' + d.getMilliseconds() + '\n');
            resp.write('data:' + body +   '\n\n');
        });
        pool.connect(function(err, client, done) {
              if(err) {
                return console.error('Error al obtener un cliente de la "piscina"', err);
              }
              client.query('INSERT INTO Posiciones(latitud, longitud, id_trenasoc) values($1, $2, $3)',
                   [jsonObj.latitud, jsonObj.longitud, jsonObj.idtren]);
              console.log("añadido");
              done();
        });
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end();
    });
}

function registrarCliente(res, req){
    console.log("SE HA LLAMADO A REGITRARCLIENTE");
    req.socket.setTimeout(Number.MAX_VALUE);
 
    // send headers for event-stream connection
    // see spec for more information
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');

    conexionesCliente.push(res);

    req.on("close", function() {
        var toRemove;
        for (var j =0 ; j < conexionesCliente.length ; j++) {
            if (conexionesCliente[j] == res) {
                toRemove =j;
                break;
            }
        }
        conexionesCliente.splice(j,1);
        console.log(conexionesCliente.length);
    });
}

function login(res, req){
    console.log("SE HA LLAMADO A LOGIN");
    var body = "";
    req.on('data', function (chunk) {
            body += chunk;
    });
    req.on('end', function () {
        var jsonObj = JSON.parse(body);
        console.log(jsonObj.usuario + " "+ jsonObj.password);

        pool.connect(function(err, client, done) {
          if(err) {
            return console.error('Error al obtener un cliente de la "piscina"', err);
          }
          const results = [];
          const query = client.query("SELECT * FROM Usuarios WHERE usuario=($1)", [jsonObj.usuario]);
          //call `done()` to release the client back to the pool

          query.on('row', (row) => {
            results.push(row);
          });
          // After all data is returned, close connection and return results
          query.on('end', function() {
            if(results.length == 0)
            {
                res.writeHead(404, {"Content-Type": "application/json"});
                var nohay = {'noexiste' : true};
                res.write(JSON.stringify(nohay));
            }
            else
            {
                if(results[0].password == jsonObj.password){
                    //enviar Token
                    res.writeHead(200, {"Content-Type": "application/json"});
                    var correcto = {'correcto' : true};
                    res.write(JSON.stringify(correcto));
                }
                else{
                    res.writeHead(403, {"Content-Type": "application/json"});
                    var nohay = {'noexiste' : true};
                    res.write(JSON.stringify(nohay));
                }
            }
            res.end();
            console.log("Respuesta dada");
            done();
          });
        });
    });
}


exports.index = index; 
exports.obtenerTrenCodigo = obtenerTrenCodigo;
exports.obtenerTrenCodigoCSV = obtenerTrenCodigoCSV;
exports.obtenerTrenesFecha = obtenerTrenesFecha;
exports.obtenerTrenesFechaCSV = obtenerTrenesFechaCSV;
exports.anadirPosicion = anadirPosicion;
exports.registrarCliente = registrarCliente;
exports.obtenerTrenesCodigoFecha = obtenerTrenesCodigoFecha;
exports.obtenerTrenesCodigoFechaCSV = obtenerTrenesCodigoFechaCSV;
exports.login = login;