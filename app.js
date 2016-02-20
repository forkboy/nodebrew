
var WebSocketServer = require('websocket').server;
var express = require('express');
var TemperatureProbe = require('./lib/temperature.js');
var Pump = require('./lib/pump.js');
var Workflow = require('./lib/workflow.js');
var Postal = require("postal");
var MessageRelay = require('./lib/messageRelay.js');

// start the web server
var app = express();
var server = app.listen(80);
var wsServer = new WebSocketServer({ httpServer : server });
app.use(express.static(__dirname + '/public'));

// start the message relay, which marshals messages between the client and server
var relay = new MessageRelay.MessageRelay(wsServer);
relay.start();

// start the workflow
var workflow = new Workflow.Workflow();
workflow.start();



//var x = true;
//setInterval(function () {
//    x = !x;
//    if (x)
//        p.on();
//    else
//        p.off();
//}, 500);
