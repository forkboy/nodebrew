var Steps            = require('./steps.js');
var TemperatureProbe = require('./temperature.js');
var Pump             = require('./pump.js');
var Time             = require('./time.js');
var Element          = require('./element.js');
var Postal           = require("postal");

var Workflow = function () {
    var self = this;

    this.steps = [
        new Steps.Manual   ({ name: "Start"                                                            }),
        new Steps.Manual   ({ name: "Add Mash Water"                                                   }),
        new Steps.TempRamp ({ name: "Ramp to Strike" ,   target: 30 ,                                  }),
        new Steps.Manual   ({ name: "Add Grains"                                                       }),
        new Steps.TempRamp ({ name: "Ramp to Protien",   target: 50 ,                                  }),
        new Steps.TempHold ({ name: "Protein Rest"   ,   target: 50 ,                    duration: 5   }),
        new Steps.TempRamp ({ name: "Ramp to Sacc 1" ,   target: 62 ,                                  }),
        new Steps.TempHold ({ name: "Sacc 1 Rest"    ,   target: 62 ,                    duration: 5   }),
        new Steps.TempRamp ({ name: "Ramp to Sacc 2" ,   target: 65 ,                                  }),
        new Steps.TempHold ({ name: "Sacc 2 Rest"    ,   target: 65 ,                    duration: 5   }),
        new Steps.TempRamp ({ name: "Ramp to Sacc 3" ,   target: 68 ,                                  }),
        new Steps.TempHold ({ name: "Sacc 3 Rest"    ,   target: 68 ,                    duration: 5   }),
        new Steps.TempRamp ({ name: "Ramp to Mashout",   target: 78 ,                                  }),
        new Steps.TempHold ({ name: "Mashout Rest"   ,   target: 78 ,                    duration: 5   }),
        new Steps.Manual   ({ name: "Remove Grains"                                                    }),
        new Steps.Manual   ({ name: "Sparge"                                                           }),
        new Steps.TempRamp ({ name: "Ramp to Boil"   ,   target: 105,    pump: "off",                  }),
        new Steps.TempHold ({ name: "Pre-Boil"       ,   target: 105,    pump: "off",    duration: 10  }),
        new Steps.Boil     ({ name: "Boil"           ,   target: 95 ,                    duration: 60  }),
        new Steps.Manual   ({ name: "Add Chiller"                                                      }),
        new Steps.Chill    ({ name: "Chill"          ,   target: 20 ,                    duration: 30  }),
        new Steps.Settle   ({ name: "Settle"         ,                                   duration: 10  }),
        new Steps.Manual   ({ name: "Drain"                                                            }),
        new Steps.TempRamp ({ name: "Ramp to Clean"  ,   target: 35 ,                                  }),
        new Steps.TempHold ({ name: "Clean Hold"     ,   target: 35 ,                    duration: 10  }),
        new Steps.Manual   ({ name: "Finish" })
    ];
    
    this.currentStep   = -1;
    this.stepStartedAt = 0;
    
    this.kettleProbe   = new TemperatureProbe("kettle");
    this.kettleElement = new Element(17, "kettle", this.kettleProbe, 0);
    this.kettlePump    = new Pump("kettle");
    
    // We use a message bus to communicate between components.
    this.messageBus = Postal.channel();

    this.moveNext = function () {
        if (this.currentStep < this.steps.length - 1) {
            this.toStep(this.currentStep + 1)
        }
    };
    
    this.movePrevious = function () {
        if (this.currentStep > 0) {
            this.toStep(this.currentStep - 1);
        }
    };

    this.goToStep = function (name) {
        for (var i = 0; i < this.steps.length; i++) {
            if (this.steps[i].name === name) {
                this.toStep(i);
                return true;
            }
        }
    };
    
    this.toStep = function (stepNo) {
        if (this.currentStep > 0)
            this.steps[this.currentStep].Stop();
        this.currentStep = stepNo;
        this.steps[this.currentStep].Start();
        this.stepStartedAt = Time.Seconds();
        console.log("Starting Step " + this.steps[this.currentStep].name);
    }
    
    this.getCurrentStep = function () {
        return this.steps[this.currentStep];
    };
    
    this.start = function () {
        var self = this;
        
        this.kettleProbe.start();

        this.timer = setInterval(function () {
            var currentStep = self.getCurrentStep();
            self.messageBus.publish("Tick", {
                KettleTemperature: self.kettleProbe.getTemperature(),
                KettleTarget:      self.kettleElement.getTarget(),
                KettlePump:        self.kettlePump.getState(),
                KettleElement:     self.kettleElement.getState(),
                CurrentStep:       { name: currentStep.name, type: currentStep.type, duration: currentStep.duration, remaining: currentStep.timeLeft },
                CurrentTime:       Time.Seconds()
            });
        }, 500);
    };
    
    this.stop = function () {
        clearTimeout(this.timer);
    };
    
    this.messageBus.subscribe("MoveToPreviousStep", function (data) {
        self.movePrevious();
    });

    this.messageBus.subscribe("MoveToNextStep", function (data) {
        self.moveNext();
    });

    this.messageBus.subscribe("MoveToNamedStep", function (data) {
        self.goToStep(data.name);
    });
    
    this.messageBus.subscribe("GetConfiguration", function (data) {
        var steps = [];
        for (var i = 0; i < self.steps.length; i++) {
            var step = self.steps[i];
            steps.push({ type: step.type, name: step.name, targetTemp: step.targetTemp, duration: step.duration });
        }
        self.messageBus.publish("Configuration", {
            steps : steps,
            currentStep : self.getCurrentStep().name
        });
    });
    
    this.messageBus.subscribe("SetKettleTarget", function (data) {
        self.kettleElement.setTarget(data.targetTemp);
    });
    
    this.messageBus.subscribe("SetWortPumpState", function (data) {
        if (data.state === "on")
            self.kettlePump.on();
        else if (data.state === "off")
            self.kettlePump.off();
    });

    this.goToStep("Start");
};

module.exports.Workflow = Workflow;
