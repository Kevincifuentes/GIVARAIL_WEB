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
        res.writeHead(200, {"Content-Type": "application/json"});
        var pruebaPos = [{posicion: {latitud : 40.4168, longitud : -3.7038}}, {posicion: {latitud : 41.3851, longitud : 2.1734}}];
        pool.connect(function(err, client, done) {
                  if(err) {
                    return console.error('Error al obtener un cliente de la "piscina"', err);
                  }
                  client.query("SELECT * FROM Posiciones WHERE id_tren='"+jsonObj.idtren+"'", function(err, result) {
                    //call `done()` to release the client back to the pool
                    res.write(JSON.stringify(results.rows));
                    res.end();
                    console.log("Respuesta dada");
                    done();

                    if(err) {
                      return console.error('Error al obtener las posiciones para el tren con ID: '+jsonObj.idtren, err);
                    }
                  });
                  
                });
        
    });


}

function obtenerTrenesFecha(res){
    console.log("SE HA LLAMADO A OBTENER TRENES CON FECHA");
    var body = "";
    req.on('data', function (chunk) {
            body += chunk;
    });
    req.on('end', function () {
        var jsonObj = JSON.parse(body);
        // Utilizar jsonObj.fecha para obtener la fecha
        console.log(jsonObj.fecha);
        res.writeHead(200, {"Content-Type": "application/json"});
        var pruebaPos = [{posicion: {latitud : 40.4168, longitud : -3.7038}}, {posicion: {latitud : 41.3851, longitud : 2.1734}}];
        res.write(JSON.stringify(pruebaPos));
        res.end();
        console.log("Respuesta dada");
    });
}


exports.index = index;
exports.obtenerTrenCodigo = obtenerTrenCodigo;
exports.obtenerTrenesFecha = obtenerTrenesFecha;