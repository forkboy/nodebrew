
app.controller('run', ['$scope', '$timeout', 'comms', function ($scope, $timeout, comms) {
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

            this.plot = $.plot("#graph-content", [], {
                series: {
                    shadowSize: 0	// Drawing is faster without shadows
                },
                yaxis: {
                    min: 0,
                    max: 110,
                    show: true
                },
                xaxis: {
                    show: true
                },
                grid: {
                    borderWidth: 0
                },
                legend: { position: "se" }
            });
            
            // request the event log initially
            comms.send({ type: 'GetEventLog' });

            setInterval(function () {
                comms.send({ type: 'GetEventLog' });
            }, 30000);
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
            $scope.$apply(function () {
                $scope.kettleTemp = parseFloat(data.KettleTemperature).toFixed(1);
                $scope.kettleTarget = parseFloat(data.KettleTarget).toFixed(0);
                $scope.kettleElement = parseFloat(data.KettleElement * 100.0).toFixed(0);
                $scope.kettlePump = data.KettlePump;
                $scope.currentStep = data.CurrentStep;
                $scope.currentStepTimer = new Date(data.CurrentStep.remaining * 1000);
                
                for (var i = 0; i < $scope.steps.length; i++) {
                    if (data.CurrentStep.name == $scope.steps[i].name) {
                        $scope.stepsViewport[0] = i >= 2 ? $scope.steps[i - 2] : undefined;
                        $scope.stepsViewport[1] = i >= 1 ? $scope.steps[i - 1] : undefined;
                        $scope.stepsViewport[2] = $scope.steps[i];
                        $scope.stepsViewport[3] = i + 1 <= $scope.steps.length ? $scope.steps[i + 1] : undefined;
                        $scope.stepsViewport[4] = i + 2 <= $scope.steps.length ? $scope.steps[i + 2] : undefined;;
                    }
                }
            });
        });

        $scope.$on("Configuration", function (event, data) {
            $scope.$apply(function () {
                console.log("Got configuration data from server");
                $scope.steps = data.steps;
                $scope.currentStep = data.currentStep;
                $scope.mashSchedule = data.mashSchedule;
                $scope.presetName = data.presetName;
            });
        });
        
        $scope.$on("EventLog", function (event, data) {
            var temperature = [];
            var target = [];
            var lastTarget = 0;
            data.events.forEach(function (item) {
                temperature.push([item.Time / 60.0, item.KettleTemperature]);
                target.push([item.Time / 60.0, item.KettleTarget == 0 ? lastTarget : item.KettleTarget]);

                if (item.KettleTarget != 0)
                    lastTarget = item.KettleTarget;
            });
            var graphData = [];
            
            this.plot.setData([{ label: "Temperature", data: temperature }, { label: "Target", data: target }]);
            plot.setupGrid();
            this.plot.draw();
        });

        $scope.goToStep = function (name) {
            if (name === undefined)
                return;
            
            $timeout(function () {
                if (window.confirm('Move to step ' + name + '?')) {
                    comms.send({ type: 'MoveToNamedStep', name: name });
                }
            }, 1);
        }
        
        $scope.makeStepIcon = function (type) {
            switch (type) {
                case "Hold":
                    return "fa-clock-o";
                case "Ramp":
                    return "fa-bolt";
                case "Manual":
                    return "fa-hand-paper-o";
            }

        };

        this.start();

}]);