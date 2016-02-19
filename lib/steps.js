var Events = require('./events.js');

var Step = function (name, type) {
    this.name = name;
    this.type = type;
};

// Manual Step
var Manual = function (name) {
    Step.call(this, name, "Manual");
}
Manual.prototype = Object.create(Step.prototype);

Manual.prototype.on = function (workflow, event) {
    if (event.type === "Input")
        workflow.moveNext();
}


// Mash Ramp Step
var MashRampStep = function (name, targetTemp) {
    Step.call(this, name, "Ramp");
    this.targetTemp = targetTemp;
}
MashRampStep.prototype = Object.create(Step.prototype);

MashRampStep.prototype.on = function (workflow, event) {
    if (event.type === "TemperatureReached")
        workflow.moveNext();
}


// Mash Hold Step
var MashHoldStep = function (name, duration) {
    Step.call(this, name, "Hold");
    this.duration = duration;
}
MashHoldStep.prototype = Object.create(Step.prototype);

MashHoldStep.prototype.on = function (workflow, event) {
    if (event.type === "TimeExpired")
        workflow.moveNext();
}


// Boil
var BoilStep = function (name, duration) {
    Step.call(this, name, "Boil");
    this.duration = duration;
}
BoilStep.prototype = Object.create(Step.prototype);

BoilStep.prototype.on = function (workflow, event) {
    if (event.type === "TimeExpired")
        workflow.moveNext();
}


// Chill
var ChillStep = function (name, duration) {
    Step.call(this, name, "Chill");
    this.duration = duration;
}
ChillStep.prototype = Object.create(Step.prototype);

ChillStep.prototype.on = function (workflow, event) {
    if (event.type === "TimeExpired")
        workflow.moveNext();
}

// Settle
var SettleStep = function (name, duration) {
    Step.call(this, name, "Settle");
    this.duration = duration;
}
SettleStep.prototype = Object.create(Step.prototype);

SettleStep.prototype.on = function (workflow, event) {
    if (event.type === "TimeExpired")
        workflow.moveNext();
}

module.exports.Manual = Manual;
module.exports.MashRampStep = MashRampStep;
module.exports.MashHoldStep = MashHoldStep;
module.exports.BoilStep = BoilStep;
module.exports.ChillStep = ChillStep;
module.exports.SettleStep = SettleStep;
