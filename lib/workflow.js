var Steps = require('./steps.js');
var Events = require('./events.js');
var TemperatureProbe = require('./temperature.js');
var Pump = require('./pump.js');
var Time = require('./time.js');

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
    
    this.time = new Time();

    this.currentStep = 0;
    this.stepStartedAt = 0;
    this.context = new Context(0, 0, 0, 0);

    this.wortTemperatureProbe = new TemperatureProbe("wort");
    this.wortPump = new Pump("wort");
};

Workflow.prototype.event = function (e) {
    var cs = this.getCurrentStep();
    cs.on(this, e);
};

Workflow.prototype.StartStep = function () {
    this.stepStartedAt = this.time.MachineSeconds();
};

Workflow.prototype.getCurrentStep = function () {
    return this.steps[this.currentStep];
};

Workflow.prototype.moveNext = function () {
    if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        this.StartStep();
    }
};

Workflow.prototype.movePrevious = function () {
    if (this.currentStep > 0) {
        this.currentStep--;
        this.StartStep();
    }
};

Workflow.prototype.goToStep = function (name) {
    for (var i = 0; i < this.steps.length; i++) {
        if (this.steps[i].name === name) {
            this.currentStep = i;
            this.StartStep();
            return true;
        }
    }
};

Workflow.prototype.stop = function () {
    clearTimeout(this.timer);
};

Workflow.prototype.start = function () {
    this.timer = setInterval(this.onTick(this), 500);
};

Workflow.prototype.onTick = function (self) {
    if (this.checkForTimeExpired()) {
        this.getCurrentStep().on(new Events.TimeExpiredEvent());
    }
};

Workflow.prototype.checkForTimeExpired = function () {
    if (this.getCurrentStep().duration == undefined)
        return false;

    var stepDurationSeconds = this.getCurrentStep().duration * 60;
    return this.stepStartedAt + stepDurationSeconds < this.time.MachineSeconds();
};

module.exports.Workflow = Workflow;
module.exports.Context = Context;
