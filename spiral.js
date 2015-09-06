// For time point #t, calculate the angle to the center of the arc
// period is the number of time points per revolution (2 PI)
function theta(t, period) {
  return 2 * Math.PI / (period) * t;
}

function radius(spacing, angle) {
  return spacing * angle;
}

function cartesian(radius, angle, size) {
  var size = size || 1;
  var x = radius * Math.cos(angle);
  var y = radius * Math.sin(angle);
  return [x, y, size];
}

var margin = {top: 20, right: 20, bottom: 20, left: 40};
var width = 750 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom; 

var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);


var svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var data = [];
var data2 = [];
for (var i=100; i<1001; i++) {
  var angle = theta(i, 100);
  var rad = radius(8, angle);
  var size = 1 + Math.random()*2.5;
  if (i % 10 === 0) {
    size = 3.5 + Math.random()*3;
  }
  data.push(cartesian(rad, angle, size))
  data2.push([i, size*100, 2])
}

y.domain([-height, height]);
x.domain([-width, width]);

svg.selectAll("dot")
  .data(data)
    .enter().append("circle")
      .attr("r", function(d) { return d[2]; })
      .attr("cx", function(d) { return x(d[0]); })
      .attr("cy", function(d) { return y(d[1]); });

// --------------------vvv Standard Line Graph vvv---------------------------

var x2 = d3.scale.linear().range([0, width]);
var y2 = d3.scale.linear().range([height, 0]);
x2.domain(d3.extent(data2, function(d) { return d[0]; }));
y2.domain(d3.extent(data2, function(d) { return d[1]; }));

var xAxis = d3.svg.axis().scale(x2)
  .orient("bottom").ticks(5);

var yAxis = d3.svg.axis().scale(y2)
  .orient("left").ticks(5);

var line = d3.svg.line()
  .x(function(d) { return x2(d[0]); })
  .y(function(d) { return y2(d[1]); });

var svg2 = d3.select("body")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("tranform", "translate(" + margin.left + "," + margin.top + ")")

    // Add the X Axis
svg2.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate("+margin.left+"," + height + ")")
  .call(xAxis)
  .append("text")
    .attr("x", width)
    .attr("y", -3)
    .attr("dy", "-.35em")
    .style("text-anchor", "middle")
    .text("time");

    // Add the Y Axis
svg2.append("g")
  .attr("class", "y axis")
  .attr("transform", "translate("+margin.left+",0)")
  .call(yAxis)
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Signal (a.u.)");

svg2.append("path")
  .datum(data2)
  .attr("class", "line")
  .attr("d", line)
  .attr("fill", 'none')
  .attr('stroke-width', '1')
  .attr('stroke', 'steelblue')
  .attr("transform", "translate("+margin.left+",0)")