var BrewEvent = function (type, context) {
    this.type = type;
    this.context = context;
};

var TemperatureReachedEvent = function (context) {
    BrewEvent.call(this, "TemperatureReached", context);
}
TemperatureReachedEvent.prototype = Object.create(BrewEvent.prototype);

var TimeExpiredEvent = function (context) {
    BrewEvent.call(this, "TimeExpired", context);
}
TimeExpiredEvent.prototype = Object.create(BrewEvent.prototype);

var InputEvent = function (context) {
    BrewEvent.call(this, "Input", context);
}
InputEvent.prototype = Object.create(BrewEvent.prototype);

module.exports.TemperatureReachedEvent = TemperatureReachedEvent;
module.exports.TimeExpiredEvent = TimeExpiredEvent;
module.exports.InputEvent = InputEvent;