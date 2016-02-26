var fs = require('fs');

var Schedule = function (name) {
    var self = this;
    
    this.name = name === undefined ? "default" : name;
    
    // the default schedule
    this.schedule = [
        { name: "Protien", target: 50, duration: 0,  enabled: false, ranges: { ld: 0,  ud: 30, lt: 45, ut: 55 } },
        { name: "Sacc 1",  target: 62, duration: 0,  enabled: false, ranges: { ld: 0,  ud: 30, lt: 60, ut: 70 } },
        { name: "Sacc 2",  target: 65, duration: 60, enabled: true,  ranges: { ld: 30, ud: 60, lt: 60, ut: 70 }  },
        { name: "Sacc 3",  target: 68, duration: 0,  enabled: false, ranges: { ld: 0,  ud: 30, lt: 60, ut: 70 } },
        { name: "Mashout", target: 76, duration: 0,  enabled: true,  ranges: { ld: 0,  ud: 30, lt: 70, ut: 80 }  },
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

    this.save = function () {
        fs.writeFileSync("./data/" + this.name + ".json", JSON.stringify(this.schedule));
    };

    this.load = function () {
        try {
            var data = fs.readFileSync("./data/" + this.name + ".json");
        }
        catch (e) { 
            return false;
        }

        try {
            self.schedule = JSON.parse(data);
        }
        catch (e) {
            return false;
        }
        
        return true;
    }

};

module.exports = Schedule;