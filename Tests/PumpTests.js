var Pump = require("../lib/pump.js");
var assert = require('assert'),
    sinon = require('sinon'), 
    should = require('chai').should(),
    expect = require('chai').expect;

var gpio = require("gpio");

describe('Pump', function () {

    it('.On() Should set Pin to HIGH', function () {
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

    it('.Off() Should set Pin to LOW', function () {
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
    })
})
