var ds18b20 = require('ds18b20');

var TemperatureProbe = function (name, id) {
    var self = this;
    
    this.name = name;
    this.id = id;
    this.currentTemp = 0.0;
    this.ds18b20 = ds18b20;
    
    this.getSensors = function (done) {
        self.ds18b20.sensors(function (err, ids) {
            if (err) {
                return console.log('Can not get sensor IDs', err);
            }
            
            console.log("sensors found @");
            console.log(ids);
            
            self.id = ids[0];
            done();
        });
    };
    
    this.pollSensor = function () {
        self.ds18b20.temperature(self.id, function (err, value) {
            if (err) {
                return console.log('Can not get sensor IDs', err);
            }
            self.currentTemp = value;
            console.log('Current temperature is', value);
        });
    };

    this.monitor = function () {
        setInterval(function () {
            self.pollSensor();
        }, 500);
    }
    
    this.start = function () {
        this.getTemperature = function () {
            return self.currentTemp;
        }
        
        if (id == undefined || id === '') {
            this.getSensors(this.monitor);
        }
        else {
            this.monitor();
        }
    }
}

module.exports = TemperatureProbe;