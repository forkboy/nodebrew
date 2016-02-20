﻿var assert   = require('assert');
var Steps    = require('../lib/steps.js');
var Events   = require("../lib/events.js");
var Workflow = require("../lib/workflow.js");
var Time     = require("../lib/time.js");
var Postal   = require("postal");
var sinon    = require("sinon");

describe('Manual Step;', function () {
    it('Given I am initialised, then I should be of type Manual', function () {
        var step = new Steps.Manual("Test");
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Manual");
    });
    
    it('Given I am initialised, when I am started, then I should subscribe to Confirm Events', function () {
        var step = new Steps.Manual("Test");
        
        var spy = sinon.spy(step.messageBus, "subscribe");
        step.Start();

        assert.equal(spy.calledOnce, true);
        assert.equal(spy.args[0][0], "Confirmed");
    });
    
    it('Given I am started, when I am stopped, then I should unsubscribe from events', function () {
        var step = new Steps.Manual("Test");
        
        step.Start();
        var spy = sinon.spy(step.subscription, "unsubscribe");
        
        step.Stop();
                
        assert.equal(spy.calledOnce, true);
    });

    it('Given I am Started, when a Confirmation event is raised, then I should raise MoveToNextStep', function () {
        var step = new Steps.Manual("Test");
        step.Start();
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        messageBus.publish("Confirmed");
        
        assert.equal(spy.calledOnce, true);
        assert.equal(spy.args[0][0], "MoveToNextStep");
    });
})

describe('Temp Ramp Step;', function () {
    it('Given I am initialised, then I should be of type Ramp', function () {
        var step = new Steps.TempRamp("Test");
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Ramp");
    });

    it('Given I am initialised and pumpState is not specified, then I should default to pump state true', function () {
        var step = new Steps.TempRamp("Test");

        assert.equal(step.pumpState, true);
    });

    it('Given I am initialised and target temp is specified, then I should have the specified target temp', function () {
        var step = new Steps.TempRamp("Test", 64.5);
        
        assert.equal(step.targetTemp, 64.5);
    });

    it('Given I am Started, when a Tick event is raised and wort temperature meets or exceeds my target temp, I should raise MoveToNextStep event ', function () {
        var step = new Steps.TempRamp("Test", 50.1);
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
        var step = new Steps.TempHold("Test");
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Hold");
    });

    it('Given I am initialised and pumpState is not specified, then I should default to pump state true', function () {
        var step = new Steps.TempHold("Test");
        
        assert.equal(step.pumpState, true);
    });
    
    it('Given I am initialised and duration is specified, then I should have the specified duration', function () {
        var step = new Steps.TempHold("Test", 30.1);
        
        assert.equal(step.duration, 30.1);
    });

    it('Given I am Started, when a Tick event is raised and current time meets or exceeds my wait time, I should raise MoveToNextStep event ', function () {
        var step = new Steps.TempHold("Test", 10);
        
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

describe('Boil Step;', function () {
    it('Given I am initialised, then I should be of type Boil', function () {
        var step = new Steps.Boil("Test");
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Boil");
    });
    
    it('Given I am initialised and duration is specified, then I should have the specified duration', function () {
        var step = new Steps.Boil("Test", 30.1);
        
        assert.equal(step.duration, 30.1);
    });

    it('Given I am Started, when a Tick event is raised and current time meets or exceeds my wait time, I should raise MoveToNextStep event ', function () {
        var step = new Steps.TempHold("Test", 10);
        
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
        var step = new Steps.Chill("Test");
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Chill");
    });
    
    it('Given I am initialised and temperature and duration is specified, then I should have the specified temperature and duration', function () {
        var step = new Steps.Chill("Test", 20.5, 30.1);
        
        assert.equal(step.targetTemp, 20.5);
        assert.equal(step.duration, 30.1);
    });

    it('Given I am Started, when a Tick event is raised and current time meets or exceeds my wait time, I should raise MoveToNextStep event ', function () {
        var step = new Steps.Chill("Test", 20, 10);
        
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
        var step = new Steps.Chill("Test", 20.1, 10);
        
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
    it('Given I am initialised, then I should be of type Settle', function () {
        var step = new Steps.Settle("Test");
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Settle");
    });
    
    it('Given I am initialised and duration is specified, then I should have the specified duration', function () {
        var step = new Steps.Settle("Test", 30.1);
        
        assert.equal(step.duration, 30.1);
    });

    it('Given I am Started, when a Tick event is raised and current time meets or exceeds my wait time, I should raise MoveToNextStep event ', function () {
        var step = new Steps.Settle("Test", 10);
        
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
})