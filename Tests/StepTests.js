var assert   = require('assert'),
    Steps    = require('../lib/steps.js'),
    Workflow = require("../lib/workflow.js"),
    Time     = require("../lib/time.js"),
    Postal   = require("postal"),
    sinon    = require("sinon"),
    expect   = require('chai').expect;

describe('Manual Step;', function () {
    it('Given I am initialised, then I should be of type Manual', function () {
        var step = new Steps.Manual({ name: "Test", target: 0, pump: "off" });

        expect(step.name, "Name should be Test").to.equal("Test");
        expect(step.type, "Type should be Manual").to.equal("Manual");
    });
    
    it('Given I am initialised, when I am started, then I should subscribe to Confirm Events', function () {
        var step = new Steps.Manual({ name: "Test", target: 0, pump: "off" });
        
        var spy = sinon.spy(step.messageBus, "subscribe");
        step.Start();
        
        expect(spy.calledOnce).to.equal(true);
        expect(spy.args[0][0]).to.equal("Confirmed");
    });
    
    it('Given I am started, when I am stopped, then I should unsubscribe from events', function () {
        var step = new Steps.Manual({ name: "Test", target: 0, pump: "off" });
        
        step.Start();
        var spy = sinon.spy(step.subscription, "unsubscribe");
        
        step.Stop();
                
        expect(spy.calledOnce).to.equal(true);
    });

    it('Given I am Started, when a Confirmation event is raised, then I should raise MoveToNextStep', function () {
        var step = new Steps.Manual({ name: "Test", target: 0, pump: "off" });
        step.Start();
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        messageBus.publish("Confirmed");
        
        expect(spy.calledOnce).to.equal(true);
        expect(spy.args[0][0]).to.equal("MoveToNextStep");
    });

    it('Given I am initialised and a temperature target is specified, when I am Started, then I should set the kettle targetTemperature', function () {
        var step = new Steps.Manual({ name: "Test", target: 50.1, pump: "off" });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        expect(spy.args[0][0]).to.equal("SetKettleTarget");
        expect(spy.args[0][1].target).to.equal(50.1);
    });
    
    it('Given I am initialised and a pump state is specified, when I am Started, then I should set the wort pump', function () {
        var step = new Steps.Manual({ name: "Test", target: 50.1, pump: "on" });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        expect(spy.args[1][0]).to.equal("SetWortPumpState");
        expect(spy.args[1][1].state).to.equal("on");
    });
    
    it('Given I am initialised and a temperature target is not specified, when I am Started, then I should default the kettle targetTemperature to zero', function () {
        var step = new Steps.Manual({ name: "Test" });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        expect(spy.args[0][0]).to.equal("SetKettleTarget");
        expect(spy.args[0][1].target).to.equal(0);
    });

    it('Given I am initialised and a pump state is not specified, when I am Started, then I should default the wort pump to off', function () {
        var step = new Steps.Manual({ name: "Test" });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        expect().to.equal();
        expect(spy.args[1][0]).to.equal("SetWortPumpState");
        expect(spy.args[1][1].state).to.equal("off");
    });
})

