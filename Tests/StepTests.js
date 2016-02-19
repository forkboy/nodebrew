var assert = require('assert');
var Steps = require('../lib/steps.js');

describe('Manual Step;', function () {
    it('Given I am initialised, then I should be of type Manual', function () {
        var step = new Steps.Manual("Test");
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Manual");
    });
})

describe('Temp Ramp Step;', function () {
    it('Given I am initialised, then I should be of type Ramp', function () {
        var step = new Steps.TempRamp("Test");
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Ramp");
    });

    it('Given I am initialised and pumpState is not specified, then I should default to pump state true', function () {
        var step = new Steps.TempRamp("Test");

        assert.equal(step.pumpState, true);
    });

    it('Given I am initialised and target temp is specified, then I should have the specified target temp', function () {
        var step = new Steps.TempRamp("Test", 64.5);
        
        assert.equal(step.targetTemp, 64.5);
    });
})

describe('Temp Hold Step;', function () {
    it('Given I am initialised, then I should be of type Hold', function () {
        var step = new Steps.TempHold("Test");
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Hold");
    });

    it('Given I am initialised and pumpState is not specified, then I should default to pump state true', function () {
        var step = new Steps.TempHold("Test");
        
        assert.equal(step.pumpState, true);
    });
    
    it('Given I am initialised and duration is specified, then I should have the specified duration', function () {
        var step = new Steps.TempHold("Test", 30.1);
        
        assert.equal(step.duration, 30.1);
    });
})

describe('Boil Step;', function () {
    it('Given I am initialised, then I should be of type Boil', function () {
        var step = new Steps.Boil("Test");
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Boil");
    });
    
    it('Given I am initialised and duration is specified, then I should have the specified duration', function () {
        var step = new Steps.Boil("Test", 30.1);
        
        assert.equal(step.duration, 30.1);
    });
})

describe('Chill Step;', function () {
    it('Given I am initialised, then I should be of type Chill', function () {
        var step = new Steps.Chill("Test");
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Chill");
    });
    
    it('Given I am initialised and duration is specified, then I should have the specified duration', function () {
        var step = new Steps.Chill("Test", 30.1);
        
        assert.equal(step.duration, 30.1);
    });
})

describe('Settle Step;', function () {
    it('Given I am initialised, then I should be of type Settle', function () {
        var step = new Steps.Settle("Test");
        assert.equal(step.name, "Test");
        assert.equal(step.type, "Settle");
    });
    
    it('Given I am initialised and duration is specified, then I should have the specified duration', function () {
        var step = new Steps.Settle("Test", 30.1);
        
        assert.equal(step.duration, 30.1);
    });
})