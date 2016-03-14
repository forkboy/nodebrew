var Postal = require("postal");
//var io     = require("socket.io");

var MessageRelay = function (io) {
    var self = this;
    this.io = io;
    this.messageBus = Postal.channel();
    this.socket = null

    this.start = function () {
        
        // WebSocket server
        this.io.sockets.on('connection', function (socket) {
            self.socket = socket;
                
            // Pass through any messages directly onto the bus	
            self.socket.on('message', function (message) {
                console.log(message);
                self.messageBus.publish(message.type, message);
            });
            
            self.socket.on('close', function (connection) {
                // close user connection
            });
        });
        
        this.io.sockets.onmessage = function (e) {
            console.log("received message from client: " + e.data);
            self.messageBus.publish(e.data.type, e.data);
        };
        
        this.messageBus.subscribe("Tick", function (data) {
            if (self.socket != undefined) {
                data.type = "Tick";
                console.log("sending tick...");
                self.socket.emit('message', data);
                //self.socket.sendUTF(JSON.stringify(data));
            }
        });
        
        this.messageBus.subscribe("Configuration", function (data) {
            if (self.socket != undefined) {
                data.type = "Configuration";
                self.socket.emit('message', data);
                //self.socket.sendUTF(JSON.stringify(data));
            }
        });

        this.messageBus.subscribe("GetMashSchedule", function (data) {
            if (self.socket != undefined) {
                data.type = "Configuration";
                self.socket.emit('message', data);
                //self.socket.sendUTF(JSON.stringify(data));
            }
        });

        this.messageBus.subscribe("EventLog", function (data) {
            if (self.socket != undefined) {
                data.type = "EventLog";
                self.socket.emit('message', data);
                //self.socket.sendUTF(JSON.stringify(data));
            }
        });
    }
}

module.exports.MessageRelay = MessageRelay;