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
    } else {
	console.log("requested unknown resource:".concat(req.url));
    }
});

server.listen(8000);
console.log("now listening to port 8000");
