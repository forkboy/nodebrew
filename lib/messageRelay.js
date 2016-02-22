﻿var Postal = require("postal");

var MessageRelay = function (wsServer) {
    var self = this;
    this.wsServer = wsServer;
    this.messageBus = Postal.channel();
    this.connection = null

    this.start = function () {
        
        // WebSocket server
        this.wsServer.on('request', function (request) {
            self.connection = request.accept(null, request.origin);
            
            // Pass through any messages directly onto the bus	
            self.connection.on('message', function (message) {
                if (message.type === 'utf8') {
                    var json = JSON.parse(message.utf8Data);
                    self.messageBus.publish(json.type, json);
                }
            });
            
            self.connection.on('close', function (connection) {
                // close user connection
            });
        });
        
        this.wsServer.onmessage = function (e) {
            console.log(e.data);
        };
        
        //this.messageBus.subscribe("client.*", function (data, envelope) {
        //    if (self.connection != undefined) {
        //        data.type = envelope.topic;
        //        console.log('sending message to client');
        //        console.log(data);
        //        self.connection.sendUTF(JSON.stringify(data));
        //    }
        //});

        this.messageBus.subscribe("Tick", function (data) {
            if (self.connection != undefined) {
                data.type = "Tick";
                self.connection.sendUTF(JSON.stringify(data));
            }
        });
        
        this.messageBus.subscribe("Configuration", function (data) {
            if (self.connection != undefined) {
                data.type = "Configuration";
                self.connection.sendUTF(JSON.stringify(data));
            }
        });
    }
}

module.exports.MessageRelay = MessageRelay;