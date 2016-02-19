var assert = require('assert');
var Steps = require('../lib/steps.js');

describe('Manual Step', function () {
    it('should be of type Manual', function () {
        var step = new Steps.Manual("Test");
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Manual");
    });
})

describe('Mash Ramp Step', function () {
    it('should be of type Ramp', function () {
        var step = new Steps.MashRampStep("Test");
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Ramp");
    });
})

describe('Mash Hold Step', function () {
    it('should be of type Hold', function () {
        var step = new Steps.MashHoldStep("Test");
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Hold");
    });
})