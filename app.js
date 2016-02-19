
var WebSocketServer = require('websocket').server;
var express = require('express');
var TemperatureProbe = require('./lib/temperature.js');
var Pump = require('./lib/pump.js');


var app = express();
var server = app.listen(80);
var wsServer = new WebSocketServer({ httpServer : server });
var tp = new TemperatureProbe("test");
var p = new Pump(17, "test");

// WebSocket server
wsServer.on('request', function (request) {
	var connection = request.accept(null, request.origin);
	
	// This is the most important callback for us, we'll handle
	// all messages from users here.
	connection.on('message', function (message) {
		//if (message.type === 'utf8') {
            // process WebSocket message
			console.log("I got a message:");
			console.log(JSON.parse(message.utf8Data).message);
		//}
	});
	
	connection.on('close', function (connection) {
        // close user connection
	});
});

wsServer.onmessage = function (e) {
	console.log(e.data);
};

// this will make Express serve your static files
app.use(express.static(__dirname + '/public'));

var x = true;
setInterval(function () {
    x = !x;
    if (x)
        p.on();
    else
        p.off();
}, 500);
