// * * * * * * * * * * * * * * * * * * * * * * * * * * * //
// SVG DOM Definitions
// Written by Kristi Potter
// 10/02/2021
// * * * * * * * * * * * * * * * * * * * * * * * * * * * //

// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
// Map
// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //

// Create the map the div #map
const defaultView = [24.41210088744385, -57.39257812500001];
let defaultZoom =2;
let defaultBounds = undefined;
let markerBounds = undefined;

var map = L.map('map',
                {zoomControl: false,
                 minZoom: 1,
                 worldCopyJump: false})
                .setView(defaultView, defaultZoom);
map.on("popupopen", function(evt){currentPopup = evt.popup});


const resizeObserver = new ResizeObserver(() => {
  map.invalidateSize();
});

const mapDiv = document.getElementById("map");
resizeObserver.observe(mapDiv);


// Add the tile layer
// Tile options: https://carto.com/help/building-maps/basemap-list/
let tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png',
                        ).addTo(map);

// Create a home button
L.Control.zoomHome = L.Control.extend({
    options: {
        position: 'topleft',
        zoomInText: '<i class="fa fa-plus" style="line-height:1.65;"></i>',
        zoomInTitle: 'Zoom in',
        zoomOutText: '<i class="fa fa-minus" style="line-height:1.65;"></i>',
        zoomOutTitle: 'Zoom out',
        zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
        zoomHomeTitle: 'Camera home',
        zoomBoundsTitle: 'Zoom to Marker Bounds',
        zoomBoundsText: '<i class="fa fa-draw-polygon" style="line-height:1.65;"></i>',
    },
    onAdd: function (map) {
        var controlName = 'gin-control-zoom',
            container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
            options = this.options;

        this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
        controlName + '-in', container, this._zoomIn);
        this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
        controlName + '-home', container, this._zoomHome);
        this._zoomBoundsButton = this._createButton(options.zoomBoundsText, options.zoomBoundsTitle,
        controlName + '-bounds', container, this._zoomBounds);
        this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
        controlName + '-out', container, this._zoomOut);

        this._updateDisabled();
        map.on('zoomend zoomlevelschange', this._updateDisabled, this);

        return container;
    },

    onRemove: function (map) {
        map.off('zoomend zoomlevelschange', this._updateDisabled, this);
    },

    _zoomIn: function (e) {
        this._map.zoomIn(e.shiftKey ? 3 : 1);
    },

    _zoomOut: function (e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },

    _zoomHome: function (e) {
        map.setView(defaultBounds, defaultZoom);
    },
    _zoomBounds: function (e) {
        map.fitBounds(markerBounds, { padding: [5, 5] });
    },

    _createButton: function (html, title, className, container, fn) {
        var link = L.DomUtil.create('a', className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', fn, this)
            .on(link, 'click', this._refocusOnMap, this);

        return link;
    },

    _updateDisabled: function () {
        var map = this._map,
            className = 'leaflet-disabled';

        L.DomUtil.removeClass(this._zoomInButton, className);
        L.DomUtil.removeClass(this._zoomOutButton, className);

        if (map._zoom === map.getMinZoom()) {
            L.DomUtil.addClass(this._zoomOutButton, className);
        }
        if (map._zoom === map.getMaxZoom()) {
            L.DomUtil.addClass(this._zoomInButton, className);
        }
    }
});



// add the new control to the map
var zoomHome = new L.Control.zoomHome();
zoomHome.addTo(map);


// Create the marker groups
let markerGroups = {};
for(let att in iconMap){
  markerGroups[att] = {};
  for(let type in iconMap[att]){
    let color = iconMap[att][type]['color'];
    markerGroups[att][type] = L.markerClusterGroup({
      maxClusterRadius: 20,
      spiderfyOnMaxZoom:true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
      animate:false,
      iconCreateFunction: function(cluster) {
          //console.log("cluster", cluster);
           var symbol = 'n';
           if(cluster.getChildCount() < 100)
                symbol = cluster.getChildCount();
           return L.ExtraMarkers.icon({
             number: symbol,
             icon: 'fa-number',
             shape: 'star',
             markerColor: color,
             svg: true
            });
        },
      }).on('clusterclick',(a)=>(a.layer.spiderfy()));
  }
}

// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
// The tables
// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //

let info_table = d3.select("#info-table")
  .append("table")
  .attr("class", "table is-striped is-fullwidth is-hoverable is-bordered is-scrollable p-0 m-0");
let info_header = info_table.append("thead").append("tr");
info_header.selectAll("th")
  .data(infoTableCols)
  .enter()
  .append("th")
  .attr("class", "is-size-7")
  .style("text-align", "left")
  .text((d)=>(d));
let infoTablebody = info_table.append("tbody");

/*
let note_table = d3.select("#note-table")
  .append("table")
  .attr("class", "table is-striped is-fullwidth is-hoverable is-bordered is-scrollable p-0 m-0");
let note_header = note_table.append("thead").append("tr");
note_header.selectAll("th")
  .data(noteTableCols)
  .enter()
  .append("th")
  .attr("class", "is-size-7")
  .style("text-align", "left")
  .text((d)=>(d));
let noteTablebody = note_table.append("tbody");
*/

 // - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
 // The timeline
 // - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //

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