describe('Temp Ramp Step;', function () {
    it('Given I am initialised, then I should be of type Ramp', function () {
        var step = new Steps.TempRamp({ name: "Test", target: 30.5 });
        
        expect(step.name, "Name should be Test").to.equal("Test");
        expect(step.type, "Type should be Ramp").to.equal("Ramp");
    });

    it('Given I am initialised and pumpState is not specified, then I should default to pump state ON', function () {
        var step = new Steps.TempRamp({ name: "Test", target: 30.5 });
        
        expect(step.pumpState).to.equal("on");
    });

    it('Given I am initialised and target temp is specified, then I should have the specified target temp', function () {
        var step = new Steps.TempRamp({ name: "Test", target: 64.5 });
        
        expect(step.target).to.equal(64.5);
    });
    
    it('Given I am initialised, when I am Started, then I should set the kettle targetTemperature', function () {
        var step = new Steps.TempRamp({ name: "Test", target: 50.1 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        expect(spy.args[0][0]).to.equal("SetKettleTarget");
        expect(spy.args[0][1].target).to.equal(50.1);
    });
    
    it('Given I am initialised, when I am Started, then I should set the wort pump to ON', function () {
        var step = new Steps.TempRamp({ name: "Test", target: 50.1 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        expect(spy.args[1][0]).to.equal("SetWortPumpState");
        expect(spy.args[1][1].state).to.equal("on");
    });

    it('Given I am Started, when a Tick event is raised and wort temperature meets or exceeds my target temp, I should raise MoveToNextStep event ', function () {
        var step = new Steps.TempRamp({ name: "Test", target: 50.1 });
        step.Start();
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        messageBus.publish("Tick", { KettleTemperature: 50 });
        messageBus.publish("Tick", { KettleTemperature: 50.1 });
        messageBus.publish("Tick", { KettleTemperature: 50.2 });
        
        expect(spy.calledTwice).to.equal(true);
        expect(spy.args[0][0]).to.equal("MoveToNextStep");
    });

    it('Given I am started, when I am stopped, then I should unsubscribe from events', function () {
        var step = new Steps.TempRamp({ name: "Test", target: 50.1 });
        
        step.Start();
        var spy = sinon.spy(step.subscription, "unsubscribe");
        
        step.Stop();
        
        expect(spy.calledOnce).to.equal(true);
    });
})

describe('Temp Hold Step;', function () {
    it('Given I am initialised, then I should be of type Hold', function () {
        var step = new Steps.TempHold({ name: "Test", target: 30.1 });

        expect(step.name).to.equal("Test");
        expect(step.type).to.equal("Hold");
    });

    it('Given I am initialised and pumpState is not specified, then I should default to pump state on', function () {
        var step = new Steps.TempHold({ name: "Test", target: 30.1 });
        
        expect(step.pumpState).to.equal("on");
    });
    
    it('Given I am initialised and duration is specified, then I should have the specified duration', function () {
        var step = new Steps.TempHold({ name: "Test", target: 30.1, pump: "on", duration: 10 });
        
        expect(step.duration).to.equal(10);
    });
    
    it('Given I am initialised, when I am Started, then I should set the kettle targetTemperature', function () {
        var step = new Steps.TempHold({ name: "Test", target: 30.1, pump: "off", duration: 10 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        expect(spy.args[0][0]).to.equal("SetKettleTarget");
        expect(spy.args[0][1].target).to.equal(30.1);
    });
    
    it('Given I am initialised and a pump state is specified, when I am Started, then I should set the pump state', function () {
        var step = new Steps.TempHold({ name: "Test", target: 30.1, pump: "off", duration: 10 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        expect(spy.args[1][0]).to.equal("SetWortPumpState");
        expect(spy.args[1][1].state).to.equal("off");
    });
    
    it('Given I am initialised and a pump state is not specified, when I am Started, then I should set the pump state default state of ON', function () {
        var step = new Steps.TempHold({ name: "Test", target: 30.1, duration: 10 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        expect(spy.args[1][0]).to.equal("SetWortPumpState");
        expect(spy.args[1][1].state).to.equal("on");
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
        
        expect(spy.callCount, "publish('MoveToNext') should be called twice").to.equal(2);
        expect(spy.args[0][0]).to.equal("MoveToNextStep");
    });

    it('Given I am started, when I am stopped, then I should unsubscribe from events', function () {
        var step = new Steps.TempHold({ name: "Test", target: 30.1, pump: "on", duration: 10 });
        
        step.Start();
        var spy = sinon.spy(step.subscription, "unsubscribe");
        
        step.Stop();
        
        expect(spy.calledOnce).to.equal(true);
    });
})

describe('Boil Step;', function () {
    it('Given I am initialised, then I should be of type Boil', function () {
        var step = new Steps.Boil({ name: "Test", duration: 60 });

        expect(step.name).to.equal("Test");
        expect(step.type).to.equal("Boil");
    });
    
    it('Given I am initialised and duration is specified, then I should have the specified duration', function () {
        var step = new Steps.Boil({ name: "Test", duration: 60 });
        
        expect(step.duration).to.equal(60);
    });
    
    it('Given I am initialised, when I am Started, then I should set the kettle targetTemperature to 80% power', function () {
        var step = new Steps.Boil({ name: "Test", duration: 60 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        expect(spy.args[0][0]).to.equal("SetKettleTarget");
        expect(spy.args[0][1].target).to.equal(0.8);
        expect(spy.args[0][1].type).to.equal("power");
    });
    
    it('Given I am initialised, when I am Started, then I should set the pump state to off', function () {
        var step = new Steps.Boil({ name: "Test", duration: 60 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        expect(spy.args[1][0]).to.equal("SetWortPumpState");
        expect(spy.args[1][1].state).to.equal("off");
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
        
        expect(spy.calledTwice).to.equal(true);
        expect(spy.args[0][0]).to.equal("MoveToNextStep");
    });

    it('Given I am started, when I am stopped, then I should unsubscribe from events', function () {
        var step = new Steps.Boil({ name: "Test", duration: 10 });
        
        step.Start();
        var spy = sinon.spy(step.subscription, "unsubscribe");
        
        step.Stop();
        
        expect(spy.calledOnce).to.equal(true);
    });
})

describe('Chill Step;', function () {
    it('Given I am initialised, then I should be of type Chill', function () {
        var step = new Steps.Chill({ name: "Test", target: 20, duration: 10 });

        expect(step.name).to.equal("Test");
        expect(step.type).to.equal("Chill");
    });
    
    it('Given I am initialised and temperature and duration is specified, then I should have the specified temperature and duration', function () {
        var step = new Steps.Chill({ name: "Test", target: 20.5, duration: 30.1 });
        
        expect(step.target).to.equal(20.5);
        expect(step.duration).to.equal(30.1);
    });
    
    it('Given I am initialised and a temperature is specified, when I am Started, then I should set the kettle targetTemperature', function () {
        var step = new Steps.Chill({ name: "Test", target: 20.5, duration: 30.1 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        expect(spy.args[0][0]).to.equal("SetKettleTarget");
        expect(spy.args[0][1].target).to.equal(20.5);
    });
    
    it('Given I am initialised, when I am Started, then I should set the pump state to on', function () {
        var step = new Steps.Chill({ name: "Test", target: 20, duration: 10 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        expect(spy.args[1][0]).to.equal("SetWortPumpState");
        expect(spy.args[1][1].state).to.equal("on");
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
        
        expect(spy.callCount).to.equal(2);
        expect(spy.args[0][0]).to.equal("MoveToNextStep");
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
        
        expect(spy.callCount).to.equal(2);
        expect(spy.args[0][0]).to.equal("MoveToNextStep");
    });

    it('Given I am started, when I am stopped, then I should unsubscribe from events', function () {
        var step = new Steps.Chill({ name: "Test", target: 20.1, duration: 10 });
        
        step.Start();
        var spy = sinon.spy(step.subscription, "unsubscribe");
        
        step.Stop();
        
        expect(spy.calledOnce).to.equal(true);
    });
})

describe('Settle Step;', function () {
    it('Given I am initialised, then I should be of type Hold', function () {
        var step = new Steps.Settle({ name: "Test", duration: 30.1 });

        expect(step.name).to.equal("Test");
        expect(step.type).to.equal("Hold");
    });
    
    it('Given I am initialised and duration is specified, then I should have the specified duration', function () {
        var step = new Steps.Settle({ name: "Test", duration: 30.1 });
        
        expect(step.duration).to.equal(30.1);
    });
    
    it('Given I am initialised, when I am Started, then I should set the kettle targetTemperature to zero', function () {
        var step = new Steps.Settle({ name: "Test", duration: 30.1 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        expect(spy.args[0][0]).to.equal("SetKettleTarget");
        expect(spy.args[0][1].target).to.equal(0);
    });
    
    it('Given I am initialised, when I am Started, then I should set the pump state to off', function () {
        var step = new Steps.Settle({ name: "Test", duration: 30.1 });
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(step.messageBus, "publish");
        
        step.Start();
        
        expect(spy.args[1][0]).to.equal("SetWortPumpState");
        expect(spy.args[1][1].state).to.equal("off");
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
        
        expect(spy.callCount).to.equal(2);
        expect(spy.args[0][0]).to.equal("MoveToNextStep");
    });

    it('Given I am started, when I am stopped, then I should unsubscribe from events', function () {
        var step = new Steps.Settle({ name: "Test", duration: 10 });
        
        step.Start();
        var spy = sinon.spy(step.subscription, "unsubscribe");
        
        step.Stop();
        
        expect(spy.calledOnce).to.equal(true);
    });
});

describe('Shutdown Step;', function () {
    it('Given I am initialised, then I should be of type Shutdown', function () {
        var step = new Steps.Shutdown({ name: "Test" });

        expect(step.name).to.equal("Test");
        expect(step.type).to.equal("Shutdown");
    });
    
    it('Given I am initialised, when I am started, I should shutdown the machine', function () {
        var step = new Steps.Shutdown({ name: "Test" });
        
        var stub = sinon.stub(step, "Start", function () { });
        
        step.Start();
        expect(stub.callCount).to.equal(1);
    });
});