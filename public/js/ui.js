
app.controller('run', ['$scope', 'comms', function ($scope, comms) {
        $scope.kettleTemp      = 0;
        $scope.kettleTarget    = 0;
        $scope.kettleElement   = 0;
        $scope.kettlePump      = 0;
        $scope.currentStepName = "";
        $scope.currentStep     = null;
        $scope.stepsViewport   = [,,,,];
        $scope.steps           = [{ name: 'a', type: 'a' }];
        
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
            $scope.kettleTemp        = parseFloat(data.KettleTemperature).toFixed(1);
            $scope.kettleTarget      = parseFloat(data.KettleTarget).toFixed(0);
            $scope.kettleElement     = parseFloat(data.KettleElement * 100.0).toFixed(0);
            $scope.kettlePump        = data.KettlePump;
            $scope.currentStep       = data.CurrentStep;
            $scope.currentStepTimer  = new Date(data.CurrentStep.remaining * 1000);
            
            for (var i = 0; i < $scope.steps.length; i++) {
                if (data.CurrentStep.name == $scope.steps[i].name) {
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
            $scope.steps        = data.steps;
            $scope.currentStep  = data.currentStep;
            $scope.mashSchedule = data.mashSchedule;
            
            // Setup some range values
            $scope.mashSchedule.forEach(function (item) {
                switch (item.name) {
                    case "Protien":
                        item.ranges = { ld: 0,  ud: 30, lt: 45, ut: 55 };
                        break;
                    case "Sacc 1":
                        item.ranges = { ld: 0,  ud: 30, lt: 60, ut: 70 };
                        break;
                    case "Sacc 2":
                        item.ranges = { ld: 30, ud: 60, lt: 60, ut: 70 };
                        break;
                    case "Sacc 3":
                        item.ranges = { ld: 0,  ud: 30, lt: 60, ut: 70 };
                        break;
                    case "Mashout":
                        item.ranges = { ld: 0,  ud: 30, lt: 70, ut: 80 };
                        break;
                }
            })

            $scope.$apply();
        });
        
        $scope.goToStep = function (name) {
            if (name === undefined)
                return;

            if (confirm('Move to step ' + name + '?')) {
                comms.send({ type: 'MoveToNamedStep', name: name });
            }
        }
        this.start();

    }]);