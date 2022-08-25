// * * * * * * * * * * * * * * * * * * * * * * * * * * * //
// Code that Drives Interaction
// Written by Kristi Potter
// 10/02/2021
// * * * * * * * * * * * * * * * * * * * * * * * * * * * //

// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
// Button actions
// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //

// Open new window on button click
document.getElementById("openButton").addEventListener("click", function(){

  // Open the new window
  if(openWindowButtonClicks %2 === 0){

    // Change the button text
    document.getElementById("openButton").innerHTML =   '<span class="icon is-small"><i class="fas fa-window-maximize" aria-hidden="true"></i></span> <span>Put Table Back into Page</span>';

    // Open a new window
    var newWindowContent = document.getElementById('info-table').innerHTML;
    newWindow = window.open("", "", "width=500,height=400");
    newWindow.document.write('<head><meta charset="UTF-8"><title>Architectural Works by Paul R. Williams</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.min.css"/><link rel="stylesheet" href="./css/prw.css" /></head>')
    newWindow.document.write(newWindowContent);

    // Put the table back if we close this new window
    newWindow.addEventListener("beforeunload", function (e) {

      // Change the button text
      document.getElementById("openButton").innerHTML =   '<span class="icon is-small"><i class="fas fa-window-restore" aria-hidden="true"></i></span> <span>Open Table in New Window</span>';

      // Show the table
      var table = document.getElementById('info-table');
      table.style.display = 'block';

      // Shrink the map
      var map = document.getElementById('map-column');
      map.classList.add("is-6");
      map.classList.remove("is-full")
    });


    // Hide the table
    var table = document.getElementById('info-table');
    table.style.display = 'none';

    // Expand the map
    var map = document.getElementById('map-column');
    map.classList.remove("is-6");
    map.classList.add("is-full")
  }
  // Close the new window
  else{

    // Change the button text
    document.getElementById("openButton").innerHTML =   '<span class="icon is-small"><i class="fas fa-window-restore" aria-hidden="true"></i></span> <span>Open Table in New Window</span>';

    // Close the window
    newWindow.close();

    // Show the table
    var table = document.getElementById('info-table');
    table.style.display = 'block';

    // Shrink the map
    var map = document.getElementById('map-column');
    map.classList.add("is-6");
    map.classList.remove("is-full")
  }

   // Update the number of clicks
   openWindowButtonClicks = openWindowButtonClicks+1;
});

// Export data on button click
document.getElementById("saveDataButton").addEventListener("click", function(){
  exportToCSV(data);
});

// ??
document.getElementById("clusterButton").addEventListener("click", function(){

  // Open the new window
  if(clusterButtonClicks %2 === 0){

    // Change the button text
    document.getElementById("clusterButton").innerHTML = '<span class="icon is-small"><i class="fas fa-text-height" aria-hidden="true"></i></span><span>Cluster Markers by Type</span>';

  }
  // Close the new window
  else{

      // Change the button text
    document.getElementById("clusterButton").innerHTML = '<span class="icon is-small"><i class="fas fa-location-arrow" aria-hidden="true"></i></span> <span>Cluster Markers by Location</span>';

  }

   // Update the number of clicks
   clusterButtonClicks = clusterButtonClicks+1;
});

// Listener for the type radio buttons
document.querySelectorAll("input[name='typeRadio']").forEach((input) => {
      input.addEventListener('change', function(event) {
           let byTypeAttribute = event.target.id;
           currentAttribute = attributes[byTypeAttribute];
           currentTypes = Object.keys(iconMap[currentAttribute]);

           // Update the map marker layers
            updateMapMarkers();

           // Update the timeline
           updateTimelineData()
        });
  });


// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
// Map
// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //

// When the map moves, update the list
function updateMapMarkers(){

  if(currentMarkers.length > 0){
    map.eachLayer((layer) => {
      if(layer._url === undefined)
        layer.remove();
    });
    currentMarkers = [];
  }

  // Get the markers layers to add, filtered by date
  var filteredByDates = _.pickBy(markerClusterArrays[currentAttribute], function(value, key) {
     return date2Int(currentDates[0]) <= key && key <= date2Int(currentDates[1]);
  });

  // Get the marker layers to add, filtered by type
  var filteredByType = {};
  for(let f in filteredByDates) {
     let types = _.pickBy(filteredByDates[f], function(value, key){
      return currentTypes.indexOf(key) > -1;
     });
     if(Object.keys(types).length > 0)
       filteredByType[f] = types;
  }

  // Create and add the subgroups
  for(let date in filteredByType){
    for (let type in filteredByType[date]){
      let mySubGroup = L.featureGroup.subGroup(markerGroups[currentAttribute][type], filteredByType[date][type]);
      currentMarkers.push(filteredByType[date][type]);
      mySubGroup.addTo(map);
   }
  }

  // Add the marker groups
  let bounds = undefined;
  for(let t in currentTypes){
    let type = currentTypes[t];

    markerGroups[currentAttribute][type].addTo(map);
    if(bounds === undefined)
      bounds = markerGroups[currentAttribute][type].getBounds();
    else
      bounds.extend(markerGroups[currentAttribute][type].getBounds());
  }

  // Set the bounds around the currently displayed markers
  markerBounds = bounds;

  // If this is the first time we run, save the bounds
  if(initState){
    defaultBounds = bounds;
    console.log("bounds", bounds);
    //map.fitBounds(defaultBounds);
    initState = false;
  }

  // Update the list of data
  updateList();
 }

// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
// List
// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //

function updateList (){

  currentMapZoom = map.getZoom();

  // Get the bounding box of the map
  var bounds = map.getBounds();
  currentData = [];

  // Iterate over the current markers
  for(i in currentMarkers){
    for(j in currentMarkers[i]){

      let markerData = currentMarkers[i][j].data
      let latLon = L.latLng(markerData.Lat, markerData.Lon);

      if(bounds.contains(latLon)){
        currentData .push(markerData);
      }
    }
  }

  // Add the rows and columns to the info table
  let info_rows = infoTablebody.selectAll("tr")
                      .data(currentData)
                      .join(
                        enter => enter.append("tr"),
                        update => update,
                        exit => exit.remove()
                      );
  let info_cells = info_rows.selectAll("td")
             // each row has data associated; we get it and enter it for the cells.
                 .data(function(d) {
                     let row = infoTableCols.map(x => d[x]);
                     return row;
                 })
                 .join(
                   enter => enter.append("td").text((d)=>(d)),
                   update => update.text((d)=>(d)),
                   exit => exit.remove()
                 )
                 .attr("class", "is-size-7");

/*
 // Add the rows and columns to the info table
 let note_rows = noteTablebody.selectAll("tr")
                     .data(currentData)
                     .join(
                       enter => enter.append("tr"),
                       update => update,
                       exit => exit.remove()
                     );
 let note_cells = note_rows.selectAll("td")
            // each row has data associated; we get it and enter it for the cells.
                .data(function(d) {
                    let row = noteTableCols.map(x => d[x]);
                    return row;
                })
                .join(
                  enter => enter.append("td").text((d)=>(d)),
                  update => update.text((d)=>(d)),
                  exit => exit.remove()
                )
                .attr("class", "is-size-7");
                */
 }

// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
// Timeline
// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
function updateTimelineData(){

   //console.log("updateTimelineData");

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
 d3.select(window).on("resize", timelineSizeChange);

// DRIVE
updateMapMarkers();
//timelineSizeChange();