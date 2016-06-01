var http = require('http');
var fs = require('fs');
var path = require('path');

global.appRoot = path.resolve(__dirname);

var home = "./"
var server = http.createServer( (req, res) => {

    console.log("requested: ".concat(req.url));
    
    if (req.url == '/') {

	fs.readFile(global.appRoot.concat("/public/index.html"), (err, data) => {
	    res.setHeader("Content-Type", "text/html");
	    if (err != null) {
		console.log(err);
	    }
	    console.log(data);
	    res.end(data);
	});
    } else if (req.url.indexOf("public") >= 0) {

	fs.readFile(global.appRoot.concat(req.url), (err, data) => {
	    if ( req.url.indexOf("img") >= 0 ) {
		res.setHeader("Content-Type", "image/gif");
	    } else if (req.url.indexOf("js") >= 0 ) {
		res.setHeader("Content-Type", "text/javascript");
	    } else if (req.url.indexOf("css") >= 0 ) {
		res.setHeader("Content-Type", "text/css");
	    } else {
		res.setHeader("Content-Type", "text/html");
	    }
	    
	    if (err != null) {
		    console.log(err);
		}
		console.log(data);
		res.end(data);
	    });
    } else {
	console.log("requested unknown resource:".concat(req.url));
	res.end();
    }
});

server.listen(8000);
console.log("now listening to port 8000");
