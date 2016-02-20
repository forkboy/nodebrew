var PID = require('liquid-pid');
var PIBlaster = require('pi-blaster.js');

var Element = function (pin, name, temperatureSensor, targetTemperature, pid) {
    this.pin = pin;
    this.name = name;
    this.targetTemperature = targetTemperature;
    this.temperatureSensor = temperatureSensor;
    this.pid = new PID({
        temp: {
            ref: 0         // Point temperature                                       
        },
        Pmax: 1000,       // Max power (output),
        
        // Tune the PID Controller
        Kp: 25,           // PID: Kp
        Ki: 1000,         // PID: Ki
        Kd: 9             // PID: Kd
    });
}

Element.prototype.setTarget = function (targetTemperature) {
    this.targetTemperature = targetTemperature;
    
    this.pid.setPoint(targetTemperature);

    this.timer = setInterval(function () {
        var power = this.pid.calculate(this.temperatureSensor.getTemperature());
        PIBlaster.power(this.pin, power); //in theory - see https://github.com/sarfata/pi-blaster.js
    }, 500)
};

Element.prototype.off = function () {
    clearInterval(this.timer);
    PIBlaster.power(this.pin, 0);
};

module.exports = Element;