var Time   = require('./time.js'),
    Postal = require("postal");

var EventLog = function () {
    var self = this;

    this.data = [];
    this.messageBus = Postal.channel();
    this.startedAt = 0;

    this.getData = function () {
        return this.data;
    }

    this.start = function () {
        this.startedAt = Time.Seconds();

        self.messageBus.subscribe("Tick", function (data) {
            var relativeTime = data.CurrentTime - self.startedAt;
            if (self.data.length == 0 ||
                relativeTime - self.data[self.data.length - 1].Time >= 5) {
                self.data.push({
                    KettleTemperature : data.KettleTemperature,
                    KettleTarget      : data.KettleTarget,
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