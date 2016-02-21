var assert    = require('assert'),
    sinon     = require('sinon'), 
    should    = require('chai').should(),
    expect    = require('chai').expect,
    PIBlaster = require('pi-blaster.js'),
    Element   = require('../lib/element.js');
var PIBlaster = require('pi-blaster.js');
var PID       = require('liquid-pid');

describe('Element;', function () {
    
    it('Given element is in any state, when I turn the element On, I should set Power to 100%', function () {
        
        sinon.stub(PIBlaster, "setPwm", function () { return true; });

        var e = new Element(17, "test");
        e.on();
        
        sinon.assert.calledOnce(PIBlaster.setPwm);
        assert.equal(100, e.getState())
        assert.equal(100, PIBlaster.setPwm.getCall(0).args[1]);
    });
    
    it('Given element is in any state, when I turn the element Off, I should set Power to 0%', function () {
        
        sinon.stub(PIBlaster, "setPwm", function () { return true; });
        
        var e = new Element(17, "test");
        e.off();
        
        sinon.assert.calledOnce(PIBlaster.setPwm);
        assert.equal(0, e.getState())
        assert.equal(0, PIBlaster.setPwm.getCall(0).args[1]);
    });

    it('Given element is in any state, when I set a target temperature, I should set the pid target', function () {
        
        
        var e = new Element(17, "test");
        e.pid;
        sinon.stub(e.pid, "setPoint", function () { return true; });
        
        e.setTarget(50.5);
        
        sinon.assert.calledOnce(e.pid.setPoint);
        assert.equal(50.5, e.pid.setPoint.getCall(0).args[0]);
    });
});
