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

var width = 800;
var height = 800; 

var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);


var svg = d3.select("body")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")

var data = []
for (var i=100; i<1001; i++) {
  var angle = theta(i, 100);
  var rad = radius(8, angle);
  var size = 1 + Math.random()*2.5;
  if (i % 10 === 0) {
    size = 3.5 + Math.random()*2;
  }
  data.push(cartesian(rad, angle, size))
}

y.domain([-height, height]);
x.domain([-width, width]);

var xAxis = d3.svg.axis().scale(x)
  .orient("bottom").ticks(5);

var yAxis = d3.svg.axis().scale(y)
  .orient("left").ticks(5);

svg.selectAll("dot")
  .data(data)
    .enter().append("circle")
      .attr("r", function(d) { return d[2]; })
      .attr("cx", function(d) { return x(d[0]); })
      .attr("cy", function(d) { return y(d[1]); });

    // Add the X Axis
svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

    // Add the Y Axis
svg.append("g")
  .attr("class", "y axis")
  .call(yAxis);

console.log('theta:', theta(5, 3), 'r:', radius(0.5, theta(5, 3)), '[x,y]:', cartesian(radius(0.5, theta(5, 3)), theta(5, 3)))