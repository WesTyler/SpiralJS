# SpiralJS
Create spiral graphs of time-series data using D3.js

Spiral graphs inspired by [this paper](http://ieg.ifs.tuwien.ac.at/~aigner/teaching/ws06/infovis_ue/papers/spiralgraph_weber01visualizing.pdf).

![Sample Spiral](https://s3-us-west-2.amazonaws.com/github-imgs/spiraljs/Untitled-1.jpg)
##### Side-by-side comparison of a spiral plot and a typical signal/time plot of the same data set.
Periodicity of the data is more readily apparent in Spiral plot, with smaller screen space used.

##### Using SpiralJS
In order to generate the three plots above:
```
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
