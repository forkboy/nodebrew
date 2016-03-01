
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

            setInterval(function () {
                console.log("GetEventLog");
                comms.send({ type: 'GetEventLog' });
            }, 5000)
        };
        
        $scope.updateSchedule = function () {
            console.log("updateSchedule");
            comms.send({ type: 'SaveMashSchedule', data: $scope.mashSchedule });
        };
        
        $scope.loadPreset = function (name) {
            console.log("loadPreset");
            comms.send({ type: 'LoadPresetMashSchedule', name: name });
        };

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
                    $scope.stepsViewport[0] = i >= 2 ? $scope.steps[i - 2] : undefined;
                    $scope.stepsViewport[1] = i >= 1 ? $scope.steps[i - 1] : undefined;
                    $scope.stepsViewport[2] = $scope.steps[i];
                    $scope.stepsViewport[3] = i + 1 <= $scope.steps.length ? $scope.steps[i + 1] : undefined;
                    $scope.stepsViewport[4] = i + 2 <= $scope.steps.length ? $scope.steps[i + 2] : undefined;;
                }
            }
            
            $scope.$apply();
        });

        $scope.$on("Configuration", function (event, data) {
            console.log("Got configuration data from server");
            $scope.steps        = data.steps;
            $scope.currentStep  = data.currentStep;
            $scope.mashSchedule = data.mashSchedule;
            $scope.presetName   = data.presetName;
            
            $scope.$apply();
        });
        
        $scope.$on("EventLog", function (event, data) {
            console.log("Got event log data from server");
            
            var temperature = [];
            var target = [];
            var lastTarget = 0;
            data.events.forEach(function (item) {
                temperature.push({
                    date: item.Time / 60.0,
                    value: item.KettleTemperature
                })
                target.push({
                    date: item.Time / 60.0,
                    value: item.KettleTarget == 0 ? lastTarget : item.KettleTarget
                });
                if (item.KettleTarget != 0)
                    lastTarget = item.KettleTarget;
            });
            var graphData = [];
            graphData.push(temperature, target);

            MG.data_graphic({
                title: "Event Log",
                description: "",
                data: graphData,
                width: 565,
                height: 370,
                target: '#eventLog',
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