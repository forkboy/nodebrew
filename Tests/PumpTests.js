var Pump   = require("../lib/pump.js");
var assert = require('assert'),
    sinon  = require('sinon'), 
    expect = require('chai').expect;

var gpio = require("gpio");

describe('Pump;', function () {

    it('Given a pump in any state, when I turn the pump On, I should set Pin to HIGH', function () {
        var setFn = {
            set: function (val) { }
        };
        
        var stub1 = sinon.stub(setFn, "set", function () { return true; });
        
        var stub2 = sinon.stub(gpio, 'export', function () {
            return setFn;
        });

        var p = new Pump(1, "test");
        p.on();
        
        expect(stub1.calledOnce).to.equal(true);
        expect(stub2.calledOnce).to.equal(true);
        expect(setFn.set.getCall(0).args[0]).to.equal(1);
    })

    it('Given a pump in any state, when I turn the pump Off, I Should set Pin to LOW', function () {
        var setFn = {
            set: function (val) { }
        };
        
        var stub1 = sinon.stub(setFn, "set", function () { return true; });
        
        var stub2 = sinon.stub(gpio, 'export', function () {
            return setFn;
        });
        
        var p = new Pump(1, "test");
        p.off();
        
        expect(stub1.calledOnce).to.equal(true);
        expect(stub2.calledOnce).to.equal(true);
        expect(setFn.set.getCall(0).args[0]).to.equal(0);
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
        
        expect(p.getState()).to.equal(1);
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
        
        expect(p.getState()).to.equal(0);
    })
})
