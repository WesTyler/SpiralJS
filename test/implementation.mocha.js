var should = require('chai').should(),
    Spiral = require('../spiral.js');

describe('SpiralJS', function() {
    it('should be a function', function() {
        Spiral.should.be.instanceOf(Function);
    });
    it('should instantiate an object on "new" invocation', function() {
        var newSpiral = new Spiral();

        newSpiral.should.be.instanceOf(Object);
        newSpiral.constructor.should.equal(Spiral);
    });
    describe('Default Instantiation', function() {
        var defaultSpiral = new Spiral();

        it('should have options', function() {
            defaultSpiral.should.have.property('option');
        });
        it('should default to desired option values', function() {
            defaultSpiral.option.should.have.property('graphType').and.equal('points');
            defaultSpiral.option.should.have.property('numberOfPoints').and.eql(null);
            defaultSpiral.option.should.have.property('period').and.eql(null);
            defaultSpiral.option.should.have.property('margin').and.eql({
                top   : 10,
                right : 10,
                bottom: 10,
                left  : 30
            });
            defaultSpiral.option.should.have.property('svgHeight').and.equal(0);
            defaultSpiral.option.should.have.property('svgWidth').and.equal(0);
            defaultSpiral.option.should.have.property('spacing').and.equal(1);
            defaultSpiral.option.should.have.property('lineWidth').and.equal(50);
            defaultSpiral.option.should.have.property('targetElement').and.equal('#chart');
            defaultSpiral.option.should.have.property('data').and.eql([]);
            defaultSpiral.option.should.have.property('x').and.be.instanceOf(Function);
            defaultSpiral.option.should.have.property('y').and.be.instanceOf(Function);
            defaultSpiral.option.should.have.property('tickMarkNumber').and.eql([]);
            defaultSpiral.option.should.have.property('tickMarkLabels').and.eql([]);
            defaultSpiral.option.should.have.property('color').and.equal('black');
            defaultSpiral.option.should.have.property('colorMode').and.equal('opacity');
        });
        it('should have method .cartesian', function() {
            defaultSpiral.should.have.property('cartesian').and.be.instanceOf(Function);
        });
        it('should have method .render', function() {
            defaultSpiral.should.have.property('cartesian').and.be.instanceOf(Function);
        });
        it('should have method .randomData', function() {
            defaultSpiral.should.have.property('randomData').and.be.instanceOf(Function);
        });
        it('should have method .setParam', function() {
            defaultSpiral.should.have.property('setParam').and.be.instanceOf(Function);
        });
        it('should have method .redraw', function() {
            defaultSpiral.should.have.property('redraw').and.be.instanceOf(Function);
        });
        it('should have method .autocorrelate', function() {
            defaultSpiral.should.have.property('autocorrelate').and.be.instanceOf(Function);
        });
        it('should have method .findPeriod', function() {
            defaultSpiral.should.have.property('findPeriod').and.be.instanceOf(Function);
        });
    });
});