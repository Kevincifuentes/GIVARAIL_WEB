var http = require('http'),
    url = require('url'),
    fs = require('fs');
 
 
//create the http server listening on port 3333
http.createServer(function (req, res) {
    var query = url.parse(req.url, true).query;
     
    if (typeof query.file === 'undefined') {
    	content = "prueba1, prueba2, prueba3, prueba4;";
        //specify Content will be an attachment
        res.setHeader('Content-disposition', 'attachment; filename=theDocument.csv');
        res.setHeader('Content-type', 'text/plain');
        res.end(content);
    } else {
        //read the image using fs and send the image content back in the response
        content = "prueba1, prueba2, prueba3, prueba4;";
        //specify Content will be an attachment
        res.setHeader('Content-disposition', 'attachment; filename='+query.file);
        res.end(content);
    }
 
}).listen(3333);
console.log("Server running at http://localhost:3333/");
