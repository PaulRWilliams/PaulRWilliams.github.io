// * * * * * * * * * * * * * * * * * * * * * * * * * * * //
// Timeline Definitions
// Written by Kristi Potter
// 10/02/2021
// * * * * * * * * * * * * * * * * * * * * * * * * * * * //

 // Constant dimension variables for timeline
 const margin = {top: 12, right: 25, bottom: 5, left: 10},
       padding = {top: 10, right: 5, bottom: 0, left: 10};
 const startX = margin.left,
       startY = margin.top,
       startInX = startX + padding.left,
       startInY = startY + padding.top;

 // Dimension variables that depend on the window size >>> These change in timelineSizeChange
 var outerWidth, outerHeight, innerWidth, innerHeight,
     width, height;
 var endX, endY, endInX, endInY, aspect;

 // The x-axis scale. Domain is from the distinct dates, range is set in sizeChange()
 var xScale = d3.scaleTime()
                .domain([string2Date(distinctDates[0]), string2Date(distinctDates[distinctDates.length-1])]).nice();

 // The y-asix scale. Used to just position type timelines (no actual y-axis)
 var yScale = d3.scaleLinear();

 // The scale for timeline dot radii
 var radiusScale = d3.scaleLinear()
                     .range([5, 7.5])
                     .domain([Math.min(...Object.values(datesCount)), Math.max(...Object.values(datesCount))]);

// Helper to go from position to date
function pos2Date(pos) { return xScale.invert(pos); }

// Helpder to go from date to position
function date2Pos(date) {
  if(typeof(date) == "string")
    date = string2Date(date);
   return xScale(date); }

// The start and end of the timeline
var startOfTimeline = date2Pos(xScale.domain()[0]);
var endOfTimeline = date2Pos(xScale.domain()[1]);

function dragStartPoint(event, d){
 // Get the mouse position
 var mx = event.x;

 // Clamp the line position
 if ( mx < startInX )
   mx = startInX;
 if ( mx > endInX )
   mx = endInX;

 // Find the new start date
 startDate = pos2Date(mx);

  // Set the current start date that we are interested in
 currentDates[0] = startDate;

 // Set the startGuide position and color
 setStartGuide();

 // Check if the start point is part the end point
 let endPt = date2Pos(currentDates[1]);

 if(mx > endPt){
   currentDates[1] = mx;
   setEndGuide();
 }
}
function dragEndPoint(event, d){

 // Get the x mouse position
 var mx = event.x;

 // Clamp the line position
 if ( mx < startInX )
   mx = startInX;
 if ( mx > endInX )
   mx = endInX;

 // Find the new end date
 endDate = pos2Date(mx);

 // Set the current end date that we are interested in
 currentDates[1] = endDate;

 // Set the endGuide position
 setEndGuide();

 // Check if the end point is before the start point
 let stPt = date2Pos(currentDates[0]);

 if(mx < stPt){
   currentDates[0] = mx;
   setStartGuide();
 }
}

 // The timeline SVG
 var svg =  d3.select("#timeline")
              .append("svg")
              .attr("id", "svg-chart")
              .attr("width", "100%");

 // The div holding the svg chart
 var container = d3.select("#timeline");

 // The top-level group for the timeline
 var mainGroup = svg.append("g").attr("class", "mainGroup");
 // Create the timeline chart
 var timelineChart = mainGroup.append("g").attr("class", "timelineChart");
 // The xaxis for the timeline
 var axisGroup = mainGroup.append("g").attr("class", "xaxis");
 // Tooltip element
 var div3 = d3.select("body").append("div")
                             .attr("class", "tooltip")
                             .style("opacity", 0);
 // The xAxis and the domain (should not change once data is read in)
 var xAxis = d3.axisBottom()

 // Add a background to the timeline
 var backgroundRect = timelineChart.append("rect")
                                   .attr("class", "timelineRect")
                                   .attr("x", startOfTimeline)
                                   .attr("y", startInY);
 // The start guideline
 var startGuide = mainGroup.append("g")
                           .attr("class", "guideline")
                           .attr("id", "startGuide")
                           .attr("transform", "translate(0, 0)");
