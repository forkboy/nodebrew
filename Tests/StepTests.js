var assert   = require('assert');
var Steps    = require('../lib/steps.js');
var Workflow = require("../lib/workflow.js");
var Time     = require("../lib/time.js");
var Postal   = require("postal");
var sinon    = require("sinon");

describe('Manual Step;', function () {
    it('Given I am initialised, then I should be of type Manual', function () {
        var step = new Steps.Manual({ name: "Test", target: 0, pump: "off" });
        assert.equal(step.name, "Test", "Name should be Test");
        assert.equal(step.type, "Manual", "Type should be Manual");
    });
    
    it('Given I am initialised, when I am started, then I should subscribe to Confirm Events', function () {
        var step = new Steps.Manual({ name: "Test", target: 0, pump: "off" });
        
        var spy = sinon.spy(step.messageBus, "subscribe");
        step.Start();

        assert.equal(spy.calledOnce, true);
        assert.equal(spy.args[0][0], "Confirmed");
    });
    
    it('Given I am started, when I am stopped, then I should unsubscribe from events', function () {
        var step = new Steps.Manual({ name: "Test", target: 0, pump: "off" });
        
        step.Start();
        var spy = sinon.spy(step.confirmSub, "unsubscribe");
        
        step.Stop();
                
        assert.equal(spy.calledOnce, true);
    });

    it('Given I am Started, when a Confirmation event is raised, then I should raise MoveToNextStep', function () {
        var step = new Steps.Manual({ name: "Test", target: 0, pump: "off" });
        step.Start();
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        messageBus.publish("Confirmed");
        
        assert.equal(spy.calledOnce, true);
        assert.equal(spy.args[0][0], "MoveToNextStep");
    });

    it('Given I am initialised and a temperature target is specified, when I am Started, then I should set the kettle targetTemperature', function () {
        var step = new Steps.Manual({ name: "Test", target: 50.1, pump: "off" });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        assert.equal(spy.args[0][0], "SetKettleTarget");
        assert.equal(spy.args[0][1].target, 50.1);
    });
    
    it('Given I am initialised and a pump state is specified, when I am Started, then I should set the wort pump', function () {
        var step = new Steps.Manual({ name: "Test", target: 50.1, pump: "on" });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        assert.equal(spy.args[1][0], "SetWortPumpState");
        assert.equal(spy.args[1][1].state, "on");
    });
    
    it('Given I am initialised and a temperature target is not specified, when I am Started, then I should default the kettle targetTemperature to zero', function () {
        var step = new Steps.Manual({ name: "Test" });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        assert.equal(spy.args[0][0], "SetKettleTarget");
        assert.equal(spy.args[0][1].target, 0);
    });

    it('Given I am initialised and a pump state is not specified, when I am Started, then I should default the wort pump to off', function () {
        var step = new Steps.Manual({ name: "Test" });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        assert.equal(spy.args[1][0], "SetWortPumpState");
        assert.equal(spy.args[1][1].state, "off");
    });
})

