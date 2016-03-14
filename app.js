
//var io               = require('socket.io');
var express          = require('express');
var http             = require('http');
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
app.set('port', 80);
app.use(express.static(__dirname + '/public'));
//app.listen(80);

var io = require('socket.io').listen(app.listen(80));

//var wsServer = new WebSocketServer({ httpServer : server });
//var server = http.createServer(app);
//io.listen(server);


io.sockets.on('connection', function (socket) {
    console.log("connected");
});

// start the message relay, which marshals messages between the client and server
var relay = new MessageRelay.MessageRelay(io);
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

//// Raw testing - temporary
//var e1 = new Element(18, "kettle", new TemperatureProbe("kettle"), 0);
//var e2 = new Element(23, "kettle", new TemperatureProbe("kettle"), 0);
//var p1 = new Pump(24, "test");
//var p2 = new Pump(25, "test");
//var probe = new TemperatureProbe("kettle");
//probe.start();
//probe.getSensors(function () { });


//e1.on();
//e2.on();
//p1.on();
//p2.on();

////var e = new Element(18, "kettle", new TemperatureProbe("kettle"), 0);
//var x = true;
//setInterval(function () {
//    x = !x;
//    if (x) {
//        e1.on();
//        e2.on();
//        p1.on();
//        p2.on();
//        console.log(probe.getTemperature());
//        //e.on();
//    }
//    else {
//        e1.on();
//        e2.on();
//        p1.on();
//        p2.on();
//        //e.off();
//    }
//}, 500);

