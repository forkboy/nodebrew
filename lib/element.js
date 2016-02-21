var PID = require('liquid-pid');
var PIBlaster = require('pi-blaster.js');

var Element = function (pin, name, temperatureSensor, targetTemperature, pid) {
    var self = this;

    this.pin = pin;
    this.name = name;
    this.targetTemperature = targetTemperature;
    this.temperatureSensor = temperatureSensor;
    this.power = 0;

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

    this.getTarget = function () {
        return this.targetTemperature;
    }

    this.setTarget = function (targetTemperature) {
        this.targetTemperature = targetTemperature;
        
        this.pid.setPoint(targetTemperature);
        
        this.timer = setInterval(function () {
            self.power = this.pid.calculate(this.temperatureSensor.getTemperature());
            PIBlaster.setPwm(this.pin, self.power); //in theory - see https://github.com/sarfata/pi-blaster.js
        }, 500)
    };
    
    this.on = function () {
        if (this.timer)
            clearInterval(this.timer);
        this.power = 100;
        PIBlaster.setPwm(this.pin, this.power);
    };

    this.off = function () {
        if (this.timer)
            clearInterval(this.timer);
        this.power = 0;
        PIBlaster.setPwm(this.pin, this.power);
    };

    this.getState = function () {
        return this.power;
    }
}

module.exports = Element;