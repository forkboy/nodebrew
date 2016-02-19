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
var TempRamp = function (name, targetTemp, pumpState) {
    Step.call(this, name, "Ramp");
    this.targetTemp = targetTemp;
    this.pumpState = pumpState == undefined ? true : pumpState;
}
TempRamp.prototype = Object.create(Step.prototype);

TempRamp.prototype.on = function (workflow, event) {
    if (event.type === "TemperatureReached")
        workflow.moveNext();
}


// Mash Hold Step
var TempHold = function (name, duration, pumpState) {
    Step.call(this, name, "Hold");
    this.duration = duration;
    this.pumpState = pumpState == undefined ? true : pumpState;
}
TempHold.prototype = Object.create(Step.prototype);

TempHold.prototype.on = function (workflow, event) {
    if (event.type === "TimeExpired")
        workflow.moveNext();
}


// Boil
var Boil = function (name, duration) {
    Step.call(this, name, "Boil");
    this.duration = duration;
}
Boil.prototype = Object.create(Step.prototype);

Boil.prototype.on = function (workflow, event) {
    if (event.type === "TimeExpired")
        workflow.moveNext();
}


// Chill
var Chill = function (name, duration) {
    Step.call(this, name, "Chill");
    this.duration = duration;
}
Chill.prototype = Object.create(Step.prototype);

Chill.prototype.on = function (workflow, event) {
    if (event.type === "TimeExpired")
        workflow.moveNext();
}

// Settle
var Settle = function (name, duration) {
    Step.call(this, name, "Settle");
    this.duration = duration;
}
Settle.prototype = Object.create(Step.prototype);

Settle.prototype.on = function (workflow, event) {
    if (event.type === "TimeExpired")
        workflow.moveNext();
}

module.exports.Manual = Manual;
module.exports.TempRamp = TempRamp;
module.exports.TempHold = TempHold;
module.exports.Boil = Boil;
module.exports.Chill = Chill;
module.exports.Settle = Settle;
