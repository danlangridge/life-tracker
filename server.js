var http = require('http');
var fs = require('fs');
var path = require('path');
var mongodb = require('mongodb');
var querystring = require('querystring');

global.appRoot = path.resolve(__dirname);

var MongoClient = mongodb.MongoClient;

var dbURL = "mongodb://127.0.0.1:27017/test";


function createAccount(data) {
    MongoClient.connect(dbURL, (err, db) => {
	if (err) {
	    console.log("Unable to connect to Mongo database, Error:", err);
	} else {
	    console.log("connection established to ", dbURL);

	    db.createCollection('users', (err,result) => {
		if (err) {
		    console.log("failed at creating table, error:", err);
		} else {
		    var dataJSON = querystring.parse(data);
		    result.insert(dataJSON, (err,result) => {
			if (err) {
			    console.log("error adding user: ", err);
			}
			console.log(result);			
		    });
		}
	    }); 
	}
    });
}

var server = http.createServer( (req, res) => {

    console.log("requested: ".concat(req.url));
    
    if (req.url == '/') {

	fs.readFile(global.appRoot.concat("/public/login.html"), (err, data) => {
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
    } else if (req.url.indexOf('signon') >= 0) {
	var queryData = "";
	req.on('data', (data) => {
	    queryData += data; 
	    console.log("data: ", queryData);
	});
	req.on('end', () => {
	    createAccount(queryData); 
	    res.end();
	});
    } else {
	console.log("requested unknown resource:".concat(req.url));
	res.end();
    }
});

server.listen(8000);
console.log("now listening to port 8000");
