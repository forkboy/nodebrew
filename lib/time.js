var Time = function () {

}

Time.prototype.MachineSeconds = function () {
    return process.hrtime()[0];
};

module.exports = Time;