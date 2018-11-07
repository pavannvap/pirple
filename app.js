// primary file for the api

// dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');

// the server should respond to all requests with a string
var server = http.createServer(function(req, res){

    // get the url and parse it
    var parsedUrl = url.parse(req.url, true);

    // get the path from the url
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g ,'');
    
    //get the query string as an object
    var queryStringObject = parsedUrl.query;

    // get the http method
    var method = req.method.toLowerCase();

    // get the headers as an object
    var headers = req.headers;

    // get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });
    req.on('end', function(data){
        buffer += decoder.end();
        
        // choosen handler
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : router.notFound;

        // construct the data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        }

        // route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload){
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
            payload = typeof(payload) === 'object' ? payload : {};

            //converst the payload to string
            var payloadString = JSON.stringify(payload);
            console.log(statusCode);
            //send the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
        
    });
    
});
server.listen(config.port, function(){
    console.log('server is listening on port ' + config.port + ' in ' + config.envName+ ' now');
});

//define the handlers
var handlers = {};

// sample handler
handlers.sample = function(data, callback){
    // callback a http status code, and a payload object
    callback(406, {'name': 'sample handler'});
};

handlers.hello = function(data, callback){
    // callback a http status code, and a payload object
    callback(200, {'greeting': 'Welcome to my NODE WORLD'});
};

// notfound handler
handlers.notFound = function(data, callback){
    callback(404, {'name': 'not found'});
};

// define a request router
var router = {
    'hello': handlers.hello,
    'sample': handlers.sample,
    'notFound': handlers.notFound
}
