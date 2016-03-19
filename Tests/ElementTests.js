var assert    = require('assert'),
    sinon     = require('sinon'), 
    expect    = require('chai').expect,
    PIBlaster = require('pi-blaster.js'),
    Element   = require('../lib/element.js');
var PIBlaster = require('pi-blaster.js');
var PID       = require('liquid-pid');

describe('Element;', function () {
    
    it('When I turn the element On, I should set Power to 100%', function () {
        
        sinon.stub(PIBlaster, "setPwm", function () { return true; });

        var e = new Element(17, "test");
        e.on();
        
        sinon.assert.calledOnce(PIBlaster.setPwm);
        assert.equal(1, e.getState())
        assert.equal(1, PIBlaster.setPwm.getCall(0).args[1]);
    });
    
    it('When I turn the element Off, I should set Power to 0%', function () {
        
        sinon.stub(PIBlaster, "setPwm", function () { return true; });
        
        var e = new Element(17, "test");
        e.off();
        
        sinon.assert.calledOnce(PIBlaster.setPwm);
        assert.equal(0, e.getState())
        assert.equal(0, PIBlaster.setPwm.getCall(0).args[1]);
    });
    
    it('When I set the element to a specific Power, I should set Power to the rating', function () {
        
        sinon.stub(PIBlaster, "setPwm", function () { return true; });
        
        var e = new Element(17, "test");
        e.setTarget({ type: "power", target: 0.8 });
        
        sinon.assert.calledOnce(PIBlaster.setPwm);
        assert.equal("power", e.getTarget().type)
        assert.equal(0.8, e.getTarget().target)
        assert.equal(0.8, e.getState())
        assert.equal(0.8, PIBlaster.setPwm.getCall(0).args[1]);
    });
    
    it('Given element is set with a target temperature, when I getTarget, I should return target of type temperature', function () {
        
        sinon.stub(PIBlaster, "setPwm", function () { return true; });
        
        var e = new Element(17, "test");
        e.setTarget({ type: "temp", target: 65 });
        
        var target = e.getTarget();
        expect(target.type).to.equal('temp');
        expect(target.target).to.equal(65);
    });
    
    it('Given element is set with a target power, when I getTarget, I should return target of type power', function () {
        
        sinon.stub(PIBlaster, "setPwm", function () { return true; });
        
        var e = new Element(17, "test");
        e.setPower(0.8);
        
        var target = e.getTarget();
        expect(target.type).to.equal('power');
        expect(target.target).to.equal(0.8);
    });

    it('When I set a target temperature, I should set the pid target', function () {
        
        var e = new Element(17, "test");
        e.pid;
        sinon.stub(e.pid, "setPoint", function () { return true; });
        
        e.setTarget({ type: "temp", target: 50.5 });
        
        sinon.assert.calledOnce(e.pid.setPoint);
        assert.equal(50.5, e.pid.setPoint.getCall(0).args[0]);
    });

    it('When I set a target temperature or zero, I should set the bypass the pid and set the pin output to zero', function () {
        
        sinon.stub(PIBlaster, "setPwm", function () { return true; });
        
        var e = new Element(17, "test");
        
        e.setTarget({ type: "temp", target: 0 });
        
        assert.equal(0, PIBlaster.setPwm.getCall(0).args[1]);
    });

    it('Given I have a target temperature, When I set a target power, I should disable the pid timer', function () {
        
        var e = new Element(17, "test");
        e.setTarget({ type: "temp", target: 50 });
        
        assert.notEqual(e.timer, null);

        e.setTarget({ type: "power", target: 0 });
        
        assert.equal(e.timer, null);
    });
});
