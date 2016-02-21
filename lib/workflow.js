var Steps            = require('./steps.js');
var Events           = require('./events.js');
var TemperatureProbe = require('./temperature.js');
var Pump             = require('./pump.js');
var Time             = require('./time.js');
var Element          = require('./element.js');
var Postal           = require("postal");

var Context = function (temperature, targetTemp, pumpState, elementState) {
    this.temperature = temperature;
    this.targetTemp = targetTemp;
    this.pumpState = pumpState;
    this.elementState = elementState;
}

var Workflow = function () {
    var self = this;

    this.steps = [
        //                   Name             Temp (C)  Duration (mins)
        new Steps.Manual   ("Start"                                   ),
        new Steps.Manual   ("Add Mash Water"                          ),
        new Steps.TempRamp ("Ramp to Strike" , 30                     ),
        new Steps.Manual   ("Add Grains"                              ),
        new Steps.TempRamp ("Ramp to Protien", 50                     ),
        new Steps.TempHold ("Protein Rest"   ,                5       ),
        new Steps.TempRamp ("Ramp to Sacc 1" , 62                     ),
        new Steps.TempHold ("Sacc 1 Rest"    ,                5       ),
        new Steps.TempRamp ("Ramp to Sacc 2" , 65                     ),
        new Steps.TempHold ("Sacc 2 Rest"    ,                5       ),
        new Steps.TempRamp ("Ramp to Sacc 3" , 65                     ),
        new Steps.TempHold ("Sacc 3 Rest"    ,                5       ),
        new Steps.TempRamp ("Ramp to Mashout", 78                     ),
        new Steps.TempHold ("Mashout Rest"   ,                10      ),
        new Steps.Manual   ("Remove Grains"                           ),
        new Steps.Manual   ("Sparge"                                  ),
        new Steps.TempRamp ("Ramp to Boil"   , 105                    ),
        new Steps.TempHold ("Pre-Boil"       ,                10      ),
        new Steps.Boil     ("Boil"           , 60                     ),
        new Steps.Manual   ("Add Chiller"                             ),
        new Steps.Chill    ("Chill"          ,                30      ),
        new Steps.Settle   ("Settle"         ,                10      ),
        new Steps.Manual   ("Drain"                                   ),
        new Steps.TempRamp ("Ramp to Clean"  , 35                     ),
        new Steps.TempHold ("Clean Hold"     ,                10      ),
        new Steps.Manual   ("Finish"                                  )
    ];
    
    this.currentStep = -1;
    this.stepStartedAt = 0;
    this.context = new Context(0, 0, 0, 0);
    
    this.kettleProbe = new TemperatureProbe("kettle");
    this.kettleElement = new Element(17, "kettle", this.kettleProbe, 0);
    this.kettlePump = new Pump("kettle");
    
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
        this.timer = setInterval(function () {
            self.messageBus.publish("Tick", {
                KettleTemperature: self.kettleProbe.getTemperature(),
                KettleTarget: self.kettleElement.getTarget(),
                KettlePump: self.kettlePump.getState(),
                KettleElement: self.kettleElement.getState(),
                CurrentStep: self.getCurrentStep().name,
                CurrentTime: Time.Seconds()
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

    this.goToStep("Start");
};

module.exports.Workflow = Workflow;
module.exports.Context = Context;
