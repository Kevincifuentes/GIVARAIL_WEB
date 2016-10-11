var http = require('http'),
    fs = require('fs'),
    util = require('util'),
    nodemailer = require('nodemailer'),
    formidable = require("formidable"),
    mongo = require('mongodb'),
    ejs = require('ejs'),
    mongoose = require('mongoose'),
    qs = require('querystring'),
	url = require("url");



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
        res.write(JSON.stringify(pruebaPos));
        res.end();
        console.log("Respuesta dada");
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