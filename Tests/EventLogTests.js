var assert   = require('assert'),
    expect   = require('chai').expect,
    EventLog = require('../lib/eventlog.js'),
    Time     = require('../lib/time.js'),
    sinon    = require('sinon'),
    Postal   = require("postal");

describe('Event Log;', function () {
    
    it('Given an initialised Event Log, I should have no data', function () {
        
        var el = new EventLog();
        
        expect(el.getData().length == 0)
    });
    
    it('Given an initialised Event Log, when I am started, I should record the current time', function () {
        var el = new EventLog();

        sinon.stub(Time, "Seconds", function () {
            return 100;
        });

        el.start();

        expect(el.startedAt).to.equal(100);
    });
    
    it('Given an initialised Event Log, when a tick is raised for the first time, a data point should be created', function () {
        var el = new EventLog();
        
        var messageBus = Postal.channel();
        
        sinon.stub(Time, "Seconds", function () {
            return 100;
        });

        el.start();

        messageBus.publish("Tick", {
            KettleTemperature: 12,
            KettleTarget     : 25,
            KettlePump       : 1,
            KettleElement    : 1,
            CurrentTime      : 110
        });

        expect(el.getData().length).to.equal(1);
    });
    
    it('Given an initialised Event Log, when a tick is raised, a data point should be created no less than 30 seconds apart', function () {
        var el = new EventLog();
        
        var messageBus = Postal.channel();
        
        sinon.stub(Time, "Seconds", function () {
            return 100;
        });
        
        el.start();
        
        messageBus.publish("Tick", {
            KettleTemperature: 12,
            KettleTarget     : 25,
            KettlePump       : 1,
            KettleElement    : 1,
            CurrentTime      : 100
        });
        
        messageBus.publish("Tick", {
            KettleTemperature: 12,
            KettleTarget     : 25,
            KettlePump       : 1,
            KettleElement    : 1,
            CurrentTime      : 110
        });
        
        messageBus.publish("Tick", {
            KettleTemperature: 12,
            KettleTarget     : 25,
            KettlePump       : 1,
            KettleElement    : 1,
            CurrentTime      : 120
        });
        
        messageBus.publish("Tick", {
            KettleTemperature: 12,
            KettleTarget     : 25,
            KettlePump       : 1,
            KettleElement    : 1,
            CurrentTime      : 130
        });

        expect(el.getData().length).to.equal(2);
    });

    it('Given an initialised Event Log, when a tick is raised, data point should be added with time relative to start time', function () {
        var el = new EventLog();
        
        var messageBus = Postal.channel();
        
        sinon.stub(Time, "Seconds", function () {
            return 100;
        });
        
        el.start();
        
        messageBus.publish("Tick", {
            KettleTemperature: 12,
            KettleTarget     : 25,
            KettlePump       : 1,
            KettleElement    : 1,
            CurrentTime      : 110
        });
        
        expect(el.getData()[0].Time).to.equal(10);
    });

    it('Given an initialised Event Log, when a tick is raised, data point should be added with kettle temperature', function () {
        var el = new EventLog();
        
        var messageBus = Postal.channel();
        
        sinon.stub(Time, "Seconds", function () {
            return 100;
        });
        
        el.start();
        
        messageBus.publish("Tick", {
            KettleTemperature: 12,
            KettleTarget     : 25,
            KettlePump       : 1,
            KettleElement    : 1,
            CurrentTime      : 110
        });
        
        expect(el.getData()[0].KettleTemperature).to.equal(12);
    });

    it('Given an initialised Event Log, when a tick is raised, data point should be added with kettle target', function () {
        var el = new EventLog();
        
        var messageBus = Postal.channel();
        
        sinon.stub(Time, "Seconds", function () {
            return 100;
        });
        
        el.start();
        
        messageBus.publish("Tick", {
            KettleTemperature: 12,
            KettleTarget     : 25,
            KettlePump       : 1,
            KettleElement    : 1,
            CurrentTime      : 110
        });
        
        expect(el.getData()[0].KettleTarget).to.equal(25);
    });
    
    it('Given an initialised Event Log, when a tick is raised, and the kettle target is zero, the last non-zero target should be logged', function () {
        var el = new EventLog();
        
        var messageBus = Postal.channel();
        
        sinon.stub(Time, "Seconds", function () {
            return 100;
        });
        
        el.start();
        
        messageBus.publish("Tick", {
            KettleTemperature: 12,
            KettleTarget     : 25,
            KettlePump       : 1,
            KettleElement    : 1,
            CurrentTime      : 100
        });
        
        messageBus.publish("Tick", {
            KettleTemperature: 12,
            KettleTarget     : 0,
            KettlePump       : 1,
            KettleElement    : 1,
            CurrentTime      : 130
        });
        
        messageBus.publish("Tick", {
            KettleTemperature: 12,
            KettleTarget     : 50,
            KettlePump       : 1,
            KettleElement    : 1,
            CurrentTime      : 160
        });

        expect(el.getData()[0].KettleTarget).to.equal(25);
        expect(el.getData()[1].KettleTarget).to.equal(25);
        expect(el.getData()[2].KettleTarget).to.equal(50);
    });
    
    it('Given an initialised Event Log, when a more than 180 ticks are raised, the oldest event is trimmed to maintain 180 events', function () {
        var el = new EventLog();
        
        var messageBus = Postal.channel();
        
        sinon.stub(Time, "Seconds", function () {
            return 0;
        });
        
        el.start();
        
        var i = 0;
        for (i = 0; i < el.maximumEvents + 5; i++) {
            messageBus.publish("Tick", {
                KettleTemperature: 12,
                KettleTarget     : 25,
                KettlePump       : 1,
                KettleElement    : 1,
                CurrentTime      : 100 + (i * 30)
            });
        }
        
        var data = el.getData();
        expect(data.length).to.equal(el.maximumEvents);
        expect(data[0].Time).to.equal(100 + (5 * 30));
    });

    it('Given an started Event Log, when GetEventLog event is raised, an EventLog message is published', function () {
        var el = new EventLog();
        
        var messageBus = Postal.channel();
        
        var spy = sinon.spy(el.messageBus, "publish");
        
        el.start();
        
        messageBus.publish("GetEventLog", {});
        
        expect(spy.calledOnce).to.equal(true);
    });
});
