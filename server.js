var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var mongodb = require('mongodb');
var querystring = require('querystring');
var url = require('url');
var oauth = require('oauth').OAuth;


global.appRoot = path.resolve(__dirname);

var MongoClient = mongodb.MongoClient;

var dbURL = "mongodb://127.0.0.1:27017/test";

var requestURL = "https://trello.com/1/OAuthGetRequestToken";
var accessURL = "https://trello.com/1/OAuthGetAccessToken";
var authorizeURL = "https://trello.com/1/OAuthAuthorizeToken";

var tParams = {
    callback_method: 'post_message',
    returnAddress: 'http://localhost:8000/traccess',
    scope: 'read',
    expiration: 'never',
    name: 'life-tracker',
    key: '824fc6801c460b0ab387c07ea77c50e4',
    secret: '247e91b60de15c6e879735e99b6266912c2f418ec7edd654cd9e51ccafd857cc'
};

var oauth_secrets = {}; 

var OAuth = new oauth(requestURL, accessURL, tParams.key, tParams.secret, "1.0", tParams.returnAddress, "HMAC-SHA1");

var login = (req, res) => {
    OAuth.getOAuthRequestToken( (err,token, tokenSecret, results) => {
	oauth_secrets[token] = tokenSecret;
	res.writeHead(302, { 'Location': `${authorizeURL}?oauth_token=${token}&=name=${tParams.name}` });
	if (err) {
	    console.log(err);
	} else {
	    console.log("successfully retrieved request token: ", token, ", secret:  ", tokenSecret);
	}
	res.end();
    });
}

var traccess = (req, res) => {
    query = url.parse(req.url, true).query;
    token = query.oauth_token;
    tokenSecret = oauth_secrets[token];
    verifier = query.oauth_verifier;

    console.log("parsed tokens: ", query, ", attemping to to retrieve access token");

    OAuth.getOAuthAccessToken( token, tokenSecret, verifier, (error, accessToken, accessTokenSecret, results) => {
	OAuth.getProtectedResource("https://api.trello.com/1/members/me", "GET", accessToken, accessTokenSecret, (error, data, response) => {
	    res.end(data);
	});
    });
};
    
function dbAccessCollection(dbURL, collection, callback) {
    MongoClient.connect(dbURL, (err, db) => {
	if (err) {
	    console.log("Unable to connect to Mongo database, Error:", err);
	} else {
	    console.log("connection established to ", dbURL);
	}
	db.collection(collection, (err, result) => {
	    callback(result);
	});
    });
}

function createAccount(data) {
    var dataJSON = querystring.parse(data);
    dbAccessCollection(dbURL, 'users', (collection) => {
	collection.insert(dataJSON, (err,result) => {
	    if (err) {
		console.log("error adding user: ", err);
	    }
	    console.log(result);	
	});
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
    } else if (req.url.indexOf('login') >= 0) {
	var queryData = "";
	req.on('data', (data) => {
	    queryData += data; 
	    console.log("data: ", queryData);
	});
	req.on('end', () => {
	    createAccount(queryData);

	    login(req, res); 
	});
    } else if (req.url.indexOf('traccess') >= 0) {
	traccess(req,res);
    } else {
	console.log("requested unknown resource:".concat(req.url));
	res.end();
    }
});

server.listen(8000);
console.log("now listening to port 8000");