var startRect = startGuide.append("rect")
                         .attr("class", "rect-out")
                         .attr("x", date2Pos(xScale.domain()[0]))
                         .attr("y", startInY)
                         .attr("width", 0);
 var startLine = startGuide.append("line")
                           .attr("x1", 0)
                           .attr("y1", startInY)
                           .attr("x2", 0);
 var startTopKnob = startGuide.append("circle")
                              .attr("id", "startCircle")
                              .attr("r", 4)
                              .attr("cx", 0)
                              .attr("cy", startInY);
 var startLowKnob = startGuide.append("circle")
                              .attr("r", 4)
                              .attr("cx", 0);
 var startText = startGuide.append("text")
                           .attr("class", "axis-label")
                           .attr("x", 0)
                           .attr("y", startInY - 7.5);

 // The end guideline
 var endGuide = mainGroup.append("g")
                         .attr("class", "guideline")
                         .attr("id", "endGuide")
                         .attr("transform", "translate(0, 0)");
 var endRect = endGuide.append("rect")
                       .attr("class", "rect-out")
                       .attr("x", date2Pos(xScale.domain()[1]))
                       .attr("y", startInY)
                       .attr("width", 100);
 var endLine = endGuide.append("line")
                       .attr("x1", 0)
                       .attr("y1", startInY)
                       .attr("x2", 0);
 var endTopKnob = endGuide.append("circle")
                          .attr("id", "endCircle")
                          .attr("r", 4)
                          .attr("cx", 0)
                          .attr("cy", startInY);
 var endLowKnob = endGuide.append("circle")
                          .attr("r", 4)
                          .attr("cx", 0);
 var endText = endGuide.append("text")
                       .attr("class", "axis-label")
                       .attr("x", 0)
                       .attr("y", startInY - 7.5);

 // The timeline slider
 var slider = mainGroup.append("g")
                       .attr("class", "slider")
                       .attr("transform", "translate(0, 30)");
 var timelineRect = slider.append("rect")
                          .attr("class", "timelineSliderRect")
                          .attr("x", startOfTimeline)
                          .attr("height", 30);
 var gradStart = svg.append("defs")
                    .append("linearGradient")
                    .attr("id", "gradStart")
                    .attr("x1", "0%")
                    .attr("x2", "100%")
                    .attr("y1", "0%")
                    .attr("y2", "0%");
 gradStart.append("stop")
          .attr("offset", "50%")
          .style("stop-color", "silver")
          .attr("stop-opacity", 1);
 gradStart.append("stop")
          .attr("offset", "50%")
          .style("stop-color", "white")
          .attr("stop-opacity", 0);
 var gradEnd = svg.append("defs")
                  .append("linearGradient")
                  .attr("id", "gradEnd")
                  .attr("x1", "100%")
                  .attr("x2", "0%")
                  .attr("y1", "0%")
                  .attr("y2", "0%");
 gradEnd.append("stop")
        .attr("offset", "50%")
        .style("stop-color", "silver")
        .attr("stop-opacity", 1);
 gradEnd.append("stop")
        .attr("offset", "50%")
        .style("stop-color", "white")
        .attr("stop-opacity", 0);
 var startCircle = slider.append("circle")
                         .attr("transform", "translate(0, 15)")
                         .attr("r", 16)
                         .style("stroke","none")
                         .style("fill","url(#gradStart)");
 var endCircle = slider.append("circle")
                       .attr("transform", "translate(0, 15)")
                       .attr("r", 16)
                       .style("stroke","none")
                       .style("fill","url(#gradEnd)");
 // The drag behaviors
 var startGuideDrag = d3.drag().on("start", function(){startLine.attr("stroke", "DarkSlateGray");})
                               .on("end", function(){ startLine.attr("stroke", "silver"); updateMapMarkers();});
 startGuide.call(startGuideDrag);
 startCircle.call(startGuideDrag);
 startGuideDrag.on("drag",  dragStartPoint);
 var endGuideDrag = d3.drag().on("start", function(){ endLine.attr("stroke", "DarkSlateGray"); })
                             .on("end", function(){ endLine.attr("stroke", "silver"); updateMapMarkers(); });
 endGuide.call(endGuideDrag);
 endCircle.call(endGuideDrag);
 endGuideDrag.on("drag", dragEndPoint);

 // Create the All timeline
 var allPos = yScale(0) + 45;
 var allColor = d3.rgb(125, 125, 125);

 // The timeline with frequency of dates
 var allTimeline = timelineChart.append("g").attr("class", "all-timeline");
 var allRect = allTimeline.append("rect")
                          .attr("height", .5)
                          .attr("width", innerWidth)
                          .attr("x", startInX)
                          .attr("y", allPos)
                          .attr("fill", allColor);
 var allText = allTimeline.append("text")
                          .text("All")
                          .attr("class", "timeline-text")
                          .attr("y", allPos + 5)
                          .style("text-anchor", "right");
 // Create a group for each timeline
 var singleLine = timelineChart.append("g").attr("class", "single-timelines");
 var singleLegend = timelineChart.append("g").attr("class", "single-legend");


// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
// Update the Timeline
// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
function updateTimelineData(){


  var yInc = (yScale.range()[0]-yScale.range()[1])/(attributeTypes[currentAttribute].length+1);
  let rInc = 20;
  let startY = yScale.range()[0]-yInc;
  let duration = 2500;

  // Add the ALL timeline
  allTimeline.append("rect")
             .attr("width", innerWidth)
             .attr("y", allPos)
  allRect.attr("width", innerWidth)
         .attr("y", allPos);
  allText.attr("x", endInX + 25)
         .attr("y", allPos + 5);

  // Add circles to the all timeline
  allTimeline.selectAll("circle")
      .data(Object.entries(datesCount))
      .join(
         enter => enter.append('circle')
                       .attr("cx", function(d){
                         return date2Pos(d[0]);})
                       .attr("cy", allPos),
         update => update.attr("cx", function(d){return date2Pos(d[0]);})
                         .attr("cy", allPos),
         exit => exit.remove()
      )
      .attr("class", "timeline-dots")
      .attr("r", (d)=>(radiusScale(d[1])))
      .attr("fill", allColor)
      .attr("stroke", "snow")
      .on("mouseover", function(d){

        // Get the target data
        let target = d.target.__data__;

        // Set the location of the tooltip
        let mouseX = d.clientX;
        let mouseY = d.pageY-42;

        // Change the outline
        d3.select(this)
          .attr("stroke", "MediumSpringGreen ")
          .classed("active", true );
        div3.transition()
            .duration(200)
            .style("opacity", .95);
        div3.html("Date" + ": " + target[0] + "<br>" +"# of Works" + ": " + target[1])
            .style("left", mouseX+"px")
            .style("top",  mouseY+"px");
      })
      .on("mouseout", function(d){
        d3.select(this)
          .attr("stroke", "snow")
          .classed("active", false);
        div3.transition()
            .duration(500)
            .style("opacity", 0);
      });

  // Add the individual timeline lines
  singleLine.selectAll("rect")
            .data(Object.entries(datesByAttribute[currentAttribute]))
            .join(
              enter => enter.append("rect")
                            .transition().duration(duration)
                            .attr("x", startInX)
                            .attr("y", function(t, i){return startY - yInc*i;})
                            .attr("width", innerWidth)
                            .selection(),
              update => update
                              .transition().duration(duration)
                              .attr("width", innerWidth)
                              .attr("y", function(t, i){return startY - yInc*i;})
                              .selection()
                              .attr("x", startInX),
              exit => exit.remove()
            )
            .attr("id", (t)=>("timeline-line-"+changeToDomId(t[1]['label'])))
            .attr("height", 2)
            .attr("fill", function(t){ return t[1]["color"]; })
            .attr("opacity", 1);

  // Add the legend rects
  singleLegend.selectAll("rect")
              .data(Object.values(datesByAttribute[currentAttribute]))
              .join(
                enter => enter.append("rect")
                              .transition().duration(duration)
                              .attr("y", function(t, i){return (startY-rInc*.5) - yInc*i;})
                              .selection(),
                update => update.transition().duration(duration)
                                .attr("y", function(t, i){return (startY-rInc*.5)- yInc*i;})
                                .selection(),
                exit => exit.remove()
              )
              .attr("id", function(t){return ("legend-rect-"+changeToDomId(t['label']))})
              .attr("x", endInX+5)
              .attr("height",rInc)
              .attr("width", rInc)
              .attr("stroke", (t)=>(t["color"]))
              .attr("fill", (t)=>(t["color"]))
              .on("click", target => {

                // Get the domID
                let t = target.target.__data__;
                let domID = changeToDomId(t['label']);

                // Turn on or off the clicked on type
                const idx = currentTypes.indexOf(t['label']);
                if(idx > -1)
                  currentTypes.splice(idx, 1);
                else
                  currentTypes.push(t['label']);

                if (t['display']){
                  // Mute
                  d3.select("#legend-rect-"+domID).attr("fill", "snow");// Legend Rect
                  d3.select("#legend-text-"+domID).attr("fill", "Silver"); // Legend Text
                  d3.select("#timeline-line-"+domID).attr("opacity", 0.15); // Timeline
                  d3.selectAll("#timeline-circles-"+domID).attr("opacity", 0.15); // Timeline Circles
                }
                else{
                  // Unmute
                  d3.select("#legend-rect-"+domID).attr("fill", t['color']); // Legend rect
                  d3.select("#legend-text-"+domID).attr("fill", "black");// Legend Text
                  d3.select("#timeline-line-"+domID).attr("opacity", 1.0); // Timeline
                  d3.selectAll("#timeline-circles-"+domID).attr("opacity", 1.0); // Timeline Circles
                }
                t['display'] = !t['display'];
                updateMapMarkers();
              });

  // Add the legend text
  singleLegend.selectAll("text")
    .data(Object.values(datesByAttribute[currentAttribute]))
    .join(
      enter => enter.append("text")
                    .attr("x", endInX + 10 + rInc)
                    .text(t=>(t['label']))
                    .transition().duration(duration)
                    .attr("y", function(t, i){return (startY+5) - yInc*i;})
                    .selection(),
      update => update.transition().duration(duration)
                      .attr("y", function(t, i){return (startY+5) - yInc*i;})
                      .selection()
                      .attr("x", endInX + 10 + rInc)
                      .text(t=>(t['label'])),
      exit => exit.remove()
    )
    .attr("id", (t)=>("legend-text-"+changeToDomId(t['label'])))
    .attr("class", "timeline-text")
    .style("text-anchor", "right")
    .on("click", function(target){

       // Get the domID
      let t = target.target.__data__;
      let domID = changeToDomId(t['label']);

      // Turn on or off the clicked on type
      const idx = currentTypes.indexOf(t['label']);
      if(idx > -1)
        currentTypes.splice(idx, 1);
      else
        currentTypes.push(t['label']);

      if (t['display']){
        // Mute
        d3.select("#legend-rect-"+domID).attr("fill", "snow");// Legend Rect
        d3.select("#legend-text-"+domID).attr("fill", "Silver"); // Legend Text
        d3.selectAll("#timeline-line-"+domID).attr("opacity", 0.15); // Timeline
        d3.selectAll("#timeline-circles-"+domID).attr("opacity", 0.15); // Timeline Circles
      }
      else{
        // Unmute
        d3.select("#legend-rect-"+domID).attr("fill", t['color']); // Legend rect
        d3.select("#legend-text-"+domID).attr("fill", "black");// Legend Text
        d3.selectAll("#timeline-line-"+domID).attr("opacity", 1.0); // Timeline
        d3.selectAll("#timeline-circles-"+domID).attr("opacity", 1.0); // Timeline Circles
      }
      t['display'] = !t['display'];
      updateMapMarkers();
    });

  singleLine.selectAll("g")
    .data(Object.entries(datesByAttribute[currentAttribute]))
    .join(
      enter=>{ return enter.append("g") },
      update=>{ return update },
      exit=>{ return exit.remove() }
    )
    .selectAll('circle')
    .data((d)=>(Object.entries(d[1]['data'])))
    .join(
      enter => enter.append("circle")
                    .transition().duration(duration)
                    .attr("r", (d)=>(radiusScale(d[1]['count'])))
                    .attr("cx",(d)=>(date2Pos(d[0])))
                    .attr("cy", (d)=>(startY - yInc*d[1]['idx']))
                    .selection(),
      update => update.transition().duration(duration)
                      .attr("r", (d)=>(radiusScale(d[1]['count'])))
                      .attr("cx",(d)=>(date2Pos(d[0])))
                      .attr("cy",(d)=>(startY - yInc*d[1]['idx']))
                      .selection(),
      exit =>  exit.remove()
  )
  .attr("id",(d)=>("timeline-circles-"+changeToDomId(d[1]['type'])))
  .attr("fill", (d)=>(d[1]['color']))
  .on("mouseover", function(d){
       // Get the target data
       let target = d.target.__data__;

       // Set the location of the tooltip
       let mouseX = d.clientX;
       let mouseY = d.pageY-42;

       // Change the outline
       d3.select(this)
           .attr("stroke", "MediumSpringGreen ")
           .classed("active", true );
       div3.transition()
           .duration(200)
           .style("opacity", .95);
       div3.html("<b>Type:</b> "+ target[1]['type']+"<br> <b>Date:</b> " + target[0] + "<br> <b># of Works:</b> " + target[1]['count'])
           .style("left", mouseX+"px")
           .style("top",  mouseY+"px");
       })
  .on("mouseout", function(d){
           d3.select(this)
             .attr("stroke", "snow")
             .classed("active", false);
           div3.transition()
                     .duration(500)
                     .style("opacity", 0);
         });

}

