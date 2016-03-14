app.service('comms', ['$rootScope', function ($rootScope) {
        this.connection = null;

        this.initialise = function (onReady) {
            
            console.log("Attempting to connect to server...");
            this.connection = io.connect('http://localhost');
            
            this.connection.onerror = function (error) {
                // an error occurred when sending/receiving data
                console.log("Error: " + error);
            };
            
            this.connection.on('message', function (message) {
                $rootScope.$broadcast(message.type, message);
            });

            if (onReady)
                onReady();
        }

        this.send = function (request) {
            this.connection.emit('message', request);
        };
    }]);