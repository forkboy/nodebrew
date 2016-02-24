var gpio             = require("gpio"),
    sinon            = require('sinon'),
    PIBlaster        = require('pi-blaster.js'),
    TemperatureProbe = require('./temperature.js'),
    Postal           = require('postal'),
    ds18b20          = require('ds18b20');

var Simulator = function (workflow) {
    var self = this;
    
    this.messageBus = Postal.channel();
    this.power = 0;
    this.lastTemp = 24.5;
    this.powerSim;

    this.initialise = function () {
        
        for (var i = 0; i < workflow.steps.length; i++) {
            if (workflow.steps[i].duration)
                workflow.steps[i].duration = 0;
        }

        // mock out the temperature sensor
        sinon.stub(workflow.kettleProbe.ds18b20, "sensors", function (callback) {
            callback("", ["12345"]);
        });
        
        workflow.kettleProbe.ds18b20.sensors(function () {
            
        });

        sinon.stub(workflow.kettleProbe.ds18b20, "temperature", function (id, callback) {
            callback("", self.lastTemp);
        });
        
        // intercept PIBlaster calls, and start simulating a raise in kettle temperature.
        sinon.stub(PIBlaster, "setPwm", function (pin, power) {
            self.power = power;
            self.simulatePower();
        });
        
        // intercept gpio on the pump
        sinon.stub(workflow.kettlePump.pumpIO, "export", function (direction, callback) {
            // do nothing
        });
                
        sinon.stub(workflow.kettlePump.pumpIO, "set", function (state) {
            self.pumpState = state;
        });        
    };

    this.simulatePower = function () {
        if (this.power > 0) {
            this.powerSim = setTimeout(function () {
                self.lastTemp = parseFloat(self.lastTemp) + 0.5 * parseFloat(self.power); // raise by one degree per second, or part based on power output
            }, 100);
        } else {
            clearTimeout(this.powerSim);
        }
    }
}


module.exports = Simulator;