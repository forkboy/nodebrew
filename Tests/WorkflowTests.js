var assert   = require('assert'),
    Events   = require('../lib/events.js'),
    Workflow = require('../lib/workflow.js'),
    Time = require("../lib/time.js"),
    sinon = require('sinon');


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
    
    it('Given I am at a manual step, when I raise a confirmation event, I should move to the next step', function () {
        var w = new Workflow.Workflow();
        w.goToStep("Start");
        
        w.event(new Events.InputEvent());
        assert.equal(w.getCurrentStep().name, "Add Mash Water");
    });
    
    it('Given I am at a manual step, when a non-input event is raised, I should do nothing', function () {
        var w = new Workflow.Workflow();
        
        var e = new Events.TemperatureReachedEvent();
        w.event(e);
        assert.equal(w.getCurrentStep().name, "Start");
        
        var e = new Events.TimeExpiredEvent();
        w.event(e);
        assert.equal(w.getCurrentStep().name, "Start");
    });
    
    it('Given I am at a mash ramp step, when I reach setpoint, I should move to the next step', function () {
        var w = new Workflow.Workflow();
        w.goToStep("Ramp to Strike");
        
        var e = new Events.TemperatureReachedEvent(30);
        w.event(e);
        assert.equal(w.getCurrentStep().name, "Add Grains");
    });
    
    it('Given I am at a mash ramp step, when I receive a non temperature reached Event, I should do nothing', function () {
        var w = new Workflow.Workflow();
        w.goToStep("Ramp to Strike");
        
        var e = new Events.InputEvent();
        w.event(e);
        assert.equal(w.getCurrentStep().name, "Ramp to Strike");
        
        var e = new Events.TimeExpiredEvent();
        w.event(e);
        assert.equal(w.getCurrentStep().name, "Ramp to Strike");
    });
    
    it('Given I am at a mash wait step, when I receive a Time Expired, I should move to the next step', function () {
        var w = new Workflow.Workflow();
        w.goToStep("Protein Rest");
        
        var e = new Events.TimeExpiredEvent();
        w.event(e);
        assert.equal(w.getCurrentStep().name, "Ramp to Sacc 1");
    });
    
    it('Given I am at a mash wait step, when I receive a non time-expired event, I should do nothing', function () {
        var w = new Workflow.Workflow();
        w.goToStep("Protein Rest");
        
        var e = new Events.InputEvent();
        w.event(e);
        assert.equal(w.getCurrentStep().name, "Protein Rest");
        
        var e = new Events.TemperatureReachedEvent(30);
        w.event(e);
        assert.equal(w.getCurrentStep().name, "Protein Rest");
    });
    
    it('Given I am at a mash wait step, when I receive a non time-expired event, I should do nothing', function () {
        var w = new Workflow.Workflow();
        w.goToStep("Protein Rest");
        
        var e = new Events.InputEvent();
        w.event(e);
        assert.equal(w.getCurrentStep().name, "Protein Rest");
        
        var e = new Events.TemperatureReachedEvent(30);
        w.event(e);
        assert.equal(w.getCurrentStep().name, "Protein Rest");
    });
});


describe('Workflow Timer;', function () {
    
    it('Given I am at a any step, when I go to a step, the step start time should be recorded', function () {
        var w = new Workflow.Workflow();
        sinon.stub(w.time, "MachineSeconds", function () { return 100; });
        
        w.goToStep("Protein Rest"); 

        assert.equal(w.stepStartedAt, 100);
    });

    it('Given I am at a Waitable Step, when the time since start exceeds wait time, I should move to next step', function () {
        var w = new Workflow.Workflow();
        
        var stub = sinon.stub(w.time, "MachineSeconds", function () { return 0 });

        w.goToStep("Protein Rest"); 
        var stepDuration = w.getCurrentStep().duration * 60;
        
        stub.restore();
        stub = sinon.stub(w.time, "MachineSeconds", function () { return stepDuration - 1 });

        assert.equal(w.checkForTimeExpired(), false, "should be false when elapsed time is < duration");

        stub.restore();
        stub = sinon.stub(w.time, "MachineSeconds", function () { return stepDuration });
        
        console.log(w.time.MachineSeconds());

        assert.equal(w.checkForTimeExpired(), false, "should be false when elapsed time equals duration");

        stub.restore();
        stub = sinon.stub(w.time, "MachineSeconds", function () { return stepDuration + 1 });
        
        console.log(w.time.MachineSeconds());
        
        assert.equal(w.checkForTimeExpired(), true, "should be true when elapsed time > duration");
    });
});