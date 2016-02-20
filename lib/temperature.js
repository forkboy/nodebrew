var ds18b20 = require('ds18b20');

var TemperatureProbe = function (name, id) {
    this.name = name;
    this.id = id;
    this.currentTemp = 0.0;
    
    var self = this;
    
    if (id == undefined || id === '') {
        ds18b20.sensors(function (err, ids) {
            if (err) {
                return console.log('Can not get sensor IDs', err);
            }
            
            console.log("sensors found @");
            console.log(ids);
            
            self.id = ids[0];
            start();
        });
    }
    else {
        start();
    }

    var start = function () {
        setInterval(function () {
            ds18b20.temperature(self.id, function (err, value) {
                if (err) {
                    return console.log('Can not get sensor IDs', err);
                }
                self.currentTemp = value;
                console.log('Current temperature is', value);
            });

        }, 500);
    }

    this.getTemperature = function () {
        return this.currentTemp;
    }

}

module.exports = TemperatureProbe;