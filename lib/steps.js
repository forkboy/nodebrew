var Postal = require('postal');
var Time = require('./time.js');

var Step = function (config) {
    var self = this;
    
    this.name       = config.name;
    this.type       = config.type;
    this.duration   = config.duration == undefined ? 0    : config.duration;
    this.target     = config.target   == undefined ? 0    : config.target;
    this.pumpState  = config.pump     == undefined ? 'on' : config.pump;
    this.enabled    = config.enabled  == undefined ? true : config.enabled;

    this.timeLeft = 0;
    
    if (this.pumpState !== 'on' && this.pumpState !== 'off')
        throw ("pump state has an invalid value. Please use 'on' or 'off'");

    this.messageBus = Postal.channel();
    
    this.Start = function () {
        
        this.timeLeft = this.duration;
        this.startedAt = Time.Seconds();

        if (this.type === "Manual") {
            this.confirmSub = this.messageBus.subscribe("Confirmed", function (data) {
                self.messageBus.publish("MoveToNextStep", {});
            });
        }
        
        if (this.type === "Ramp") {
            this.tickTempSub = this.messageBus.subscribe("Tick", function (data) {
                if (data.KettleTemperature >= self.target) {
                    self.messageBus.publish("MoveToNextStep", {});
                }
            });
        }
        
        if (this.type === "Hold" || this.type === "Boil" || this.type === "Chill") {
            this.tickTimeSub = this.messageBus.subscribe("Tick", function (data) {
                self.timeLeft = (self.duration * 60) + self.startedAt - data.CurrentTime;
                if (self.timeLeft <= 0) {
                    self.messageBus.publish("MoveToNextStep", {});
                }
            });
        }
        
        if (this.type === "Chill") {
            this.tickTempSub = this.messageBus.subscribe("Tick", function (data) {
                // We're looking for a low target temp for chilling
                if (data.KettleTemperature <= self.target) {
                    self.messageBus.publish("MoveToNextStep", {});
                }
            });
        }

        this.messageBus.publish("SetKettleTarget",  { target: this.target });
        this.messageBus.publish("SetWortPumpState", { state: this.pumpState });
    };

    this.Stop = function () {
        if (this.confirmSub)
            this.confirmSub.unsubscribe();
        if (this.tickTempSub)
            this.tickTempSub.unsubscribe();
        if (this.tickTimeSub)
            this.tickTimeSub.unsubscribe();
    };

};

// Manual Step
var Manual = function (config) {
    
    // set some defaults
    config.target = config.target == undefined ? 0     : config.target; // default to off
    config.pump   = config.pump   == undefined ? 'off' : config.pump;  // default to off
    config.type   = "Manual";

    Step.call(this, config);
}
Manual.prototype = Object.create(Step.prototype);

//
// Mash Ramp Step
//

var TempRamp = function (config) {
    
    // set some defaults
    config.pump = config.pump == undefined ? 'on' : config.pump;
    config.type = "Ramp";

    if (config.target === undefined)
        throw ('Invalid operation - Ramp step must have a target temperature assigned');

    Step.call(this, config);
}
TempRamp.prototype = Object.create(Step.prototype);

//
// Mash Hold Step
//

var TempHold = function (config) {
    
    // Default pump to ON
    config.pump = config.pump == undefined ? 'on' : config.pump;
    config.type = "Hold";

    if (config.target === undefined)
        throw ('Invalid operation - Ramp step must have a target temperature assigned');

    Step.call(this, config);
}

TempHold.prototype = Object.create(Step.prototype);

// Boil
var Boil = function (config) {

    if (config.duration === undefined)
        throw ('Invalid operation - Boil step must have a duration specified');
    
    config.type = "Boil";
    config.target = 105;
    config.pump = "off";

    Step.call(this, config);
}
Boil.prototype = Object.create(Step.prototype);

// Chill
var Chill = function (config) {
    
    if (config.duration === undefined && config.temperature === undefined)
        throw ('Invalid operation - Chill step must have a duration or target temperature specified');
    
    config.type = "Chill";
    config.pump = "on";

    Step.call(this, config);
}
Chill.prototype = Object.create(Step.prototype);


// Settle
var Settle = function (config) {
    
    if (config.duration === undefined)
        throw ('Invalid operation - Settle step must have a duration');

    config.type = "Hold";
    config.target = 0;
    config.pump = "off";

    Step.call(this, config);
}
Settle.prototype = Object.create(Step.prototype);

module.exports.Manual = Manual;
module.exports.TempRamp = TempRamp;
module.exports.TempHold = TempHold;
module.exports.Boil = Boil;
module.exports.Chill = Chill;
module.exports.Settle = Settle;
