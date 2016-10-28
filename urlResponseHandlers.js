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
        var jsonObj = JSON.parse(body);
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

function obtenerTrenesFecha(res, req){
    console.log("SE HA LLAMADO A OBTENER TRENES CON FECHA");
    var body = "";
    req.on('data', function (chunk) {
            body += chunk;
    });
    req.on('end', function () {
        var jsonObj = JSON.parse(body);
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


exports.index = index;
exports.obtenerTrenCodigo = obtenerTrenCodigo;
exports.obtenerTrenesFecha = obtenerTrenesFecha;
exports.anadirPosicion = anadirPosicion;
exports.registrarCliente = registrarCliente;