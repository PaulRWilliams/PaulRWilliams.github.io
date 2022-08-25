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

// DRIVE
updateMapMarkers();
d3.select(window).on("resize", timelineSizeChange);
timelineSizeChange();
