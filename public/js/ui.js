
app.controller('run', ['$scope', 'comms', function ($scope, comms) {
        $scope.kettleTemp = 0;
        $scope.currentStep = "";
        $scope.steps = [{ name: 'a', type: 'a' }];
        
        this.start = function () {
            console.log('Starting Comms...')
            comms.initialise(this.commsReady);
            
        }
        
        this.commsReady = function () {
            console.log('Requesting initial data');
            comms.send({ type: 'GetConfiguration' });
        }

        $scope.$on("Tick", function (event, data) {
            $scope.kettleTemp = data.KettleTemperature;
            $scope.$apply();
        });

        $scope.$on("Configuration", function (event, data) {
            console.log("Got configuration data from server");
            $scope.steps = data.steps;
            $scope.$apply();
        });

        this.start();

    }]);