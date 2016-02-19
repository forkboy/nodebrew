var Steps = require('./steps.js');
var Events = require('./events.js');
var TemperatureProbe = require('./temperature.js');
var Pump = require('./pump.js');

var Context = function (temperature, targetTemp, pumpState, elementState) {
    this.temperature = temperature;
    this.targetTemp = targetTemp;
    this.pumpState = pumpState;
    this.elementState = elementState;
}

var Workflow = function () {
    this.steps = [
        new Steps.Manual("Start"),
        new Steps.Manual("Add Mash Water"),
        new Steps.MashRampStep("Ramp to Strike", 30),
        new Steps.Manual("Add Grains"),
        new Steps.MashRampStep("Ramp to Protien", 50),
        new Steps.MashHoldStep("Protein Rest", 5),
        new Steps.MashRampStep("Ramp to Sacc 1", 62),
        new Steps.MashHoldStep("Sacc 1 Rest", 5),
        new Steps.MashRampStep("Ramp to Sacc 2", 65),
        new Steps.MashHoldStep("Sacc 2 Rest", 5),
        new Steps.MashRampStep("Ramp to Sacc 3", 65),
        new Steps.MashHoldStep("Sacc 3 Rest", 5),
        new Steps.MashRampStep("Ramp to Mashout", 78),
        new Steps.MashHoldStep("Mashout Rest", 10),
        new Steps.Manual("Remove Grains"),
        new Steps.Manual("Sparge"),
        new Steps.MashRampStep("Ramp to Boil", 105),
        new Steps.MashHoldStep("Pre-Boil", 10),
        new Steps.BoilStep("Boil", 60),
        new Steps.Manual("Add Chiller"),
        new Steps.ChillStep("Chill", 30),
        new Steps.SettleStep("Chill", 30),
        new Steps.Manual("Finish")
    ];

    this.currentStep = 0;
    this.context = new Context(0, 0, 0, 0);

    this.wortTemperatureProbe = new TemperatureProbe("wort");
    this.wortPump = new Pump("wort");
};

Workflow.prototype.event = function (e) {
    var cs = this.getCurrentStep();
    cs.on(this, e);
};

Workflow.prototype.getCurrentStep = function () {
    return this.steps[this.currentStep];
};

Workflow.prototype.moveNext = function () {
    if (this.currentStep < this.steps.length - 1)
        this.currentStep++;
}

Workflow.prototype.movePrevious = function () {
    if (this.currentStep > 0)
        this.currentStep--; 
}

Workflow.prototype.goToStep = function (name) {
    for(var i = 0; i < this.steps.length; i++)
    {
        if (this.steps[i].name === name) {
            this.currentStep = i;
            return true;
        }
    }
}

Workflow.prototype.stop = function () {
    clearTimeout(this.timer);
}

Workflow.prototype.start = function () {
    this.timer = setInterval(this.onTick(this), 500);
}

Workflow.prototype.onTick = function (self) {

}

module.exports.Workflow = Workflow;
module.exports.Context = Context;
