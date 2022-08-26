// * * * * * * * * * * * * * * * * * * * * * * * * * * * //
// Timeline Definitions
// Written by Kristi Potter
// 10/02/2021
// * * * * * * * * * * * * * * * * * * * * * * * * * * * //

// --- Constant dimension variables for timeline
const margin = {top: 10, right: 10, bottom: 5, left: 10},
      padding = {top: 10, right: 10, bottom: 5, left: 10};

// The start
const startX = margin.left,
      startY = margin.top,
      innerStartX = startX + padding.left,
      innerStartY = startY + padding.top;

// The width of the legend (how far to move in the timeline)
const legendWidth = 175;

// Height of the single timeline
const singleHeight = 50;

// The aspect ratio of the timeline
const aspectRatio = 2.7;

// --- Calculated dimension variables that depend on the window size
// >>> These are set in timelineSizeChange
var outerWidth, outerHeight, innerWidth, innerHeight, width, height;
var endX, endY, endInX, endInY, aspect;

// --- Scales
// The x-axis scale. Domain is from the distinct dates, range is set in sizeChange()
var xScale = d3.scaleTime().domain([string2Date(distinctDates[0]), string2Date(distinctDates[distinctDates.length-1])]).nice();

// The y-asix scale. Used to just position type timelines (no actual y-axis)
var yScale = d3.scaleLinear();

// The scale for timeline dot radii
var radiusScale = d3.scaleLinear().range([5, 7.5])
                  .domain([Math.min(...Object.values(datesCount)), Math.max(...Object.values(datesCount))]);

// Helper to go from position to date
function pos2Date(pos) { return xScale.invert(pos); }

// Helpder to go from date to position
function date2Pos(date) {
  if(typeof(date) == "string")
    date = string2Date(date);
  return xScale(date);
}

// The start and end of the timeline based on the xScale
var startOfTimeline = date2Pos(xScale.domain()[0]);
var endOfTimeline = date2Pos(xScale.domain()[1])-legendWidth;

// The xAxis and the domain (should not change once data is read in)
var xAxis = d3.axisBottom()

// --- Create the SVG

// The div holding the svg chart
var container = d3.select("#timeline");

// The timeline SVG
var svg =  d3.select("#timeline")
            .append("svg")
            .attr("id", "timeline-svg")
            .attr("width", "100%")
            .style("background-color", "White");

// The top-level group for the timeline
var outerGroup = svg.append("g").attr("class", "outerGroup");
var testRect = outerGroup.append("rect").attr("class", "rect");

// Create the timeline chart
var timelineChartGroup = outerGroup.append("g").attr("class", "timelineChartGroup");
// Add a background to the timeline
var timelineRect = timelineChartGroup.append("rect").attr("class", "timelineRect");

// The xaxis for the timeline
var axisGroup = outerGroup.append("g").attr("class", "axisGroup");

// Tooltip element
var div3 = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

// The start guideline
var startGuide = outerGroup.append("g")
                          .attr("class", "guideline")
                          .attr("id", "startGuide")
                          .attr("transform", "translate(0, 0)");
var startRect = startGuide.append("rect")
                        .attr("class", "rect-out")
                        .attr("x", date2Pos(xScale.domain()[0]))
                        .attr("width", 0);
var startLine = startGuide.append("line")
                          .attr("x1", 0)
                          .attr("x2", 0);
var startTopKnob = startGuide.append("circle")
                             .attr("id", "startCircle")
                             .attr("r", 4)
                             .attr("cx", 0);
var startLowKnob = startGuide.append("circle")
                             .attr("r", 4)
                             .attr("cx", 0);
var startText = startGuide.append("text")
                          .attr("class", "axis-label")
                          .attr("x", 0);
// The end guideline
var endGuide = outerGroup.append("g")
                         .attr("class", "guideline")
                         .attr("id", "endGuide")
                         .attr("transform", "translate(0, 0)");
var endRect = endGuide.append("rect")
                      .attr("class", "rect-out")
                      .attr("width", 100);
var endLine = endGuide.append("line")
                      .attr("x1", 0)
                      .attr("x2", 0);
var endTopKnob = endGuide.append("circle")
                         .attr("id", "endCircle")
                         .attr("r", 4)
                         .attr("cx", 0);
var endLowKnob = endGuide.append("circle")
                         .attr("r", 4)
                         .attr("cx", 0);
