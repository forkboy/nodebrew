app.service('comms', ['$rootScope', function ($rootScope) {
        this.connection = null;

        this.initialise = function (onReady) {
            
            window.WebSocket = window.WebSocket || window.MozWebSocket;
            
            console.log("Attempting to connect to server...");
            connection = new WebSocket('ws://127.0.0.1:80');
            
            connection.onopen = function () {
                if (onReady)
                    onReady();
            };
            
            connection.onerror = function (error) {
                // an error occurred when sending/receiving data
            };
            
            connection.onmessage = function (message) {
                // try to decode json (I assume that each message from server is json)
                try {
                    var json = JSON.parse(message.data);
                    $rootScope.$broadcast(json.type, json);
                    
                    console.log('received event ' + json.type);
                    console.log(json);
                } catch (e) {
                    console.log('This doesn\'t look like a valid JSON: ', message.data);
                    return;
                }
                // handle incoming message
            };
        }

        this.send = function (request) {
            console.log("sending message to server");
            console.log(request);
            connection.send(JSON.stringify(request));
        }
    }]);