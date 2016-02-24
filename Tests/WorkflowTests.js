var assert   = require('assert'),
    Workflow = require('../lib/workflow.js'),
    Time     = require("../lib/time.js"),
    Schedule = require("../lib/schedule.js"),
    Postal   = require("postal"),
    sinon    = require('sinon')
    expect   = require('chai').expect;

describe('Workflow Steps;', function () {
    
    it('Given an uninitialised workflow, whem I initialise, then I should be at Start', function () {
        var w = new Workflow.Workflow();
        
        w.initialise(function () {
            assert.equal(w.getCurrentStep().name, "Start");
            assert.equal(w.getCurrentStep().type, "Manual");
        });
    });
    
    it('Given I am at the start, when I move next, then I should be on Add Mash Water step', function () {
        var w = new Workflow.Workflow();
        w.initialise(function () {
            w.moveNext();
            
            assert.equal(w.getCurrentStep().name, "Add Mash Water");
        });
    });
    
    it('Given I am at the start, when I movePrevious then I should remain at Start', function () {
        var w = new Workflow.Workflow();
        
        w.initialise(function () {
            w.movePrevious();
            assert.equal(w.getCurrentStep().name, "Start");
        });
    });
    
    it('Given I at any step, when I go to step, then I should move to that step', function () {
        var w = new Workflow.Workflow();
        
        w.initialise(function () {
            w.goToStep("Finish");
            
            assert.equal(w.getCurrentStep().name, "Finish");
        });
    });
    
    it('Given I am at the last step, when I move next, then I should remain on the last step', function () {
        var w = new Workflow.Workflow();
        w.initialise(function () {
            
            w.goToStep("Finish");
            w.moveNext();
            
            assert.equal(w.getCurrentStep().name, "Finish");
        });
    });
    
    it('Given I am at any step, when a MoveToNextStep event is raised, I should move to the next step', function () {
        var w = new Workflow.Workflow();
        w.initialise(function () {
            
            var channel = Postal.channel();
            channel.publish("MoveToNextStep");
            
            assert.equal(w.getCurrentStep().name, "Add Mash Water");
        });
    });
    
    it('Given I am at any step, when a MoveToPreviousStep event is raised, I should move to the previous step', function () {
        var w = new Workflow.Workflow();
        
        w.initialise(function () {
            var spy = sinon.spy(w, "movePrevious");
            
            var channel = Postal.channel();
            channel.publish("MoveToPreviousStep");
            
            assert.equal(w.getCurrentStep().name, "Start");
            assert.equal(spy.calledOnce, true);
        });
    });
    
    it('Given I am at any step, when a MoveToNamedStep event is raised, I should move to the previous step', function () {
        var w = new Workflow.Workflow();
        
        w.initialise(function () {
            var spy = sinon.spy(w, "goToStep");
            
            var channel = Postal.channel();
            channel.publish("MoveToNamedStep", { name: "Start" });
            
            assert.equal(spy.calledOnce, true);
            assert.equal(w.getCurrentStep().name, "Start");
        });
    });

    it('Given I am at any step, when a SetWortPumpState event is raised with state on, I should set the Wort pump state to on', function () {
        var w = new Workflow.Workflow();
        
        w.initialise(function () {
            var spy = sinon.spy(w.kettlePump, "on");
            
            var channel = Postal.channel();
            channel.publish("SetWortPumpState", { state: "on" });
            
            assert.equal(spy.calledOnce, true, "pump.on() should be called");
        });
    });

    it('Given I am at any step, when a SetWortPumpState event is raised with state off, I should set the Wort pump state to off', function () {
        var w = new Workflow.Workflow();
        
        w.initialise(function () {
            var spy = sinon.spy(w.kettlePump, "off");
            
            var channel = Postal.channel();
            channel.publish("SetWortPumpState", { state: "off" });
            
            assert.equal(spy.calledOnce, true, "pump.off() should be called");
        });
    });

    it('Given I am at any step, when a SetKettleTarget event is raised with state on, I should set the Kettle element target temperature', function () {
        var w = new Workflow.Workflow();
        
        w.initialise(function () {
            var spy = sinon.spy(w.kettleElement, "setTarget");
            
            var channel = Postal.channel();
            channel.publish("SetKettleTarget", { target: 55 });
            
            assert.equal(spy.calledOnce, true, "pump.on() should be called");
            assert.equal(spy.args[0][0], 55);
        });
    });

    it('Given I am at any step, when a GetConfiguration event is raised, I should publish a Configuration message', function () {
        var w = new Workflow.Workflow();
        
        w.initialise(function () {
            
            var channel = Postal.channel();
            
            var spy = sinon.spy(channel, "publish");
            
            channel.publish("GetConfiguration", {});
            
            expect(spy.calledOnce).to.equal(true);
        });
    });
});

var minimalSchedule = function () {
    var s = new Schedule();
    s.configure([
        { name: "Sacc 3", target: 99, duration: 88 }
    ]);
    return s;
}

describe('Workflow Configuration;', function () {

    it('Given I have a default mash schedule, when I apply a mash schedule, the target temperature should be set for the Ramp step of the same name', function () {
        var w = new Workflow.Workflow();

        w.applyMashSchedule(minimalSchedule());

        expect(w.getStepNamed("Ramp to Sacc 3").target).to.equal(99);
    });

    it('Given I have a default mash schedule, when I apply a mash schedule, the target temperature should be set for the Rest step of the same name', function () {
        var w = new Workflow.Workflow();
        
        w.applyMashSchedule(minimalSchedule());
        
        expect(w.getStepNamed("Sacc 3 Rest").target).to.equal(99);
    });
    
    it('Given I have a default mash schedule, when I apply a mash schedule, the duration should be set for the Rest step of the same name', function () {
        var w = new Workflow.Workflow();
        
        w.applyMashSchedule(minimalSchedule());
        
        expect(w.getStepNamed("Sacc 3 Rest").duration).to.equal(88);
    });

    it('Given I have a default mash schedule, when I apply a mash schedule, the target temperature should be set for the Rest step of the same name', function () {
        var w = new Workflow.Workflow();
        
        w.applyMashSchedule(minimalSchedule());
        
        expect(w.getStepNamed("Sacc 3 Rest").target).to.equal(99);
    });

    it('Given I have a default mash schedule, when I apply a mash schedule with a disabled step, the Ramp and Rest step of the same name should be disabled', function () {
        var w = new Workflow.Workflow();
        
        var s = minimalSchedule();
        s.step("Sacc 3").enabled = false;

        w.applyMashSchedule(s);
        
        expect(w.getStepNamed("Ramp to Sacc 3").enabled).to.equal(false);
        expect(w.getStepNamed("Sacc 3 Rest").enabled).to.equal(false);
    });
});