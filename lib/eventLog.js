var Time   = require('./time.js'),
    Postal = require("postal");

var EventLog = function () {
    var self = this;

    this.data = [];
    this.messageBus = Postal.channel();
    this.startedAt = 0;
    this.maximumEvents = 180;
    this.frequency = 30;

    this.getData = function () {
        return this.data;
    }

    this.start = function () {
        this.startedAt = Time.Seconds();
        this.lastTarget = 0;

        self.messageBus.subscribe("Tick", function (data) {
            
            // Keep the target a rolling figure, and filter out the 0 values
            self.lastTarget = data.KettleTarget == 0 ? self.lastTarget : data.KettleTarget;
            
            var relativeTime = data.CurrentTime - self.startedAt;
            var diff = self.data.length === 0 ? 0 : relativeTime - self.data[self.data.length - 1].Time;
            if (self.data.length === 0 || diff >= self.frequency) {
                // Trim the oldest data, keeing it at maximumEvents
                if (self.data.length == self.maximumEvents) {
                    self.data = self.data.slice(1, self.maximumEvents);
                }
                self.data.push({
                    KettleTemperature : data.KettleTemperature,
                    KettleTarget      : self.lastTarget,
                    Time              : relativeTime
                });
            }
        });

        self.messageBus.subscribe("GetEventLog", function (data) { 
            self.messageBus.publish("EventLog", { events: self.data });
        });
    }
}

module.exports = EventLog;