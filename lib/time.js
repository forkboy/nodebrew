var MachineSeconds = function () {
    return process.hrtime()[0];
};

module.exports.Seconds = MachineSeconds;