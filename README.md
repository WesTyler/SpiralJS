# SpiralJS

## What is SpiralJS?
SpiralJS creates spiral graphs of time-series data using D3.js. Spiral graphs can be useful in visualizing periodic trends in data that may otherwise be obscured in a traditional Signal vs Time graph.

Spiral graphs inspired by [this paper](http://ieg.ifs.tuwien.ac.at/~aigner/teaching/ws06/infovis_ue/papers/spiralgraph_weber01visualizing.pdf).

***

![Sample Spiral](https://s3-us-west-2.amazonaws.com/github-imgs/spiraljs/Untitled-1.jpg)
##### Side-by-side comparison of a spiral plot and a typical signal/time plot of the same data set.
Periodicity of the data is more readily apparent in Spiral plot, with smaller screen space used.

***

## Using SpiralJS

### Installation
npm install spiraljs
bower install spiraljs

### Sample Code
In order to generate the three plots above, assuming SpiralJS has been imported as appropriate:
```javascript
var spiral1 = new Spiral('points');
spiral1.setParam('numberOfPoints', 1000);
spiral1.setParam('period', 100);
spiral1.setParam('svgHeight', 500);
spiral1.setParam('svgWidth', 750);
spiral1.setParam('spacing', 8);
spiral1.randomData();
spiral1.render();

var spiral2 = new Spiral('custom-path')
spiral2.setParam('numberOfPoints', 1000);
spiral2.setParam('period', 100);
spiral2.setParam('svgHeight', 500);
spiral2.setParam('svgWidth', 750);
spiral2.setParam('spacing', 8);
spiral2.setParam('lineWidth', 50);
spiral2.randomData();
spiral2.render();

var spiral3 = new Spiral('non-spiral')
spiral3.setParam('numberOfPoints', 1000);
spiral3.setParam('period', 100);
spiral3.setParam('svgHeight', 500);
spiral3.setParam('svgWidth', 750);
spiral3.randomData();
spiral3.render();
```

### Documentation
#### Methods
##### setParam
Use **setParam** to set or update graph options. **setParams** will re-render the graph as necessary depending on parameters being changed.
###### params available
graphType // 'non-spiral' || 'custom-path' || 'points' - defaults to 'points'
numberOfPoints // integer number of data points in the set 
period // integer number of data points per period on the spiral
margin: { // margin space between edge of graph and edge of svg
  top // integer - defaults to 10
  right  // integer - defaults to 10
  bottom  // integer - defaults to 10
  left  // integer - defaults to 30
},
svgHeight // integer height in pixels for whole SVG element
svgWidth // integer width in pixels for whole SVG element
spacing // integer spacing between spiral periods - defaults to 1
lineWidth // integer width of svg line for 'custom-path' graphs - defaults to 50
targetElement // CSS selector for target DOM element for appending SVG 
data: // Array containing data in the form [[time1, signal1], ..., [timeN, signalN]]
x: d3.scale.linear().range([0, 730]).domain([-750, 750]),
y: d3.scale.linear().range([480, 0]).domain([-500, 500]),
tickMarkNumber: [],
tickMarkLabels: [],
color // CSS color of graph - defaults to 'black'
colorMode: // 'opacity'|| 'binary' - defaults to 'opacity'

##### randomData
Use **randomData** to generate sample data based on graph options. Useful for previewing graph options before actual data is available.

##### render
Use **render** to create the graph's svg and append it to the target DOM element.


