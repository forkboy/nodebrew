var Steps            = require('./steps.js');
var TemperatureProbe = require('./temperature.js');
var Pump             = require('./pump.js');
var Time             = require('./time.js');
var Element          = require('./element.js');
var Postal           = require("postal");
var Schedule         = require('./schedule.js');

var Workflow = function () {
    var self = this;

    this.steps = [
        new Steps.Manual   ({ name: "Start"                                                            }),
        new Steps.Manual   ({ name: "Add Mash Water"                                                   }),
        new Steps.TempRamp ({ name: "Ramp to Strike" ,   target: 30 ,                                  }),
        new Steps.Manual   ({ name: "Add Grains"                                                       }),
        new Steps.TempRamp ({ name: "Ramp to Protien",   target: 50 ,                                  }),
        new Steps.TempHold ({ name: "Protien Rest"   ,   target: 50 ,                    duration: 5   }),
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
        new Steps.Manual   ({ name: "Finish"                                                           }),
        new Steps.Shutdown ({ name: "Shutdown"                                                         })
    ];
    
    this.currentStep   = 0;
    this.stepStartedAt = 0;
    this.mashSchedule = new Schedule();

    this.kettleProbe   = new TemperatureProbe("kettle");
    this.kettleElement = new Element(18, "kettle", this.kettleProbe, 0);
    this.kettlePump    = new Pump(24, "kettle");
    
    // We use a message bus to communicate between components.
    this.messageBus = Postal.channel();
    
    /*
     * Finds the next enabled step from the start point in the direction requested
     */
    this.findNextEnabled = function (startPoint, direction) {
        var nextEnabled = startPoint + direction;
        while (nextEnabled <= this.steps.length - 1 && nextEnabled >= 0 && this.steps[nextEnabled].enabled === false) {
            nextEnabled = nextEnabled + direction;
        }
        
        if (nextEnabled <= this.steps.length - 1 && nextEnabled >= 0)
            return nextEnabled;

        return startPoint;
    }
    
    /* 
     * Moves to the next enabled step, if possible
     */
    this.moveNext = function () {
        this.toStep(this.findNextEnabled(this.currentStep, 1))
    };
    
    /*
     * Moves to the nearest prior step that is enabled, if possible
     */
    this.movePrevious = function () {
        this.toStep(this.findNextEnabled(this.currentStep, -1));
    };

    /*
     * Goes to the named step, or the nearest step that is enabled
     */
    this.goToStep = function (name) {
        for (var i = 0; i < this.steps.length; i++) {
            if (this.steps[i].name === name) {
                if (this.steps[i].enabled === false)
                    this.toStep(this.findNextEnabled(i, 1));
                else
                    this.toStep(i);
                return true;
            }
        }
    };
    
    /*
     * Internal Use - moves to a step and sets up tracking parameters
     */
    this.toStep = function (stepNo) {
        this.steps[this.currentStep].Stop();
        this.currentStep = stepNo;
        this.steps[this.currentStep].Start();
        this.stepStartedAt = Time.Seconds();
        console.log("Starting Step " + this.steps[this.currentStep].name);
    }
    
    /*
     * Returns the current step
     */
    this.getCurrentStep = function () {
        return this.steps[this.currentStep];
    };
    
    /*
     * returns the step with the given name, or null if not found
     */
    this.getStepNamed = function (name) {
        for (var i = 0; i < this.steps.length; i++) {
            if (this.steps[i].name === name)
                return this.steps[i];
        }
    };
    
    /*
     * Given a mash schedule, applies the changes to the system workflow
     */
    this.applyMashSchedule = function (schedule) {
        for (var j = 0; j < schedule.schedule.length; j++) {
            var s = schedule.schedule[j];
            for (var i = 0; i < this.steps.length; i++) {
                var step = this.steps[i];
                if (step.name === ("Ramp to " + s.name)) {
                    step.target = s.target;
                    step.enabled = s.enabled === undefined ? true : s.enabled;
                }
                else if (step.name === (s.name + " Rest")) {
                    step.target = s.target;
                    step.duration = s.duration;
                    step.enabled = s.enabled === undefined ? true : s.enabled;
                }
            }
        }
        this.mashSchedule = schedule;
    };
    
    /*
     * Starts the workflow engine
     */
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
            if (step.enabled === true)
                steps.push({ type: step.type, name: step.name, targetTemp: step.targetTemp, duration: step.duration });
        }
        self.messageBus.publish("Configuration", {
            steps        : steps,
            currentStep  : self.getCurrentStep().name,
            mashSchedule : self.mashSchedule.schedule,
            presetName   : self.mashSchedule.name
        });
    });
    
    this.messageBus.subscribe("SaveMashSchedule", function (data) {
        console.log("Saving mash schedule");
        console.log(data);
        self.mashSchedule.schedule = data.data
        self.mashSchedule.save();
        self.applyMashSchedule(self.mashSchedule);
        self.messageBus.publish("GetConfiguration");
    });
    
    this.messageBus.subscribe("LoadPresetMashSchedule", function (data) {
        console.log("Loading preset mash schedule");
        self.mashSchedule = new Schedule(data.name);
        self.mashSchedule.load();
        self.applyMashSchedule(self.mashSchedule);
        self.messageBus.publish("GetConfiguration");
    });
    
    this.messageBus.subscribe("SetKettleTarget", function (data) {
        self.kettleElement.setTarget(data.target);
    });
    
    this.messageBus.subscribe("SetWortPumpState", function (data) {
        if (data.state === "on")
            self.kettlePump.on();
        else if (data.state === "off")
            self.kettlePump.off();
    });
    
    this.initialise = function() {
        this.goToStep("Start");
        
        this.mashSchedule.load();
        self.applyMashSchedule(self.mashSchedule);
    };
};

module.exports.Workflow = Workflow;
