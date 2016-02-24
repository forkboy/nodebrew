var fs = require('fs');

var Schedule = function () {
    var self = this;
    
    // the default schedule
    this.schedule = [
        { name: "Protien", target: 50, duration: 0,  enabled: false },
        { name: "Sacc 1",  target: 62, duration: 0,  enabled: false },
        { name: "Sacc 2",  target: 65, duration: 60, enabled: true  },
        { name: "Sacc 3",  target: 68, duration: 0,  enabled: false },
        { name: "Mashout", target: 76, duration: 0,  enabled: true  },
    ];

    this.configure = function (steps) {
        for (var i = 0; i < steps.length; i++) {
            if (steps[i].name === undefined)
                throw "Name must be supplied";

            if (steps[i].target === undefined)
                throw "Target must be supplied";

            if (steps[i].duration === undefined)
                throw "Duration must be supplied";

            if (steps[i].enabled === undefined)
                steps[i].enabled = true;
        }

        this.schedule = steps;
    };

    this.step = function (name)
    {
        for (var i = 0; i < this.schedule.length; i++) {
            if (this.schedule[i].name === name)
                return this.schedule[i];
        }

        throw "Schedule step not found";
    }

    this.save = function (complete) {
        fs.writeFile("./mashSchedule.json", JSON.stringify(this.schedule), function (err) {
            if (err) {
                console.log(err);
                return complete(false);
            }
            
            return complete(true);
        });
    };

    this.load = function (complete) {
        fs.readFile("./mashSchedule.json", function (err, data) {
            if (err) {
                console.log(err);
                return complete(false);
            }
            
            try {
                self.schedule = JSON.parse(data);
            }
            catch (e) {
                return complete(false);
            }

            return complete(true);
        });
    }

};

module.exports = Schedule;