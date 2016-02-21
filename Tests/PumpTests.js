var Pump = require("../lib/pump.js");
var assert = require('assert'),
    sinon = require('sinon'), 
    should = require('chai').should(),
    expect = require('chai').expect;

var gpio = require("gpio");

describe('Pump', function () {

    it('Given a pump in any state, when I turn the pump On, I should set Pin to HIGH', function () {
        var setFn = {
            set: function (val) { }
        };
        
        sinon.stub(setFn, "set", function () { return true; });

        sinon.stub(gpio, 'export', function () {
            return setFn;
        });

        var p = new Pump(1, "test");
        p.on();
        
        sinon.assert.calledOnce(gpio.export);
        sinon.assert.calledOnce(setFn.set);
        assert.equal(1, setFn.set.getCall(0).args[0]);
    })

    it('Given a pump in any state, when I turn the pump Off, I Should set Pin to LOW', function () {
        var setFn = {
            set: function (val) { }
        };
        
        sinon.stub(setFn, "set", function () { return true; });
        
        sinon.stub(gpio, 'export', function () {
            return setFn;
        });
        
        var p = new Pump(1, "test");
        p.off();
        
        sinon.assert.calledOnce(gpio.export);
        sinon.assert.calledOnce(setFn.set);
        assert.equal(0, setFn.set.getCall(0).args[0]);
    });

    it('Given a pump is on, when I call getState, then I should retun 1,', function () {
        var setFn = {
            set: function (val) { }
        };
        
        sinon.stub(setFn, "set", function () { return true; });
        
        sinon.stub(gpio, 'export', function () {
            return setFn;
        });
        
        var p = new Pump(1, "test");
        p.on();
        
        assert.equal(p.getState(), 1);
    });

    it('Given a pump is off, when I call getState, then I should retun 0,', function () {
        var setFn = {
            set: function (val) { }
        };
        
        sinon.stub(setFn, "set", function () { return true; });
        
        sinon.stub(gpio, 'export', function () {
            return setFn;
        });
        
        var p = new Pump(1, "test");
        p.off();
        
        assert.equal(p.getState(), 0);
    })
})
