
var WebSocketServer  = require('websocket').server;
var express          = require('express');
var TemperatureProbe = require('./lib/temperature.js');
var Pump             = require('./lib/pump.js');
var Workflow         = require('./lib/workflow.js');
var MessageRelay     = require('./lib/messageRelay.js');
var Simulator        = require('./lib/simulator.js');
var Schedule         = require('./lib/schedule.js');
var Postal           = require("postal");
var sinon            = require('sinon');
var EventLog         = require('./lib/eventLog.js');
var Element          = require('./lib/element.js');
var TemperatureProbe = require('./lib/temperature.js');

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

workflow.initialise();
    
// if we're in simulation mode, stub out all the hardware (thanks sinon)
if (process.argv[2] == "simulate") {
    var sim = new Simulator(workflow);
    sim.initialise();
}
        
workflow.start();

// Start the logger
var el = new EventLog();
el.start();

//var p = new Pump(27, "test");
//var e = new Element(18, "kettle", new TemperatureProbe("kettle"), 0);
//var x = true;
//setInterval(function () {
//    x = !x;
//    if (x) {
//        p.on();
//        e.on();
//    }
//    else {
//        p.off();
//        e.off();
//    }
//}, 500);

