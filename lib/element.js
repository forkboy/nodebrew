var PID       = require('liquid-pid');
var PIBlaster = require('pi-blaster.js');
var Postal    = require('postal');

/**
 *  Represents a heating element (electic) applied to a body of liquid based on http://en.wikipedia.org/wiki/PID_controller
 */
var Element = function (pin, name, temperatureSensor, targetTemperature, pid) {
    var self = this;

    this.pin = pin;
    this.name = name;
    this.targetTemperature = targetTemperature;
    this.temperatureSensor = temperatureSensor;
    this.power = 0.0;
    
    this.messageBus = Postal.channel();

    this.pid = new PID({
        temp: {
            ref: 0         // Point temperature                                       
        },
        Pmax: 2000         // Max power (output),
    });
    
    /*
     * returns the current target
     */
    this.getTarget = function () {
        return this.targetTemperature;
    }
    
    /*
     * sets a new target and uses the PID algorithm to regulate power output
     */
    this.setTarget = function (targetTemperature) {
        this.targetTemperature = targetTemperature;
        
        // feed the target into thr PID
        this.pid.setPoint(targetTemperature);
        
        // Set up a timer that calculates the new output as temperature changes
        this.timer = setInterval(function () {
            // Get the current temperature
            var temperature = self.temperatureSensor.getTemperature();
            
            // calculate the power as a fraction of 1
            self.power = parseFloat(self.pid.calculate(temperature)) / parseFloat(2000); // %power based on available power output
            
            // apply the power to the PWM output pin
            PIBlaster.setPwm(self.pin, self.power); //in theory - see https://github.com/sarfata/pi-blaster.js
        }, 500);
        
        // Notify the system that a new target has been set on this element
        this.messageBus.publish("ElementTargetSet", { name: this.name, target: targetTemperature });
    };
    
    /*
     * Turns the element on to 100% power output
     */
    this.on = function () {
        if (this.timer)
            clearInterval(this.timer);
        this.power = 100;
        PIBlaster.setPwm(this.pin, this.power);

        this.messageBus.publish("ElementOn", { name: this.name });
    };
    
    /*
     * Sets power to 0%
     */
    this.off = function () {
        if (this.timer)
            clearInterval(this.timer);
        this.power = 0;
        PIBlaster.setPwm(this.pin, this.power);

        this.messageBus.publish("ElementOff", { name: this.name });
    };
    
    /*
     * returns the current PWM setting
     */
    this.getState = function () {
        return this.power;
    }
}

module.exports = Element;