var endText = endGuide.append("text")
                      .attr("class", "axis-label")
                      .attr("x", 0);

// The timeline with frequency of dates
var allColor = d3.rgb(125, 125, 125);
var allTimelineGroup = outerGroup.append("g").attr("class", "allTimelineGroup");
var allTimelineRect = allTimelineGroup.append("rect")
                                      .attr("height", .5)
                                      .attr("class", "allTimelineRect")
                                      .attr("fill", allColor);
var allText = allTimelineGroup.append("text")
                              .text("All")
                              .attr("class", "timeline-text")
                              .style("text-anchor", "right");
// The timeline slider
var slider = outerGroup.append("g").attr("class", "slider").attr("transform", "translate(0, 30)");

var sliderRect = slider.append("rect").attr("class", "timelineSliderRect")

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
                     .style("fill","url(#gradEnd)");// The group for the single timeline

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

// Create a group for each timeline
var singleLine = timelineChartGroup.append("g").attr("class", "single-timelines");
var singleLegend = timelineChartGroup.append("g").attr("class", "single-legend");

// Change the size of the timeline based on the window size
function updateTimeline(){

  // Get the width of the containing Div
  outerWidth = parseInt(container.style("width"));

  // Set the height of the containing DIV based on the aspectRatio
  container.style("height", outerWidth/aspectRatio+"px");
  outerHeight = parseInt(container.style("height"));

  // The dims of the very outside of the timeline area
  width = outerWidth - margin.left - margin.right; // The width of the SVG
  height = outerHeight - margin.top - margin.bottom;

  // The dims of where the timeline area should start and end
  innerWidth = width - padding.left - padding.right;
  innerHeight = height - padding.top - padding.bottom;
  timelineWidth = innerWidth-legendWidth;
  timelineHeight = innerHeight-singleHeight;

  // Update the ranges for the X and Y scales
  xScale.range([innerStartX, timelineWidth]);
  yScale.range([timelineHeight, innerStartY]);

  // Update the start and end of the timeline
  startOfTimelineX = date2Pos(xScale.domain()[0]);
  endOfTimelineX = date2Pos(xScale.domain()[1])-startOfTimelineX;
  startOfTimelineY = yScale.range()[1];
  endOfTimelineY = yScale.range()[0];

  // Update the y location of the all timeline
  allTimelineY = endOfTimelineY;
  allTimelineHeight = .5;

  // Update the height of the timeline svg
  svg.attr("height", outerHeight);

  // Update the height of the outerGroup
  outerGroup.attr("x", 0)
            .attr("y", 0)

  // Update the width and height of the background rect
  timelineRect.attr("x", startOfTimelineX)
              .attr("y", startOfTimelineY)
              .attr("width", endOfTimelineX)
              .attr("height", endOfTimelineY-startOfTimelineY);

  // Update the x axis
  xAxis.scale(xScale);

  // Position the x axis
  axisGroup.attr("transform", "translate(0," + endOfTimelineY +")");

  // Attach the xAxis
  axisGroup.call(xAxis);

  // Update the slider
  sliderRect.attr("x", startOfTimelineX)
            .attr("y", allTimelineY )
            .attr("width", endOfTimelineX)
            .attr("height", 30);
  startCircle.attr("cy",  allTimelineY);
  endCircle.attr("cy",  allTimelineY);

  // Update the all timeline
  allTimelineGroup.attr("x", startOfTimelineX)
                  .attr("y", allTimelineY+45 )
                  .attr("width", endOfTimelineX)
                  .attr("height", allTimelineHeight);

  allTimelineRect.attr("x", startOfTimelineX)
                 .attr("y", allTimelineY+45)
                 .attr("width", endOfTimelineX)
                 .attr("height", allTimelineHeight);
   allText.attr("x", endOfTimelineX + 45)
          .attr("y", allTimelineY+50);

   // Add circles to the all timeline
  allTimelineGroup.selectAll("circle")
      .data(Object.entries(datesCount))
      .join(
         enter => enter.append('circle')
                       .attr("cx", function(d){
                         return date2Pos(d[0]);})
                       .attr("cy", allTimelineY+45),
         update => update.attr("cx", function(d){return date2Pos(d[0]);})
                         .attr("cy", allTimelineY+45),
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

  // Update the guides
  startRect.attr("y", startOfTimelineY);
  startLine.attr("y1", startOfTimelineY);
  startLine.attr("y2", endOfTimelineY);
  startTopKnob.attr("cy", startOfTimelineY);

  startLowKnob.attr("cy", endOfTimelineY);
  startText.attr("y", startOfTimelineY - 7.5);

  endRect.attr("x", date2Pos(xScale.domain()[1]))
         .attr("y", startOfTimelineY);
  endLine.attr("y1", startOfTimelineY);
  endLine.attr("y2", endOfTimelineY);
  endTopKnob.attr("cy", startOfTimelineY);
  endLowKnob.attr("cy", endOfTimelineY);
  endText.attr("y", startOfTimelineY - 7.5);

  // Set the position of the start and end timeline
  setStartGuide();
  setEndGuide();

  // Add the individual timeline lines
  var yInc = (yScale.range()[0]-yScale.range()[1])/(attributeTypes[currentAttribute].length+1);
  let rInc = yInc*.85;
  let startY = yScale.range()[0]-yInc;
  let duration = 750;
  
  singleLine.selectAll("rect")
            .data(Object.entries(datesByAttribute[currentAttribute]))
            .join(
              enter => enter.append("rect")
                            .transition().duration(duration)
                            .attr("x", startOfTimelineX )
                            .attr("y", function(t, i){return startY - yInc*i;})
                            .attr("width", timelineWidth-startOfTimelineX)
                            .selection(),
              update => update
                              .transition().duration(duration)
                              .attr("width", timelineWidth-startOfTimelineX)
                              .attr("y", function(t, i){return startY - yInc*i;})
                              .selection()
                              .attr("x", startOfTimelineX ),
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
              .attr("x", endOfTimelineX+25)
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
                    .attr("x", endOfTimelineX + 30 + rInc)
                    .text(t=>(t['label']))
                    .transition().duration(duration)
                    .attr("y", function(t, i){return (startY+5) - yInc*i;})
                    .selection(),
      update => update.transition().duration(duration)
                      .attr("y", function(t, i){return (startY+5) - yInc*i;})
                      .selection()
                      .attr("x", endOfTimelineX + 30 + rInc)
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


// Set the position and text of start guide
var setStartGuide = function(){

  let startDate = currentDates[0];
  let startDatePosition = date2Pos(currentDates[0]);

  // Move the timeline guides and update its text
  startGuide.attr("transform", "translate(" + startDatePosition + ", 0)");
  startText.text(date2String(startDate));

  // Calculate and set the width of the selected timeline
  var timeWidth =  date2Pos(currentDates[1]) - startDatePosition;
  if (timeWidth < 0)
    timeWidth = 0;

 timelineRect.attr("x", startDatePosition)
             .attr("width", timeWidth);

 sliderRect.attr("x", startDatePosition)
             .attr("width", timeWidth);

  // Set the location of the time slider end point
  startCircle.attr("cx", startDatePosition);

  // Set the rectangle showing the data NOT selected
  startRect.attr("x", -startDatePosition+date2Pos(xScale.domain()[0]))
           .attr("width", startDatePosition-date2Pos(xScale.domain()[0]));

}

// Set the position and text of the end guide
var setEndGuide = function(){

  let endDate = currentDates[1];
  let endDatePosition = date2Pos(currentDates[1]);

  // Move the timeline guides and update its text
  endGuide.attr("transform", "translate(" +  endDatePosition + ", 0)");
  endText.text(date2String(endDate));

  // Calculate and set the width of the selected timeline
  var timeWidth =  endDatePosition -  date2Pos(currentDates[0]);
  if(timeWidth < 0)
     timeWidth = 0;

  timelineRect.attr("width", timeWidth);
  sliderRect.attr("width", timeWidth);

  // Set the location of the time slider end point
  endCircle.attr("cx", endDatePosition);

  // Set the rectangle showing the data NOT selected
  endRect.attr("x", 0)
    .attr("width", date2Pos(xScale.domain()[1])-endDatePosition);
 }

function dragStartPoint(event, d){
  // Get the mouse position
  var mx = event.x;

  // Clamp the line position
  if ( mx < startOfTimelineX )
    mx = startOfTimelineX;
  if ( mx > timelineWidth )
    mx = timelineWidth;

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
  if ( mx < startOfTimelineX )
    mx = startOfTimelineX;
  if ( mx > timelineWidth )
    mx = timelineWidth;

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
