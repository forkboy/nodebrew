var gpio = require("gpio");

var Pump = function (pin, name) {
    this.pin = pin;
    this.name = name;

    this.pumpIO = gpio.export(pin, {
        direction: "out",
        ready: function () {
        }
    });
};

Pump.prototype.on = function () {
    this.pumpIO.set(1);
}

Pump.prototype.off = function () {
    this.pumpIO.set(0);
}

module.exports = Pump;