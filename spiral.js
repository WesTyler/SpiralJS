function Spiral(graphType) {
  this.option = {
    graphType: graphType || "points",
    numberOfPoints: null,
    period: null,
    margin: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 30
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

Spiral.prototype.cartesian = function(radius, angle, size) {
  var classObj = this;
  var option = classObj.option;

  var size = size || 1;
  var xPos = option.x(radius * Math.cos(angle));
  var yPos = option.y(radius * Math.sin(angle));
  return [xPos, yPos, size];
},
Spiral.prototype.render = function() {
  var classObj = this;
  var option = classObj.option;

  var svg = d3.select(option.targetElement)
    .append("svg")
    .attr("width", option.svgWidth)
    .attr("height", option.svgHeight)

  if (option.graphType === "points") {
    svg.append("g")
      .attr("transform", "translate(" + option.margin.left + "," + option.margin.top + ")");
      
    svg.selectAll("g").selectAll("dot")
      .data(option.data)
        .enter().append("circle")
          .attr("r", function(d) { return d[2]; })
          .attr("cx", function(d) { return d[0]; })
          .attr("cy", function(d) { return d[1]; });
  } else if (option.graphType === "custom-path") {
    option.data.forEach(function(datum, t, dataSet){
      var start = startAngle(t, option.period);
      var end = endAngle(t, option.period);

      var startCenter = radius(option.spacing, start);
      var endCenter = radius(option.spacing, end);
      var startInnerRadius = startCenter - option.lineWidth*0.5;
      var startOuterRadius = startCenter + option.lineWidth*0.5;
      var endInnerRadius = endCenter - option.lineWidth*0.5;
      var endOuterRadius = endCenter + option.lineWidth*0.5;
      
      var ctrlInnerRad = 0.01;
      var ctrlOuterRad = 0.01;
      var angle = theta(t, option.period);
      var rad = radius(option.spacing, angle);
      var innerControlPoint = classObj.cartesian(rad - option.lineWidth*0.5 + ctrlInnerRad, angle);
      var outerControlPoint = classObj.cartesian(rad + option.lineWidth*0.5 + ctrlOuterRad, angle);

      var startPoint = classObj.cartesian(startInnerRadius, start);
      var point2 = classObj.cartesian(startOuterRadius, start);
      var point3 = classObj.cartesian(endOuterRadius, end);
      var point4 = classObj.cartesian(endInnerRadius, end);
      var arcPath = "M"+startPoint[0]+" "+startPoint[1]+"L"+point2[0]+" "+point2[1];
      arcPath += "Q"+outerControlPoint[0]+" "+outerControlPoint[1]+" "+point3[0]+" "+point3[1];
      arcPath += "L"+point4[0]+" "+point4[1];
      arcPath += "Q"+innerControlPoint[0]+" "+innerControlPoint[1]+" "+startPoint[0]+" "+startPoint[1]+"Z";
      datum[1] = arcPath
    });

    svg.append("g")
      .attr("transform", "translate(" + option.margin.left + "," + option.margin.top + ")");
    svg.selectAll("g").selectAll("path")
      .data(option.data.slice(100))
      .enter().append("path")
        .style("fill", function(d) { return "black"; })
        .style("opacity", function(d) {return d[2]/9})
        .attr("d", function(d) { return d[1]});
  } else if (option.graphType === "non-spiral") {
    // --------------------vvv Standard Line Graph vvv---------------------------
    var x2 = d3.scale.linear().range([0, 730]);
    var y2 = d3.scale.linear().range([480, 0]);
    x2.domain(d3.extent(option.data, function(d) { return d[0]; }));
    y2.domain(d3.extent(option.data, function(d) { return d[1]; }));

    var xAxis = d3.svg.axis().scale(x2)
      .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis().scale(y2)
      .orient("left").ticks(5);

    var line = d3.svg.line()
      .x(function(d) { return x2(d[0]); })
      .y(function(d) { return y2(d[1]); });

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate("+option.margin.left+"," + 480 + ")")
      .call(xAxis)
      .append("text")
        .attr("x", 710)
        .attr("y", -3)
        .attr("dy", "-.35em")
        .style("text-anchor", "middle")
        .text("time");

    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate("+option.margin.left+",0)")
      .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Signal (a.u.)");

    svg.append("path")
      .datum(option.data)
      .attr("class", "line")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke-width", "1")
      .attr("stroke", "steelblue")
      .attr("transform", "translate("+option.margin.left+",0)")
  }
},
Spiral.prototype.randomData = function() {
  var classObj = this;
  var option = classObj.option;

  option.data = [];
  for (var i=0; i<option.numberOfPoints; i++){
    var angle = theta(i, option.period);
    var rad = radius(option.spacing, angle);
    var size = 1 + Math.random()*1;
    if (i % 10 === 0) {
      size = 1.2 + Math.random()*1.5;
    }

    if (option.graphType === 'non-spiral') {
      option.data.push([i, size*option.period, 2])
    } else {
      option.data.push(this.cartesian(rad, angle, size));
    }
  }
},
Spiral.prototype.setParam = function(param, value) {
  var classObj = this;
  var option = classObj.option;

  option[param] = value;

  if (['svgHeight', 'svgWidth', 'margin.top', 'margin.right', 'margin.bottom', 'margin.left'].indexOf(param) > -1) {
    var width = option.svgWidth - option.margin.left - option.margin.right;
    var height = option.svgHeight - option.margin.top - option.margin.bottom;
    option.x = d3.scale.linear().range([0, width]).domain([-option.svgWidth, option.svgWidth]);
    option.y = d3.scale.linear().range([height, 0]).domain([-option.svgHeight, option.svgHeight]);
  }
},
Spiral.prototype.redraw = function() {
  var classObj = this;
  var option = classObj.option;

  var graphContainer = document.getElementById(option.targetElement.substr(1));
  while (graphContainer.firstChild) {
    graphContainer.removeChild(graphContainer.firstChild)
  }
  classObj.render();
},
Spiral.prototype.autocorrelate = function() {
  var n = this.option.numberOfPoints;
  var index = this.option.graphType === 'non-spiral' ? 1 : 2;

  var sum = 0;
  for (var i=0; i<n; i++) {
    sum += this.option.data[i][index];
  }
  var avg = sum/n;

  var sigma2 = 0;
  for (var j=0; j < n; j++) {
    sigma2 += Math.pow((this.option.data[j][index] - avg),2);
  }
  console.log(n, avg, sigma2)

  var coeff;
  var coeffArray = [];

  for (var tau=0; tau < n; tau++) {
    var sigma1 = 0;
    for (var j=0; j < n-tau; j++) {
      sigma1 += (this.option.data[j][index] - avg) * (this.option.data[j+tau][index] - avg);
    }

    coeff = sigma1 / sigma2;
    coeffArray.push([tau, coeff]);
  }

  return coeffArray;
}

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