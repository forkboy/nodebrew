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
    this.targetType = "temp";
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
        return {
            target: this.targetType === "power" ? this.power : this.targetTemperature,
            type: this.targetType
        };
    }
    
    this.setTarget = function (target) {
        if (target.type === "power") {
            this.setPower(target.target);
        }
        else {
            this.setTargetTemp(target.target);
        }
    }

    /*
     * sets a new target and uses the PID algorithm to regulate power output
     */
    this.setTargetTemp = function (targetTemperature) {
        this.targetTemperature = targetTemperature;
        this.power = 0; 
        this.targetType = "temp";
        
        if (targetTemperature == 0) {
            this.off();
            return;
        }

        // feed the target into thr PID
        this.pid.setPoint(targetTemperature);
        
        // Set up a timer that calculates the new output as temperature changes
        if (!this.timer) {
            this.timer = setInterval(function () {
                // Get the current temperature
                var temperature = self.temperatureSensor.getTemperature();
                
                // calculate the power as a fraction of 1
                self.power = parseFloat(self.pid.calculate(temperature)) / parseFloat(2000); // %power based on available power output
                
                // apply the power to the PWM output pin
                console.log("setting power output to " + self.power + "% on pin " + self.pin);
                
                PIBlaster.setPwm(self.pin, self.power); //in theory - see https://github.com/sarfata/pi-blaster.js
            }, 500);
        }
        
        // Notify the system that a new target has been set on this element
        this.messageBus.publish("ElementTargetSet", { name: this.name, target: targetTemperature });
    };
    
    /*
     * Turns the element on to specific power output. expects a decimal between 0 and 1
     */
    this.setPower = function (power) {
        this.targetTemperature = 0;
        this.targetType = "power";

        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.power = power;
        PIBlaster.setPwm(this.pin, this.power);
        
        if (this.power > 0)
            this.messageBus.publish("ElementOn", { name: this.name });
        else
            this.messageBus.publish("ElementOff", { name: this.name });
    };

    /*
     * Turns the element on to 100% power output
     */
    this.on = function () {
        this.setPower(1);
    };
    
    /*
     * Sets power to 0%
     */
    this.off = function () {
        this.setPower(0);
    };
    
    /*
     * returns the current PWM setting
     */
    this.getState = function () {
        return this.power;
    }
}

module.exports = Element;