// Change the size of the timeline based on the window size
function timelineSizeChange(){

  var wide = parseInt(container.style("width")),
      high = parseInt(container.style("height"));
  var scale = wide/outerWidth;

  // Math out the dimensions of the plot
  outerWidth = parseInt(container.style("width"));
  outerHeight = parseInt(container.style("height"));
  width = outerWidth - margin.left - margin.right;
  height = outerHeight - margin.top - margin.bottom;
  innerWidth = width - padding.left - padding.right;
  innerHeight = height - padding.top - padding.bottom;
  endX = startX + width;
  endY = startY + height;
  endInX = startInX + innerWidth;
  endInY = startInY + innerHeight;
  aspect = outerWidth/outerHeight;

  console.log("ow", outerHeight);
  console.log("container", container.style("height"));

  // The range for the XY scales
  xScale.range([startInX, endInX]);
  yScale.range([endInY, startInY]);

  // Update the all line position
  allPos = yScale(0) + 45;

  // Update the x axis
  xAxis.scale(xScale);

  // Update the start and end of the timeline
  startOfTimeline = date2Pos(xScale.domain()[0]);
  endOfTimeline = date2Pos(xScale.domain()[1]);

  // Set the position of the start and end timeline
  setStartGuide();
  setEndGuide();

  // Update the DOM elements that change with a size change
  d3.select(".mainGroup").attr("transform", "scale(" + scale + ")");
  d3.select("#svg-chart").style("height", wide*(1.0/aspect));

  // Position the x axis
  axisGroup.attr("transform", "translate(0," + endInY +")");

  // Attach the xAxis
  axisGroup.call(xAxis);

  // Update the width and height of the background rect
  backgroundRect.attr("x", startOfTimeline)
                .attr("width", endOfTimeline-startOfTimeline)
                .attr("height", endInY-startInY);

  // Update the start guideline
  startLine.attr("y2", endInY);
  startLowKnob.attr("cy", endInY);
  startRect.attr("x", date2Pos(xScale.domain()[0]))
           .attr("height", endInY-startInY);

  // Update the end guideline
  endLine.attr("y2", endInY);
  endLowKnob.attr("cy", endInY);
  endRect.attr("x", date2Pos(xScale.domain()[1]))
         .attr("height", endInY-startInY);

  // Update the timeline slider
  timelineRect.attr("x", startOfTimeline)
              .attr("y", endInY)
              .attr("width", endOfTimeline-startOfTimeline);
  startCircle.attr("cy", endInY);
  endCircle.attr("cy", endInY);

  updateTimelineData();
}
