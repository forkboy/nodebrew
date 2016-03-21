var Postal = require('postal');
var Time = require('./time.js');

var Step = function (config) {
    var self = this;
    
    this.name       = config.name;
    this.type       = config.type;
    this.duration   = config.duration   == undefined ? 0         : config.duration;
    this.target     = config.target     == undefined ? 0         : config.target;
    this.targetType = config.targetType == undefined ? 'temp'    : config.targetType
    this.pumpState  = config.pump       == undefined ? 'on'      : config.pump;
    this.enabled    = config.enabled    == undefined ? true      : config.enabled;
    
    this.subscription = null;

    this.timeLeft = 0;
    
    if (this.pumpState !== 'on' && this.pumpState !== 'off')
        throw ("pump state has an invalid value. Please use 'on' or 'off'");

    this.messageBus = Postal.channel();
    
    this.Start = function () {
        
        this.timeLeft = this.duration;
        this.startedAt = Time.Seconds();

        if (this.type === "Manual") {
            this.subscription = this.messageBus.subscribe("Confirmed", function (data) {
                console.log(this.name + ":MoveNext => User confirmed manual step.");
                self.messageBus.publish("MoveToNextStep", {});
            });
        }
        
        if (this.type === "Ramp") {
            this.subscription = this.messageBus.subscribe("Tick", function (data) {
                if (data.KettleTemperature >= self.target) {
                    console.log(this.name + ": MoveNext => " + data.KettleTemperature + " > " + self.target);
                    self.messageBus.publish("MoveToNextStep", {});
                }
            });
        }
        else if (this.type === "Hold" || this.type === "Boil") {
            this.subscription = this.messageBus.subscribe("Tick", function (data) {
                if (self.isTimeStepComplete(data)) {
                    console.log(self.name + ": MoveNext => (self.duration * 60) + self.startedAt - data.CurrentTime => " + (self.duration * 60) + " + " + self.startedAt + "-" + data.CurrentTime + "<= 0");
                    self.messageBus.publish("MoveToNextStep", {});
                }
            });
        }
        else if (this.type === "Chill") {
            this.subscription = this.messageBus.subscribe("Tick", function (data) {
                // We're looking for a low target temp for chilling, or timeout
                if (self.isTimeStepComplete(data) || 
                    data.KettleTemperature <= self.target) {
                    console.log(this.name + ": MoveNext => " + self.timeLeft + " <= " + self.target);
                    self.messageBus.publish("MoveToNextStep", {});
                }
            });
        }

        this.messageBus.publish("SetKettleTarget",  { target: this.target, type: this.targetType });
        this.messageBus.publish("SetWortPumpState", { state: this.pumpState });
    };

    this.Stop = function () {
        if (this.subscription)
            this.subscription.unsubscribe();
    };

    this.isTimeStepComplete = function (data) {
        self.timeLeft = (self.duration * 60) + self.startedAt - data.CurrentTime;
        return self.timeLeft <= 0;
    }

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
    
    this.Start = function () {

    };

    config.type = "Boil";
    config.target = 0.8;
    config.targetType = "power";
    config.pump   = "off";

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
    config.pump   = "off";

    Step.call(this, config);
}
Settle.prototype = Object.create(Step.prototype);

var Shutdown = function (config) {
    
    config.type = "Shutdown";
    Step.call(this, config);

    this.Start = function () {
        var powerOff = require('power-off');

        powerOff(function (err, stderr, stdout) {
            if (!err && !stderr) {
                console.log(stdout);
            }
        });
    };
};
Shutdown.prototype = Object.create(Step.prototype);

module.exports.Manual = Manual;
module.exports.TempRamp = TempRamp;
module.exports.TempHold = TempHold;
module.exports.Boil = Boil;
module.exports.Chill = Chill;
module.exports.Settle = Settle;
module.exports.Shutdown = Shutdown;
