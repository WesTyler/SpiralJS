function Spiral(graphType) { 
  this.graphType = graphType || "points";
  this.numberOfPoints = null,
  this.period = null, 
  this.margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  this.svgHeight = 0,
  this.svgWidth = 0,
  this.spacing = 1,
  this.targetElement = "body",
  this.width = this.svgWidth - this.margin.left - this.margin.right,
  this.height = this.svgHeight - this.margin.top - this.margin.bottom,
  this.data = [],
  this.x = d3.scale.linear().range([0, 730]).domain([-740, 740]),
  this.y = d3.scale.linear().range([480, 0]).domain([-490, 490]),
  this.cartesian = function(radius, angle, size, startAngle, endAngle) {
    var size = size || 1;
    var xPos = this.x(radius * Math.cos(angle));
    var yPos = this.y(radius * Math.sin(angle));
    return [xPos, yPos, size, radius, angle, startAngle, endAngle];
  },
  this.render = function() {
    // this.y.domain([-this.height-this.margin.bottom, this.height+this.margin.top]);
    // this.x.domain([-this.width-this.margin.left, this.width+this.margin.right]);

    var svg = d3.select(this.targetElement)
      .append("svg")
      .attr("width", this.svgWidth)
      .attr("height", this.svgHeight)

    if (this.graphType === "points") {
      svg.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        
      svg.selectAll("g").selectAll("dot")
        .data(this.data)
          .enter().append("circle")
            .attr("r", function(d) { return d[2]; })
            .attr("cx", function(d) { return d[0]; })
            .attr("cy", function(d) { return d[1]; });
    } else if (this.graphType === "arcs") {
      svg.append("g")
        .attr("transform", "translate(" + (this.width * 0.5 + this.margin.left) + "," + (this.height * 0.5 + this.margin.top) + ")");

      svg.selectAll("g").selectAll("path")
        .data(this.data)
          .enter().append("path")
          .attr("d", d3.svg.arc()
          .outerRadius(function(d){return y(d[3]+10)})
          .innerRadius(function(d){return y(d[3]-10)})
          .startAngle(function(d) { return d[5] > 0 ? d[5] : 0; })
          .endAngle(function(d) { return d[6]; }))
          .attr("opacity", function(d){return d[2]/5})
    } else if (this.graphType === "paths") {
      
      var line = d3.svg.line()
          .interpolate("basis");

      svg.append("g")
        .attr("transform", "translate(" + (this.margin.left) + "," + (this.margin.top) + ")");

      svg.selectAll("g").selectAll("path")
          .data(quad(sample(line(this.data), this.numberOfPoints, this.period))) // ***** Need to figure out the proper precision to map data crrectly
        .enter().append("path")
          .style("fill", function(d) { return "black"; })
          .style("stroke", function(d) { return "black"; })
          .style("opacity", function(d) {return d.data/6})
          .attr("d", function(d) { return lineJoin(d[0], d[1], d[2], d[3], 10); });

      // Sample the SVG path string "d" uniformly with the specified precision.
      function sample(d, numberDataPoints, periodicity) {
        var path = document.createElementNS(d3.ns.prefix.svg, "path");
        path.setAttribute("d", d);

        var n = path.getTotalLength();
        var t = [0];
        var i = 1;
        var dt = Math.ceil(i/periodicity)*2;
        var lastSample = 0;
        while (lastSample + dt < n) {
          dt = Math.ceil(i/periodicity)*2;
          t.push(lastSample + dt);
          lastSample = lastSample + dt;
          i++;
        }
        t.push(n);

        return t.map(function(t, index) {
          var p = path.getPointAtLength(t);
          var a = data[index] ? [p.x, p.y, data[index][2]] : [p.x, p.y, 0];
          return a;
        });
      }

      // Compute quads of adjacent points [p0, p1, p2, p3].
      function quad(points) {
        return d3.range(points.length - 1).map(function(i) {
          var a = [points[i - 1], points[i], points[i + 1], points[i + 2]];
          a.data = points[i][2];
          return a;
        });
      }

      // Compute stroke outline for segment p12.
      function lineJoin(p0, p1, p2, p3, width) {
        var u12 = perp(p1, p2),
            r = width / 2,
            a = [p1[0] + u12[0] * r, p1[1] + u12[1] * r],
            b = [p2[0] + u12[0] * r, p2[1] + u12[1] * r],
            c = [p2[0] - u12[0] * r, p2[1] - u12[1] * r],
            d = [p1[0] - u12[0] * r, p1[1] - u12[1] * r];

        if (p0) { // clip ad and dc using average of u01 and u12
          var u01 = perp(p0, p1), e = [p1[0] + u01[0] + u12[0], p1[1] + u01[1] + u12[1]];
          a = lineIntersect(p1, e, a, b);
          d = lineIntersect(p1, e, d, c);
        }

        if (p3) { // clip ab and dc using average of u12 and u23
          var u23 = perp(p2, p3), e = [p2[0] + u23[0] + u12[0], p2[1] + u23[1] + u12[1]];
          b = lineIntersect(p2, e, a, b);
          c = lineIntersect(p2, e, d, c);
        }

        return "M" + a + "L" + b + " " + c + " " + d + "Z";
      }

      // Compute intersection of two infinite lines ab and cd.
      function lineIntersect(a, b, c, d) {
        var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3;
        var y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3;
        var ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
        return [x1 + ua * x21, y1 + ua * y21];
      }

      // Compute unit vector perpendicular to p01.
      function perp(p0, p1) {
        var u01x = p0[1] - p1[1];
        var u01y = p1[0] - p0[0];
        var u01d = Math.sqrt(u01x * u01x + u01y * u01y);
        return [u01x / u01d, u01y / u01d];
      }
    } else if (this.graphType === "custom-path") {
      var pathWidth = 50;
      
      customData.forEach(function(datum, t, dataSet){
        var start = startAngle(t, this.period);
        var end = endAngle(t, this.period);

        var startInnerRadius = radius(this.spacing, start) - pathWidth*0.5;
        var startOuterRadius = radius(this.spacing, start) + pathWidth*0.5;
        var endInnerRadius = radius(this.spacing, end) - pathWidth*0.5;
        var endOuterRadius = radius(this.spacing, end) + pathWidth*0.5;
        
        var ctrlInnerRad = 0.01; // Use to adjust arc inner radius
        var ctrlOuterRad = 0.01; // Use to adjust arc outer radius
        var innerControlPoint = cartesian(radius(this.spacing, theta(t, this.period)) - pathWidth*0.5 + ctrlInnerRad, theta(t, this.period));
        var outerControlPoint = cartesian(radius(this.spacing, theta(t, this.period)) + pathWidth*0.5 + ctrlOuterRad, theta(t, this.period));

        var startPoint = cartesian(startInnerRadius, start); // Bottom right of arc
        var point2 = cartesian(startOuterRadius, start); // Top right of arc
        var point3 = cartesian(endOuterRadius, end); // Top left of arc
        var point4 = cartesian(endInnerRadius, end); // Bottom left of arc
        var arcPath = "M" + startPoint[0] + " " + startPoint[1] + "L" + point2[0] + " " + point2[1];
        arcPath += "Q" + outerControlPoint[0] + " " + outerControlPoint[1] + " " + point3[0] + " " + point3[1];
        arcPath += "L" + point4[0] + " " + point4[1];
        arcPath += "Q" + innerControlPoint[0] + " " + innerControlPoint[1] + " " + startPoint[0] + " " + startPoint[1] + "Z";
        datum[1] = arcPath
      });

      svg.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
      svg.selectAll("g").selectAll("path")
        .data(customData.slice(100))
        .enter().append("path")
          .style("fill", function(d) { return "black"; })
          .style("opacity", function(d) {return d[0]/9})
          .attr("d", function(d) { return d[1]});
    } else if (this.graphType === "non-spiral") {
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

      // Add the X Axis
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+this.margin.left+"," + this.height + ")")
        .call(xAxis)
        .append("text")
          .attr("x", this.width)
          .attr("y", -3)
          .attr("dy", "-.35em")
          .style("text-anchor", "middle")
          .text("time");

      // Add the Y Axis
      svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate("+this.margin.left+",0)")
        .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Signal (a.u.)");

      svg.append("path")
        .datum(data2)
        .attr("class", "line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke-width", "1")
        .attr("stroke", "steelblue")
        .attr("transform", "translate("+this.margin.left+",0)")
    }
  },
  this.randomData = function() {
    for (var i=0; i<this.numberOfPoints; i++){
      var angle = theta(i, this.period);
      var rad = radius(this.spacing, angle);
      var size = 1 + Math.random()*1.5;
      if (i % 10 === 0) {
        size = 5.5 + Math.random()*3;
      }
      this.data.push(this.cartesian(rad, angle, size, startAngle(i, this.period), endAngle(i, this.period)));
    }
  }
}


// For time point #t, calculate the angle to the center of the arc
// period is the number of time points per revolution (2 PI)
function theta(t, period) {
  return 2 * Math.PI / (period) * t;
}

function startAngle(t, period){
  return (theta(t-1, period) + theta(t, period))/2;
}

function endAngle(t, period){
  return (theta(t+1, period) + theta(t, period))/2;
}

function radius(spacing, angle) {
  return spacing * angle;
}

var spiral1 = new Spiral('points');
spiral1.numberOfPoints = 1000;
spiral1.period = 100;
spiral1.margin = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10
};
spiral1.svgHeight = 500;
spiral1.svgWidth = 750;
spiral1.spacing = 8;
spiral1.randomData();
spiral1.render();

var spiral2 = new Spiral('non-spiral')
console.log('spiral1', spiral1.data)
console.log('spiral2', spiral2.data)
// spiral('points');
// spiral('custom-path');
//spiral('paths');
//spiral('arcs');
// spiral('non-spiral');