describe('Temp Ramp Step;', function () {
    it('Given I am initialised, then I should be of type Ramp', function () {
        var step = new Steps.TempRamp({ name: "Test", target: 30.5 });
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Ramp");
    });

    it('Given I am initialised and pumpState is not specified, then I should default to pump state ON', function () {
        var step = new Steps.TempRamp({ name: "Test", target: 30.5 });

        assert.equal(step.pumpState, "on");
    });

    it('Given I am initialised and target temp is specified, then I should have the specified target temp', function () {
        var step = new Steps.TempRamp({ name: "Test", target: 64.5 });
        
        assert.equal(step.target, 64.5);
    });
    
    it('Given I am initialised, when I am Started, then I should set the kettle targetTemperature', function () {
        var step = new Steps.TempRamp({ name: "Test", target: 50.1 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
       
        assert.equal(spy.args[0][0], "SetKettleTarget");
        assert.equal(spy.args[0][1].target, 50.1);
    });
    
    it('Given I am initialised, when I am Started, then I should set the wort pump to ON', function () {
        var step = new Steps.TempRamp({ name: "Test", target: 50.1 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        assert.equal(spy.args[1][0], "SetWortPumpState");
        assert.equal(spy.args[1][1].state, "on");
    });

    it('Given I am Started, when a Tick event is raised and wort temperature meets or exceeds my target temp, I should raise MoveToNextStep event ', function () {
        var step = new Steps.TempRamp({ name: "Test", target: 50.1 });
        step.Start();
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        messageBus.publish("Tick", { KettleTemperature: 50 });
        messageBus.publish("Tick", { KettleTemperature: 50.1 });
        messageBus.publish("Tick", { KettleTemperature: 50.2 });
        
        assert.equal(spy.calledTwice, true);
        assert.equal(spy.args[0][0], "MoveToNextStep");
    });

})

describe('Temp Hold Step;', function () {
    it('Given I am initialised, then I should be of type Hold', function () {
        var step = new Steps.TempHold({ name: "Test", target: 30.1 });
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Hold");
    });

    it('Given I am initialised and pumpState is not specified, then I should default to pump state on', function () {
        var step = new Steps.TempHold({ name: "Test", target: 30.1 });
        
        assert.equal(step.pumpState, "on");
    });
    
    it('Given I am initialised and duration is specified, then I should have the specified duration', function () {
        var step = new Steps.TempHold({ name: "Test", target: 30.1, pump: "on", duration: 10 });
        
        assert.equal(step.duration, 10);
    });
    
    it('Given I am initialised, when I am Started, then I should set the kettle targetTemperature', function () {
        var step = new Steps.TempHold({ name: "Test", target: 30.1, pump: "off", duration: 10 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        assert.equal(spy.args[0][0], "SetKettleTarget");
        assert.equal(spy.args[0][1].target, 30.1);
    });
    
    it('Given I am initialised and a pump state is specified, when I am Started, then I should set the pump state', function () {
        var step = new Steps.TempHold({ name: "Test", target: 30.1, pump: "off", duration: 10 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        assert.equal(spy.args[1][0], "SetWortPumpState");
        assert.equal(spy.args[1][1].state, "off");
    });
    
    it('Given I am initialised and a pump state is not specified, when I am Started, then I should set the pump state default state of ON', function () {
        var step = new Steps.TempHold({ name: "Test", target: 30.1, duration: 10 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        assert.equal(spy.args[1][0], "SetWortPumpState");
        assert.equal(spy.args[1][1].state, "on");
    });

    it('Given I am Started, when a Tick event is raised and current time meets or exceeds my wait time, I should raise MoveToNextStep event ', function () {
        var step = new Steps.TempHold({ name: "Test", target: 30.1, pump: "on", duration: 10 });
        
        var stub = sinon.stub(Time, "Seconds", function () { return 0 });
        
        step.Start();
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        messageBus.publish("Tick", { CurrentTime: 10 * 60 - 1 });  
        messageBus.publish("Tick", { CurrentTime: 10 * 60 });
        messageBus.publish("Tick", { CurrentTime: 10 * 60 + 1 });
        
        assert.equal(spy.callCount, 2, "publish('MoveToNext') should be called twice");
        assert.equal(spy.args[0][0], "MoveToNextStep");
    });
})

describe('Boil Step;', function () {
    it('Given I am initialised, then I should be of type Boil', function () {
        var step = new Steps.Boil({ name: "Test", duration: 60 });
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Boil");
    });
    
    it('Given I am initialised and duration is specified, then I should have the specified duration', function () {
        var step = new Steps.Boil({ name: "Test", duration: 60 });
        
        assert.equal(step.duration, 60);
    });
    
    it('Given I am initialised, when I am Started, then I should set the kettle targetTemperature to 80% power', function () {
        var step = new Steps.Boil({ name: "Test", duration: 60 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        assert.equal(spy.args[0][0], "SetKettleTarget");
        assert.equal(spy.args[0][1].target, 0.8);
        assert.equal(spy.args[0][1].type, "power");
    });
    
    it('Given I am initialised, when I am Started, then I should set the pump state to off', function () {
        var step = new Steps.Boil({ name: "Test", duration: 60 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        assert.equal(spy.args[1][0], "SetWortPumpState");
        assert.equal(spy.args[1][1].state, "off");
    });

    it('Given I am Started, when a Tick event is raised and current time meets or exceeds my wait time, I should raise MoveToNextStep event ', function () {
        var step = new Steps.Boil({ name: "Test", duration: 10 });
        
        var stub = sinon.stub(Time, "Seconds", function () { return 0 });
        
        step.Start();
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        messageBus.publish("Tick", { CurrentTime: 10 * 60 - 1 });
        messageBus.publish("Tick", { CurrentTime: 10 * 60 });
        messageBus.publish("Tick", { CurrentTime: 10 * 60 + 1 });
        
        assert.equal(spy.calledTwice, true);
        assert.equal(spy.args[0][0], "MoveToNextStep");
    });
})

describe('Chill Step;', function () {
    it('Given I am initialised, then I should be of type Chill', function () {
        var step = new Steps.Chill({ name: "Test", target: 20, duration: 10 });
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Chill");
    });
    
    it('Given I am initialised and temperature and duration is specified, then I should have the specified temperature and duration', function () {
        var step = new Steps.Chill({ name: "Test", target: 20.5, duration: 30.1 });
        
        assert.equal(step.target, 20.5);
        assert.equal(step.duration, 30.1);
    });
    
    it('Given I am initialised and a temperature is specified, when I am Started, then I should set the kettle targetTemperature', function () {
        var step = new Steps.Chill({ name: "Test", target: 20.5, duration: 30.1 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        assert.equal(spy.args[0][0], "SetKettleTarget");
        assert.equal(spy.args[0][1].target, 20.5);
    });
    
    it('Given I am initialised, when I am Started, then I should set the pump state to on', function () {
        var step = new Steps.Chill({ name: "Test", target: 20, duration: 10 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        assert.equal(spy.args[1][0], "SetWortPumpState");
        assert.equal(spy.args[1][1].state, "on");
    });

    it('Given I am Started, when a Tick event is raised and current time meets or exceeds my wait time, I should raise MoveToNextStep event ', function () {
        var step = new Steps.Chill({ name: "Test", target: 20, duration: 10 });
        
        var stub = sinon.stub(Time, "Seconds", function () { return 0 });
        
        step.Start();
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        messageBus.publish("Tick", { CurrentTime: 10 * 60 - 1 });
        messageBus.publish("Tick", { CurrentTime: 10 * 60 });
        messageBus.publish("Tick", { CurrentTime: 10 * 60 + 1 });
        
        assert.equal(spy.callCount, 2);
        assert.equal(spy.args[0][0], "MoveToNextStep");
    });

    it('Given I am Started, when a Tick event is raised and current temperature meets is lower than target temperature, I should raise MoveToNextStep event ', function () {
        var step = new Steps.Chill({ name: "Test", target: 20.1, duration: 10 });
        
        var stub = sinon.stub(Time, "Seconds", function () { return 0 });
        
        step.Start();
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        messageBus.publish("Tick", { CurrentTime: 0, KettleTemperature: 20.3 });
        messageBus.publish("Tick", { CurrentTime: 0, KettleTemperature: 20.2 });
        messageBus.publish("Tick", { CurrentTime: 0, KettleTemperature: 20.1 });
        messageBus.publish("Tick", { CurrentTime: 0, KettleTemperature: 20 });
        
        assert.equal(spy.callCount, 2);
        assert.equal(spy.args[0][0], "MoveToNextStep");
    });
})

describe('Settle Step;', function () {
    it('Given I am initialised, then I should be of type Hold', function () {
        var step = new Steps.Settle({ name: "Test", duration: 30.1 });
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Hold");
    });
    
    it('Given I am initialised and duration is specified, then I should have the specified duration', function () {
        var step = new Steps.Settle({ name: "Test", duration: 30.1 });
        
        assert.equal(step.duration, 30.1);
    });
    
    it('Given I am initialised, when I am Started, then I should set the kettle targetTemperature to zero', function () {
        var step = new Steps.Settle({ name: "Test", duration: 30.1 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        assert.equal(spy.args[0][0], "SetKettleTarget");
        assert.equal(spy.args[0][1].target, 0);
    });
    
    it('Given I am initialised, when I am Started, then I should set the pump state to off', function () {
        var step = new Steps.Settle({ name: "Test", duration: 30.1 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        assert.equal(spy.args[1][0], "SetWortPumpState");
        assert.equal(spy.args[1][1].state, "off");
    });
    
    it('Given I am Started, when a Tick event is raised and current time meets or exceeds my wait time, I should raise MoveToNextStep event ', function () {
        var step = new Steps.Settle({ name: "Test", duration: 10 });
        
        var stub = sinon.stub(Time, "Seconds", function () { return 0 });
        
        step.Start();
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        messageBus.publish("Tick", { CurrentTime: 10 * 60 - 1 });
        messageBus.publish("Tick", { CurrentTime: 10 * 60 });
        messageBus.publish("Tick", { CurrentTime: 10 * 60 + 1 });
        
        assert.equal(spy.callCount, 2);
        assert.equal(spy.args[0][0], "MoveToNextStep");
    });
});

describe('Shutdown Step;', function () {
    it('Given I am initialised, then I should be of type Shutdown', function () {
        var step = new Steps.Shutdown({ name: "Test" });
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Shutdown");
    });
    
    it('Given I am initialised, when I am started, I should shutdown the machine', function () {
        var step = new Steps.Shutdown({ name: "Test" });
        
        var stub = sinon.stub(step, "Start", function () { });
        
        step.Start();
        assert.equal(stub.callCount, 1);
    });
});