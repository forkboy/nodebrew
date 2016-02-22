var Postal = require('postal');
var Time = require('./time.js');

var Step = function (name, type) {
    this.self = this;

    this.name = name;
    this.type = type;

    this.messageBus = Postal.channel();

    this.Start = function () {

    };

    this.Stop = function () {

    };

};

// Manual Step
var Manual = function (name) {
    Step.call(this, name, "Manual");
    
    this.Start = function () {
        var self = this;
        this.subscription = this.messageBus.subscribe("Confirmed", function (data) {
            console.log("publishing a response");
            self.messageBus.publish("MoveToNextStep", {});
        });
    };
    
    this.Stop = function () {
        this.subscription.unsubscribe();
    }
}
Manual.prototype = Object.create(Step.prototype);

//
// Mash Ramp Step
//

var TempRamp = function (name, targetTemp, pumpState) {
    Step.call(this, name, "Ramp");
    this.targetTemp = targetTemp;
    this.pumpState = pumpState == undefined ? true : pumpState;

    this.Start = function () {
        var self = this;
        this.subscription = this.messageBus.subscribe("Tick", function (data) {
            if (data.KettleTemperature >= self.targetTemp) {
                self.messageBus.publish("MoveToNextStep", {});
            }
        });

        this.messageBus.publish("SetKettleTarget",  { targetTemp: this.targetTemp });
        this.messageBus.publish("SetWortPumpState", { state: 1 });
    };
    
    this.Stop = function () {
        this.subscription.unsubscribe();
    }
}
TempRamp.prototype = Object.create(Step.prototype);

//
// Mash Hold Step
//

var TempHold = function (name, duration, pumpState) {
    Step.call(this, name, "Hold");
    this.duration = duration;
    this.timeLeft = 0;
    this.pumpState = pumpState == undefined ? true : pumpState;

    this.Start = function () {
        var self = this;
        this.startedAt = Time.Seconds();
        this.subscription = this.messageBus.subscribe("Tick", function (data) {
            self.timeLeft = (self.duration * 60) + self.startedAt - data.CurrentTime;
            if (self.timeLeft <= 0) {
                self.messageBus.publish("MoveToNextStep", {});
            }
        });
    };

    this.Stop = function () {
        this.subscription.unsubscribe();
    }
}

TempHold.prototype = Object.create(Step.prototype);

// Boil
var Boil = function (name, duration) {
    Step.call(this, name, "Boil");
    this.duration = duration;

    this.Start = function () {
        var self = this;
        this.startedAt = Time.Seconds();
        this.subscription = this.messageBus.subscribe("Tick", function (data) {
            if (data.CurrentTime >= (self.duration * 60) + self.startedAt) {
                self.messageBus.publish("MoveToNextStep", {});
            }
        });
    };

    this.Stop = function () {
        this.subscription.unsubscribe();
    }
}
Boil.prototype = Object.create(Step.prototype);

// Chill
var Chill = function (name, temperature, duration) {
    Step.call(this, name, "Chill");
    this.targetTemp = temperature;
    this.duration = duration;

    this.Start = function () {
        var self = this;
        this.startedAt = Time.Seconds();
        this.subscription = this.messageBus.subscribe("Tick", function (data) {
            // Either the time is reached, or the temperature is equal or below our target
            if ((data.CurrentTime >= (self.duration * 60) + self.startedAt) ||
                (data.KettleTemperature <= self.targetTemp)) {
                self.messageBus.publish("MoveToNextStep", {});
            }
        });
    };
    
    this.Stop = function () {
        this.subscription.unsubscribe();
    }
}
Chill.prototype = Object.create(Step.prototype);


// Settle
var Settle = function (name, duration) {
    Step.call(this, name, "Settle");
    this.duration = duration;

    this.Start = function () {
        var self = this;
        this.startedAt = Time.Seconds();
        this.subscription = this.messageBus.subscribe("Tick", function (data) {
            if (data.CurrentTime >= (self.duration * 60) + self.startedAt) {
                self.messageBus.publish("MoveToNextStep", {});
            }
        });
    };
    
    this.Stop = function () {
        this.subscription.unsubscribe();
    }
}
Settle.prototype = Object.create(Step.prototype);

module.exports.Manual = Manual;
module.exports.TempRamp = TempRamp;
module.exports.TempHold = TempHold;
module.exports.Boil = Boil;
module.exports.Chill = Chill;
module.exports.Settle = Settle;
