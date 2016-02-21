
app.controller('run', ['$scope', 'comms', function ($scope, comms) {
        $scope.kettleTemp    = 0;
        $scope.kettleTarget  = 0;
        $scope.kettleElement = 0;
        $scope.kettlePump    = 0;
        $scope.currentStep = "";
        $scope.stepsViewport = [,,,,];
        $scope.steps         = [{ name: 'a', type: 'a' }];
        
        this.start = function () {
            console.log('Starting Comms...')
            comms.initialise(this.commsReady);
            
        }
        
        this.commsReady = function () {
            console.log('Requesting initial data');
            comms.send({ type: 'GetConfiguration' });
        }
        
        $scope.confirmManualStep = function () {
            comms.send({ type: 'Confirmed' });
        };

        $scope.$on("Tick", function (event, data) {
            $scope.kettleTemp = data.KettleTemperature;
            $scope.kettleTarget = data.KettleTarget;
            $scope.kettleElement = data.KettleElement;
            $scope.kettlePump = data.KettlePump;
            $scope.currentStep = data.CurrentStep;
            
            for (var i = 0; i < $scope.steps.length; i++) {
                if (data.CurrentStep == $scope.steps[i].name) {
                    $scope.stepsViewport[0] = i > 2 ? $scope.steps[i - 2] : undefined;
                    $scope.stepsViewport[1] = i > 1 ? $scope.steps[i - 1] : undefined;
                    $scope.stepsViewport[2] = $scope.steps[i];
                    $scope.stepsViewport[3] = i + 1 < $scope.steps.length ? $scope.steps[i + 1] : undefined;
                    $scope.stepsViewport[4] = i + 2 < $scope.steps.length ? $scope.steps[i + 2] : undefined;;
                }
            }
            
            $scope.$apply();
        });

        $scope.$on("Configuration", function (event, data) {
            console.log("Got configuration data from server");
            $scope.steps = data.steps;
            $scope.currentStep = data.currentStep;
            $scope.$apply();
        });

        this.start();

    }]);