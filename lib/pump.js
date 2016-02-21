var gpio = require("gpio");

var Pump = function (pin, name) {
    this.pin = pin;
    this.name = name;
    this.state = 0;

    this.pumpIO = gpio.export(pin, {
        direction: "out",
        ready: function () {
        }
    });

    this.on = function () {
        this.state = 1;
        this.pumpIO.set(this.state);
    }

    this.off = function () {
        this.state = 0;
        this.pumpIO.set(this.state);    }

    this.getState = function () {
        return this.state;
    }
};

Pump.prototype.on = function () {
    this.pumpIO.set(1);
}

Pump.prototype.off = function () {
    this.pumpIO.set(0);
}

module.exports = Pump;