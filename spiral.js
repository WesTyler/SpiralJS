function Spiral(graphType) {
  this.graphParams = {
    graphType: graphType || "points",
    numberOfPoints: null,
    period: null,
    margin: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    },
    svgHeight: 0,
    svgWidth: 0,
    spacing: 1,
    lineWidth: 50,
    targetElement: '#chart',
    data: [],
    x: d3.scale.linear().range([0, 730]).domain([-750, 750]),
    y: d3.scale.linear().range([480, 0]).domain([-500, 500]),
  }
}; 

Spiral.prototype.cartesian = function(radius, angle, size, startAngle, endAngle) {
  var size = size || 1;
  var xPos = this.graphParams.x(radius * Math.cos(angle));
  var yPos = this.graphParams.y(radius * Math.sin(angle));
  return [xPos, yPos, size, radius, angle, startAngle, endAngle];
},
Spiral.prototype.render = function() {
  var spiralContext = this;

  var svg = d3.select(spiralContext.graphParams.targetElement)
    .append("svg")
    .attr("width", spiralContext.graphParams.svgWidth)
    .attr("height", spiralContext.graphParams.svgHeight)

  if (spiralContext.graphParams.graphType === "points") {
    svg.append("g")
      .attr("transform", "translate(" + spiralContext.graphParams.margin.left + "," + spiralContext.graphParams.margin.top + ")");
      
    svg.selectAll("g").selectAll("dot")
      .data(spiralContext.graphParams.data)
        .enter().append("circle")
          .attr("r", function(d) { return d[2]; })
          .attr("cx", function(d) { return d[0]; })
          .attr("cy", function(d) { return d[1]; });
  } else if (spiralContext.graphParams.graphType === "custom-path") {
    spiralContext.graphParams.data.forEach(function(datum, t, dataSet){
      var start = startAngle(t, spiralContext.graphParams.period);
      var end = endAngle(t, spiralContext.graphParams.period);

      var startInnerRadius = radius(spiralContext.graphParams.spacing, start) - spiralContext.graphParams.lineWidth*0.5;
      var startOuterRadius = radius(spiralContext.graphParams.spacing, start) + spiralContext.graphParams.lineWidth*0.5;
      var endInnerRadius = radius(spiralContext.graphParams.spacing, end) - spiralContext.graphParams.lineWidth*0.5;
      var endOuterRadius = radius(spiralContext.graphParams.spacing, end) + spiralContext.graphParams.lineWidth*0.5;
      
      var ctrlInnerRad = 0.01; // Use to adjust arc inner radius
      var ctrlOuterRad = 0.01; // Use to adjust arc outer radius
      var innerControlPoint = spiralContext.cartesian(radius(spiralContext.graphParams.spacing, theta(t, spiralContext.graphParams.period)) - spiralContext.graphParams.lineWidth*0.5 + ctrlInnerRad, theta(t, spiralContext.graphParams.period));
      var outerControlPoint = spiralContext.cartesian(radius(spiralContext.graphParams.spacing, theta(t, spiralContext.graphParams.period)) + spiralContext.graphParams.lineWidth*0.5 + ctrlOuterRad, theta(t, spiralContext.graphParams.period));

      var startPoint = spiralContext.cartesian(startInnerRadius, start); // Bottom right of arc
      var point2 = spiralContext.cartesian(startOuterRadius, start); // Top right of arc
      var point3 = spiralContext.cartesian(endOuterRadius, end); // Top left of arc
      var point4 = spiralContext.cartesian(endInnerRadius, end); // Bottom left of arc
      var arcPath = "M" + startPoint[0] + " " + startPoint[1] + "L" + point2[0] + " " + point2[1];
      arcPath += "Q" + outerControlPoint[0] + " " + outerControlPoint[1] + " " + point3[0] + " " + point3[1];
      arcPath += "L" + point4[0] + " " + point4[1];
      arcPath += "Q" + innerControlPoint[0] + " " + innerControlPoint[1] + " " + startPoint[0] + " " + startPoint[1] + "Z";
      datum[1] = arcPath
    });

    svg.append("g")
      .attr("transform", "translate(" + spiralContext.graphParams.margin.left + "," + spiralContext.graphParams.margin.top + ")");
    svg.selectAll("g").selectAll("path")
      .data(spiralContext.graphParams.data.slice(100))
      .enter().append("path")
        .style("fill", function(d) { return "black"; })
        .style("opacity", function(d) {return d[2]/9})
        .attr("d", function(d) { return d[1]});
  } else if (spiralContext.graphParams.graphType === "non-spiral") {
    // --------------------vvv Standard Line Graph vvv---------------------------
    var x2 = d3.scale.linear().range([0, 730]);
    var y2 = d3.scale.linear().range([480, 0]);
    x2.domain(d3.extent(spiralContext.graphParams.data, function(d) { return d[0]; }));
    y2.domain(d3.extent(spiralContext.graphParams.data, function(d) { return d[1]; }));

    var xAxis = d3.svg.axis().scale(x2)
      .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis().scale(y2)
      .orient("left").ticks(5);

    var line = d3.svg.line()
      .x(function(d) { return x2(d[0]); })
      .y(function(d) { return y2(d[1]); });

    // Add the X Axis
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate("+spiralContext.graphParams.margin.left+"," + 480 + ")")
      .call(xAxis)
      .append("text")
        .attr("x", 710)
        .attr("y", -3)
        .attr("dy", "-.35em")
        .style("text-anchor", "middle")
        .text("time");

    // Add the Y Axis
    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate("+spiralContext.graphParams.margin.left+",0)")
      .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Signal (a.u.)");

    svg.append("path")
      .datum(spiralContext.graphParams.data)
      .attr("class", "line")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke-width", "1")
      .attr("stroke", "steelblue")
      .attr("transform", "translate("+spiralContext.graphParams.margin.left+",0)")
  }
},
Spiral.prototype.randomData = function() {
  this.graphParams.data = [];
  for (var i=0; i<this.graphParams.numberOfPoints; i++){
    var angle = theta(i, this.graphParams.period);
    var rad = radius(this.graphParams.spacing, angle);
    var size = 1 + Math.random()*1.5;
    if (i % 10 === 0) {
      size = 5.5 + Math.random()*3;
    }

    if (this.graphParams.graphType === 'non-spiral') {
      this.graphParams.data.push([i, size*this.graphParams.period, 2])
    } else {
      this.graphParams.data.push(this.cartesian(rad, angle, size, startAngle(i, this.graphParams.period), endAngle(i, this.graphParams.period)));
    }
  }
},
Spiral.prototype.setParam = function(param, value) {
  var spiralContext = this;

  spiralContext.graphParams[param] = value;

  if (['svgHeight', 'svgWidth', 'margin.top', 'margin.right', 'margin.bottom', 'margin.left'].indexOf(param) > -1) {
    var width = spiralContext.graphParams.svgWidth - spiralContext.graphParams.margin.left - spiralContext.graphParams.margin.right;
    var height = spiralContext.graphParams.svgHeight - spiralContext.graphParams.margin.top - spiralContext.graphParams.margin.bottom;
    spiralContext.graphParams.x = d3.scale.linear().range([0, width]).domain([-spiralContext.graphParams.svgWidth, spiralContext.graphParams.svgWidth]);
    spiralContext.graphParams.y = d3.scale.linear().range([height, 0]).domain([-spiralContext.graphParams.svgHeight, spiralContext.graphParams.svgHeight]);
  }
},
Spiral.prototype.redraw = function() {
  var spiralContext = this;
  var graphContainer = document.getElementById(spiralContext.graphParams.targetElement.substr(1));
  while (graphContainer.firstChild) {
    graphContainer.removeChild(graphContainer.firstChild)
  }
  spiralContext.render();
},
Spiral.prototype.autocorrelate = function() {}

// For time point #t, calculate the angle to the center of the arc
// period is the number of time points per revolution (2 PI)
function theta(t, period) {
  return 2 * Math.PI / (period) * t;
}

function startAngle(t, period) {
  return (theta(t-1, period) + theta(t, period))/2;
}

function endAngle(t, period) {
  return (theta(t+1, period) + theta(t, period))/2;
}

function radius(spacing, angle) {
  return spacing * angle;
}