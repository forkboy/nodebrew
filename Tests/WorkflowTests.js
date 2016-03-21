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
        w.initialise();
        
        expect(w.getCurrentStep().name).to.equal("Start");
        expect(w.getCurrentStep().type).to.equal("Manual");
    });
    
    it('Given an uninitialised workflow, whem I initialise, then I should load the last schedule', function () {
        var w = new Workflow.Workflow();
        
        var spy = sinon.spy(w.mashSchedule, "load");
        
        w.initialise();
        
        expect(spy.calledOnce).to.equal(true);
    });
    
    it('Given an uninitialised workflow, whem I initialise, then I should apply the last loaded schedule', function () {
        var w = new Workflow.Workflow();
        
        var spy = sinon.spy(w, "applyMashSchedule");
        
        w.initialise();
        
        expect(spy.calledOnce).to.equal(true);
    });

    it('Given I am at the start, when I move next, then I should be on Add Mash Water step', function () {
        var w = new Workflow.Workflow();
        w.initialise();
        
        w.moveNext();
        
        expect(w.getCurrentStep().name).to.equal("Add Mash Water");
    });
    
    it('Given I am at any step, when I move next and the next step is disabled, then I should be at the next enabled step', function () {
        var w = new Workflow.Workflow();
        w.initialise();
        
        w.getStepNamed("Add Mash Water").enabled = false;
        
        w.moveNext();
        
        expect(w.getCurrentStep().name).to.equal("Ramp to Strike");
    });
    
    it('Given I am at any step, when I move next and all remaining steps are disabled, then I should not move', function () {
        var w = new Workflow.Workflow();
        w.initialise();
        
        w.steps.forEach(function (item) {
            if (item.name !== "Start")
                item.enabled = false;
        });
        
        w.moveNext();
        
        expect(w.getCurrentStep().name).to.equal("Start");
    });

    it('Given I am at the start, when I movePrevious then I should remain at Start', function () {
        var w = new Workflow.Workflow();
        w.initialise();

        w.movePrevious();
        
        expect(w.getCurrentStep().name).to.equal("Start");
    });
    
    it('Given I am at any step that is not start, when I movePrevious then I should move to the previous step', function () {
        var w = new Workflow.Workflow();
        w.initialise();

        w.goToStep("Add Mash Water");
        
        w.movePrevious();
        
        expect(w.getCurrentStep().name).to.equal("Start");
    });
    
    it('Given I am at any step that is not start, when I movePrevious and the previous step is disabled, then I should move previous step that is enabled', function () {
        var w = new Workflow.Workflow();
        w.initialise();
        
        w.goToStep("Ramp to Strike");
        w.getStepNamed("Add Mash Water").enabled = false;
        
        w.movePrevious();
        
        expect(w.getCurrentStep().name).to.equal("Start");
    });
    
    it('Given I am at any step that is not start, when I movePrevious and all previous steps are disabled, then I stay where I am', function () {
        var w = new Workflow.Workflow();
        w.initialise();
        
        w.getStepNamed("Add Mash Water").enabled = false;
        w.getStepNamed("Start").enabled = false;
        w.goToStep("Ramp to Strike");
                
        w.movePrevious();
        
        expect(w.getCurrentStep().name).to.equal("Ramp to Strike");
    });

    it('Given I at any step, when I go to step, then I should move to that step', function () {
        var w = new Workflow.Workflow();
        w.initialise();
        
        w.goToStep("Finish");
        
        expect(w.getCurrentStep().name).to.equal("Finish");
    });
    
    it('Given I at any step, when I go to step, then I should move to the next enabled step', function () {
        var w = new Workflow.Workflow();
        w.initialise();
        
        w.getStepNamed("Add Mash Water").enabled = false;
        w.getStepNamed("Start").enabled = false;
        w.goToStep("Start");
        
        expect(w.getCurrentStep().name).to.equal("Ramp to Strike");
    });

    it('Given I am at the last step, when I move next, then I should remain on the last step', function () {
        var w = new Workflow.Workflow();
        w.initialise();
        
        // good idea to stub out the system shutdown step
        var step = w.getStepNamed("Shutdown");
        var stub = sinon.stub(step, "Start", function () { });
        
        w.goToStep("Shutdown");
        w.moveNext();
            
        expect(w.getCurrentStep().name).to.equal("Shutdown");
    });
    
    it('Given I am at any step, when a MoveToNextStep event is raised, I should move to the next step', function () {
        var w = new Workflow.Workflow();
        w.initialise();
        
        var spy = sinon.spy(w, "moveNext");

        var channel = Postal.channel();
        channel.publish("MoveToNextStep");
            
        expect(spy.calledOnce).to.equal(true);
    });

    it('Given I am at any step, when a MoveToPreviousStep event is raised, I should move to the previous step', function () {
        var w = new Workflow.Workflow();
        w.initialise();
                
        var spy = sinon.spy(w, "movePrevious");
            
        var channel = Postal.channel();
        channel.publish("MoveToPreviousStep");
            
        expect(spy.calledOnce).to.equal(true);
    });
    
    it('Given I am at any step, when a MoveToNamedStep event is raised, I should move to the previous step', function () {
        var w = new Workflow.Workflow();
        w.initialise();
                
        var spy = sinon.spy(w, "goToStep");
            
        var channel = Postal.channel();
        channel.publish("MoveToNamedStep", { name: "Start" });
            
        expect(spy.calledOnce).to.equal(true);
    });

    it('Given I am at any step, when a SetWortPumpState event is raised with state on, I should set the Wort pump state to on', function () {
        var w = new Workflow.Workflow();
        w.initialise();
                
        var spy = sinon.spy(w.kettlePump, "on");
            
        var channel = Postal.channel();
        channel.publish("SetWortPumpState", { state: "on" });
        
        expect(spy.calledOnce, "pump.on() should be called").to.equal(true);
    });

    it('Given I am at any step, when a SetWortPumpState event is raised with state off, I should set the Wort pump state to off', function () {
        var w = new Workflow.Workflow();
        w.initialise();
                
        var spy = sinon.spy(w.kettlePump, "off");
            
        var channel = Postal.channel();
        channel.publish("SetWortPumpState", { state: "off" });
            
        expect(spy.calledOnce, "pump.off() should be called").to.equal(true);
    });

    it('Given I am at any step, when a SetKettleTarget event is raised with a target set, I should set the Kettle element target temperature', function () {
        var w = new Workflow.Workflow();
        w.initialise();
                
        var spy = sinon.spy(w.kettleElement, "setTarget");
            
        var channel = Postal.channel();
        channel.publish("SetKettleTarget", { target: 55 });
            
        expect(spy.calledOnce, "kettleElement.setTarget() should be called").to.equal(true);
        expect(spy.args[0][0].target).to.equal(55);
    });
    
    it('Given I am at any step, when a SetKettleTarget event is raised with a target type of power specified, I should set the Kettle element to the power output', function () {
        var w = new Workflow.Workflow();
        w.initialise();
        
        var spy = sinon.spy(w.kettleElement, "setPower");
        
        var channel = Postal.channel();
        channel.publish("SetKettleTarget", { target: .8, type: 'power' });
        
        expect(spy.calledOnce, "kettleElement.setPower() should be called").to.equal(true);
        expect(spy.args[0][0]).to.equal(0.8);
    });

    it('Given I am at any step, when a GetConfiguration event is raised, I should publish a Configuration message', function () {
        var w = new Workflow.Workflow();
        w.initialise();        
        
        var channel = Postal.channel();
            
        var spy = sinon.spy(channel, "publish");
            
        channel.publish("GetConfiguration", {});
            
        expect(spy.calledOnce).to.equal(true);
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
        w.initialise();

        w.applyMashSchedule(minimalSchedule());

        expect(w.getStepNamed("Ramp to Sacc 3").target).to.equal(99);
    });

    it('Given I have a default mash schedule, when I apply a mash schedule, the target temperature should be set for the Rest step of the same name', function () {
        var w = new Workflow.Workflow();
        w.initialise();

        w.applyMashSchedule(minimalSchedule());
        
        expect(w.getStepNamed("Sacc 3 Rest").target).to.equal(99);
    });
    
    it('Given I have a default mash schedule, when I apply a mash schedule, the duration should be set for the Rest step of the same name', function () {
        var w = new Workflow.Workflow();
        w.initialise();

        w.applyMashSchedule(minimalSchedule());
        
        expect(w.getStepNamed("Sacc 3 Rest").duration).to.equal(88);
    });

    it('Given I have a default mash schedule, when I apply a mash schedule, the target temperature should be set for the Rest step of the same name', function () {
        var w = new Workflow.Workflow();
        w.initialise();

        w.applyMashSchedule(minimalSchedule());
        
        expect(w.getStepNamed("Sacc 3 Rest").target).to.equal(99);
    });

    it('Given I have a default mash schedule, when I apply a mash schedule with a disabled step, the Ramp and Rest step of the same name should be disabled', function () {
        var w = new Workflow.Workflow();
        w.initialise();

        var s = minimalSchedule();
        s.step("Sacc 3").enabled = false;

        w.applyMashSchedule(s);
        
        expect(w.getStepNamed("Ramp to Sacc 3").enabled).to.equal(false);
        expect(w.getStepNamed("Sacc 3 Rest").enabled).to.equal(false);
    });

    it('Given I have a default mash schedule, when I apply a mash schedule with an enabled step, the Ramp and Rest step of the same name should be enabled', function () {
        var w = new Workflow.Workflow();
        w.initialise();
        
        var s = minimalSchedule();
        s.step("Sacc 3").enabled = true;
        
        w.applyMashSchedule(s);
        
        expect(w.getStepNamed("Ramp to Sacc 3").enabled).to.equal(true);
        expect(w.getStepNamed("Sacc 3 Rest").enabled).to.equal(true);
    });
});