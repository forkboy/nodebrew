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
        expect(e.getState()).to.equal(1);
        expect(PIBlaster.setPwm.getCall(0).args[1]).to.equal(1);
    });
    
    it('When I turn the element Off, I should set Power to 0%', function () {
        
        sinon.stub(PIBlaster, "setPwm", function () { return true; });
        
        var e = new Element(17, "test");
        e.off();
        
        sinon.assert.calledOnce(PIBlaster.setPwm);
        expect(e.getState()).to.equal(0);
        expect(PIBlaster.setPwm.getCall(0).args[1]).to.equal(0);
    });
    
    it('When I set the element to a specific Power, I should set Power to the rating', function () {
        
        sinon.stub(PIBlaster, "setPwm", function () { return true; });
        
        var e = new Element(17, "test");
        e.setTarget({ type: "power", target: 0.8 });
        
        sinon.assert.calledOnce(PIBlaster.setPwm);
        expect(e.getTarget().type)                 .to.equal("power");
        expect(e.getTarget().target)               .to.equal(0.8);
        expect(e.getState())                       .to.equal(0.8);
        expect(PIBlaster.setPwm.getCall(0).args[1]).to.equal(0.8);
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
        expect(e.getTarget().type).to.equal("power");
        expect(e.getTarget().target).to.equal(0.8);
    });

    it('When I set a target temperature, I should set the pid target', function () {
        
        var e = new Element(17, "test");
        e.pid;
        sinon.stub(e.pid, "setPoint", function () { return true; });
        
        e.setTarget({ type: "temp", target: 50.5 });
        
        sinon.assert.calledOnce(e.pid.setPoint);
        expect(e.pid.setPoint.getCall(0).args[0]).to.equal(50.5);
    });

    it('When I set a target temperature to zero, I should set the bypass the pid and set the pin output to zero', function () {
        
        sinon.stub(PIBlaster, "setPwm", function () { return true; });
        
        var e = new Element(17, "test");
        
        e.setTarget({ type: "temp", target: 0 });
        
        expect(PIBlaster.setPwm.getCall(0).args[1]).to.equal(0);
    });
    
    it('Given I have a target temperature, When I set a target temperature to zero, I should disable the pid timer', function () {
        
        sinon.stub(PIBlaster, "setPwm", function () { return true; });
        
        var e = new Element(17, "test");
        e.setTarget({ type: "temp", target: 50 });
        
        assert.notEqual(e.timer, null);
        
        e.setTarget({ type: "temp", target: 0 });
        
        expect(e.timer).to.equal(null);
    });

    it('Given I have a target temperature, When I set a target power, I should disable the pid timer', function () {
        
        var e = new Element(17, "test");
        e.setTarget({ type: "temp", target: 50 });
        
        assert.notEqual(e.timer, null);

        e.setTarget({ type: "power", target: 0 });
        
        expect(e.timer).to.equal(null);
    });
});
