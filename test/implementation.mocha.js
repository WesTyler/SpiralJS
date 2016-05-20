var should = require('chai').should(),
    expect = require('chai').expect,
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
    describe('setParam', function() {
        it('should throw if the param does not exist in options', function() {
            var spiral = new Spiral();

            expect(spiral.setParam.bind(spiral, 'notReal', 10)).to.throw(Error).and.eql(Error('notReal is not a valid parameter.'));
        });
        it('should set basic params as expected', function() {
            var spiral = new Spiral();

            spiral.setParam('graphType', 'custom-path');
            spiral.setParam('numberOfPoints', 10);
            spiral.setParam('period', 5);
            spiral.setParam('spacing', 2);
            spiral.setParam('lineWidth', 10);
            spiral.setParam('targetElement', '#other-target');
            spiral.setParam('data', [1,2,3,4,5,6,7,8,9,10]);
            spiral.setParam('tickMarkNumber', [0,2,4,6,8]);
            spiral.setParam('tickMarkLabels', ['0','2','4','6','8']);
            spiral.setParam('color', 'knot-blue');
            spiral.setParam('colorMode', 'blend');

            spiral.option.graphType.should.equal('custom-path');
            spiral.option.numberOfPoints.should.equal(10);
            spiral.option.period.should.equal(5);
            spiral.option.spacing.should.equal(2);
            spiral.option.lineWidth.should.equal(10);
            spiral.option.targetElement.should.equal('#other-target');
            spiral.option.data.should.eql([1,2,3,4,5,6,7,8,9,10]);
            spiral.option.tickMarkNumber.should.eql([0,2,4,6,8]);
            spiral.option.tickMarkLabels.should.eql(['0','2','4','6','8']);
            spiral.option.color.should.equal('knot-blue');
            spiral.option.colorMode.should.equal('blend');
        });
        it('should recalculate and set relevant options if margins or height/width are set', function() {
            var spiral = new Spiral();

            Math.ceil(spiral.option.x(10)).should.equal(370);

            spiral.setParam('svgWidth', 100);
            spiral.option.x(10).should.equal(33);

            spiral.setParam('margin.left', 10);
            spiral.option.x(10).should.equal(44);

            spiral.setParam('margin.right', 8);
            spiral.option.x(10).should.equal(45.1);

            spiral.option.y(1).should.equal(-20);

            spiral.setParam('svgHeight', 100);
            Math.trunc(spiral.option.y(1)).should.equal(39);

            spiral.setParam('margin.top', 15);
            Math.trunc(spiral.option.y(1)).should.equal(37);

            spiral.setParam('margin.bottom', 15);
            Math.trunc(spiral.option.y(1)).should.equal(34);
        });
    });
});