﻿var assert   = require('assert'),
    Workflow = require('../lib/workflow.js'),
    Time     = require("../lib/time.js"),
    Postal   = require("postal");
    sinon    = require('sinon');


describe('Workflow Steps;', function () {
    
    it('Given an uninitialised workflow, whem I initialise, then I should be at Start', function () {
        var w = new Workflow.Workflow();
        assert.equal(w.getCurrentStep().name, "Start");
        assert.equal(w.getCurrentStep().type, "Manual");
    });
    
    it('Given I am at the start, when I move next, then I should be on Add Mash Water step', function () {
        var w = new Workflow.Workflow();
        w.moveNext();
        
        assert.equal(w.getCurrentStep().name, "Add Mash Water");
    });
    
    it('Given I am at the start, when I movePrevious then I should remain at Start', function () {
        var w = new Workflow.Workflow();
        
        w.movePrevious();
        assert.equal(w.getCurrentStep().name, "Start");
    });
    
    it('Given I at any step, when I go to step, then I should move to that step', function () {
        var w = new Workflow.Workflow();
        w.goToStep("Finish");
        
        assert.equal(w.getCurrentStep().name, "Finish");
    });
    
    it('Given I am at the last step, when I move next, then I should remain on the last step', function () {
        var w = new Workflow.Workflow();
        w.goToStep("Finish");
        w.moveNext();
        
        assert.equal(w.getCurrentStep().name, "Finish");
    });
    
    it('Given I am at any step, when a MoveToNextStep event is raised, I should move to the next step', function () {
        var w = new Workflow.Workflow();
        w.goToStep("Start");
        
        var channel = Postal.channel();
        channel.publish("MoveToNextStep");

        assert.equal(w.getCurrentStep().name, "Add Mash Water");
    });
    
    it('Given I am at any step, when a MoveToPreviousStep event is raised, I should move to the previous step', function () {
        var w = new Workflow.Workflow();
        w.goToStep("Add Mash Water");
        
        var spy = sinon.spy(w, "movePrevious");

        var channel = Postal.channel();
        channel.publish("MoveToPreviousStep");
        
        assert.equal(w.getCurrentStep().name, "Start");
        assert.equal(spy.calledOnce, true);
    });
    
    it('Given I am at any step, when a MoveToNamedStep event is raised, I should move to the previous step', function () {
        var w = new Workflow.Workflow();
        w.goToStep("Add Mash Water");
        
        var spy = sinon.spy(w, "goToStep");
        
        var channel = Postal.channel();
        channel.publish("MoveToNamedStep", { name: "Start" });
        
        assert.equal(spy.calledOnce, true);
        assert.equal(w.getCurrentStep().name, "Start");
    });

    it('Given I am at any step, when a SetWortPumpState event is raised with state on, I should set the Wort pump state to on', function () {
        var w = new Workflow.Workflow();
        w.goToStep("Start");
        
        var spy = sinon.spy(w.kettlePump, "on");

        var channel = Postal.channel();
        channel.publish("SetWortPumpState", { state: "on" });
        
        assert.equal(spy.calledOnce, true, "pump.on() should be called");
    });

    it('Given I am at any step, when a SetWortPumpState event is raised with state off, I should set the Wort pump state to off', function () {
        var w = new Workflow.Workflow();
        w.goToStep("Start");
        
        var spy = sinon.spy(w.kettlePump, "off");
        
        var channel = Postal.channel();
        channel.publish("SetWortPumpState", { state: "off" });
        
        assert.equal(spy.calledOnce, true, "pump.off() should be called");
    });

    it('Given I am at any step, when a SetKettleTarget event is raised with state on, I should set the Kettle element target temperature', function () {
        var w = new Workflow.Workflow();
        w.goToStep("Start");
        
        var spy = sinon.spy(w.kettleElement, "setTarget");
        
        var channel = Postal.channel();
        channel.publish("SetKettleTarget", { targetTemp: 55 });
        
        assert.equal(spy.calledOnce, true, "pump.on() should be called");
        assert.equal(spy.args[0][0], 55);
    });
});