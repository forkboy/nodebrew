var assert   = require('assert'),
    Schedule = require('../lib/schedule.js'),
    expect   = require('chai').expect,
    sinon    = require('sinon'),
    fs       = require('fs');


var sampleSchedule = function () {
    var s = new Schedule();
    s.configure([
        { name: "Protien", target: 50, duration: 10 },
        { name: "Sacc 1",  target: 62, duration: 10 },
        { name: "Sacc 2",  target: 65, duration: 60 },
        { name: "Sacc 3",  target: 67, duration: 10 },
        { name: "Mashout", target: 78, duration: 10 }
    ]);
    return s;
}

var minimalSchedule = function () {
    var s = new Schedule();
    s.configure([
        { name: "Sacc 1",  target: 62, duration: 10, enabled: true },
        { name: "Sacc 2",  target: 62, duration: 10, enabled: false },
        { name: "Mashout", target: 78, duration: 10 }
    ]);
    return s;
}


describe('Schedule Maintenance;', function () {
    var self = this;

    it('Given a schedule step is initialised, when I set a target, then the target should be set', function () {
        var s = minimalSchedule()
        
        expect(s.step("Sacc 1").target).to.equal(62);
    });
    
    it('Given a schedule step is initialised, when I set a duration, then the duration should be set', function () {
        var s = minimalSchedule()
        
        expect(s.step("Sacc 1").duration).to.equal(10);
    });
    
    it('Given a schedule step is initialised, when I set enabled, then the enabled flag should be set', function () {
        var s = minimalSchedule()
        
        expect(s.step("Sacc 1").enabled).to.equal(true);
        expect(s.step("Sacc 2").enabled).to.equal(false);
    });
    
    it('Given a schedule step is initialised, when I set a step without a name, then an exception should be thrown', function () {
        var s = new Schedule();
        expect(s.configure.bind(s, [{ target: 50, duration: 10 }])).to.throw("Name must be supplied");
    });
    
    it('Given a schedule step is initialised, when I set a step without a target, then an exception should be thrown', function () {
        var s = new Schedule();
        expect(s.configure.bind(s, [{ name: "Test", duration: 10 }])).to.throw("Target must be supplied");
    });
    
    it('Given a schedule step is initialised, when I set a step without a duration, then an exception should be thrown', function () {
        var s = new Schedule();
        expect(s.configure.bind(s, [{ name: "Test", target: 50 }])).to.throw("Duration must be supplied");
    });
    
    it('Given a schedule step is initialised, when I set a step without an enabled flad, then enabled sould default to true', function () {
        var s = new Schedule();
        expect(s.configure.bind(s, [{ name: "Test", target: 50 }])).to.throw("Duration must be supplied");
    });

    it('Given a schedule is configured, when I request a step by name and that name does not exist, then an exception should be thrown', function () {
        var s = minimalSchedule()
        
        expect(s.step("Mashout").enabled).to.equal(true);
    });
});

describe('Schedule Storage;', function () {
    
    it('Given a schedule is configured, when I save, then the configuration should be saved', function () {
        var s = minimalSchedule()
        
        var stub = sinon.stub(fs, "writeFileSync", function () { });
        
        s.save();
        
        expect(stub.called).to.equal(true);
    });
    
    it('Given a schedule is created with no name, when I save, then the configuration should be saved to the default file', function () {
        var s = minimalSchedule()
        
        var stub = sinon.stub(fs, "writeFileSync", function () { });
        
        s.save();

        expect(stub.called).to.equal(true);
        expect(stub.args[0][0]).to.equal("./data/default.json");

    });

    it('Given a schedule is saved, when I load, then the configuration should be loaded', function () {
        var s = minimalSchedule()
        
        var stub = sinon.stub(fs, "readFileSync", function () { return JSON.stringify(minimalSchedule().schedule); });
        
        var result = s.load(function (r) { result = r; });
        
        expect(stub.called).to.equal(true);
        expect(s.step("Sacc 1").target).to.equal(62);
        expect(s.step("Sacc 1").duration).to.equal(10);
        
    });

    it('Given a schedule is not saved, when I load, then I should return false', function () {
        var s = minimalSchedule()
        
        var stub = sinon.stub(fs, "readFileSync", function () {
            throw "File not found";
        });
        
        var result = s.load();
        
        expect(stub.called).to.equal(true);
        expect(result).to.equal(false);
    });

    it('Given a schedule is given a name, when I load, then I should use that name as the save file', function () {
        var s = new Schedule("test");
        
        var stub = sinon.stub(fs, "readFileSync", function () {
            throw "File not found";
        });
        
        var result = s.load();
        
        expect(stub.called).to.equal(true);
        expect(stub.args[0][0]).to.equal("./data/test.json");
    });
});
