function spiral(type, numberOfPoints, period) { 
  var type = type || "points";
  var numberOfPoints = numberOfPoints || 1000;
  var period = period || 100; 

  var margin = {top: 20, right: 20, bottom: 20, left: 40};
  var width = 750 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom; 

  var x = d3.scale.linear().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);
  y.domain([-height, height]);
  x.domain([-width, width]);

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

  function cartesian(radius, angle, size, startAngle, endAngle) {
    var size = size || 1;
    var xPos = x(radius * Math.cos(angle));
    var yPos = y(radius * Math.sin(angle));
    return [xPos, yPos, size, radius, angle, startAngle, endAngle];
  }

  var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

  var data = [];
  var data2 = [];
  for (var i=period; i<numberOfPoints + 1; i++) {
    var angle = theta(i, period);
    var rad = radius(8, angle);
    var size = 1 + Math.random()*1.5;
    if (i % 10 === 0) {
      size = 5.5 + Math.random()*3;
    }
    data.push(cartesian(rad, angle, size, startAngle(i, period), endAngle(i, period)))
    data2.push([i, size*period, 2])
  }

  if (type === "points") {
    svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
    svg.selectAll("g").selectAll("dot")
      .data(data)
        .enter().append("circle")
          .attr("r", function(d) { return d[2]; })
          .attr("cx", function(d) { return d[0]; })
          .attr("cy", function(d) { return d[1]; });
  } else if (type === "arcs") {
    svg.append("g")
      .attr("transform", "translate(" + (width * 0.5 + margin.left) + "," + (height * 0.5 + margin.top) + ")");

    svg.selectAll("g").selectAll("path")
      .data(data)
        .enter().append("path")
        .attr("d", d3.svg.arc()
        .outerRadius(function(d){return y(d[3]+10)})
        .innerRadius(function(d){return y(d[3]-10)})
        .startAngle(function(d) { return d[5] > 0 ? d[5] : 0; })
        .endAngle(function(d) { return d[6]; }))
        .attr("opacity", function(d){return d[2]/5})
  } else if (type === "paths") {
    
    var line = d3.svg.line()
        .interpolate("basis");

    svg.append("g")
      .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")");

    svg.selectAll("g").selectAll("path")
        .data(quad(sample(line(data), numberOfPoints, period))) // ***** Need to figure out the proper precision to map data crrectly
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
      console.log('total length', n)
      while (lastSample + dt < n) {
        dt = Math.ceil(i/periodicity)*2;
        t.push(lastSample + dt);
        console.log('dt', dt, 'lastSample + dt*i', lastSample + dt)
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
  } else if (type === "custom-path") {
    // TO-DO: 
    /*
      1. Adjust Inner/Outer control points on quadratic bezier to give proper arcs
        a. Needs to be dynamic depending on length of arc, not a single static value
    */

    var pathWidth = 15;
    
    var customData = []
    for (var i = 0; i < numberOfPoints; i++) {
      var val = i*10 % period === 0 ? Math.random()*10 + 7 : Math.random()*5;
      customData.push([val]);
    }

    customData.forEach(function(datum, t, dataSet){
      var start = startAngle(t, period);
      var end = endAngle(t, period);

      var startInnerRadius = radius(8, start) - pathWidth*0.5;
      var startOuterRadius = radius(8, start) + pathWidth*0.5;
      var endInnerRadius = radius(8, end) - pathWidth*0.5;
      var endOuterRadius = radius(8, end) + pathWidth*0.5;
      
      var ctrlInnerRad = 1; // Use to adjust arc inner radius
      var ctrlOuterRad = 1; // Use to adjust arc outer radius
      var innerControlPoint = cartesian(radius(8, theta(t, period)) - pathWidth*0.5 + ctrlInnerRad, theta(t, period));
      var outerControlPoint = cartesian(radius(8, theta(t, period)) + pathWidth*0.5 + ctrlOuterRad, theta(t, period));

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
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.selectAll("g").selectAll("path")
      .data(customData)
      .enter().append("path")
        .style("fill", function(d) { return "black"; })
        .style("opacity", function(d) {return d[0]/10})
        .attr("d", function(d) { return d[1]});

  } else if (type === "non-spiral") {
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
      .attr("fill", "none")
      .attr("stroke-width", "1")
      .attr("stroke", "steelblue")
      .attr("transform", "translate("+margin.left+",0)")
  }
}

spiral('points');
spiral('custom-path');
//spiral('paths');
spiral('arcs');
spiral('non-spiral');