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
    document.getElementById("openButton").innerHTML = '<span class="icon is-small"><i class="fas fa-window-maximize" aria-hidden="true"></i></span> <span>Put Table Back into Page</span>';

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

// Listener for the type radio buttons
document.querySelectorAll("input[name='typeRadio']").forEach((input) => {
  input.addEventListener('change', function(event) {
     let byTypeAttribute = event.target.id;
     currentAttribute = attributes[byTypeAttribute];
     currentTypes = Object.keys(iconMap[currentAttribute]);

     // Update the map marker layers
     updateMapMarkers();

     // Update the timeline
     updateTimeline()
  });
});

// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
// Map
// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //

// When the map moves, update the list
function updateMapMarkers(){
  // Update the map
  updateMap();

  // Update the list of data
  updateList();
}

// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
// List
// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //

// Scroll the line that corresponds to the clicked marker
function scroll2Row(marker){

  console.log("Scroll2", marker);

  var elm = document.getElementById(marker.data.Name);
  elm.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
  });

  elm.style.border='2px double Red';

  /*let line = $('#info-table tr').filter(function(){
    console.log($.trim($('td', this).eq(0).text())==marker.data.Name);
   return $.trim($('td', this).eq(0).text())==marker.data.Name;
  });
    console.log("line",line);
    console.log("not line", $("tr").index(marker.data.Name));
*/

/*


  // Grab the table where it lives (here or in the new window)
  var currentWindow = document;
  if(newWindow !== undefined){
    currentWindow =  newWindow.document;
  }

  // Get all the rows
  var rows = currentWindow.querySelectorAll('#kp-table tr');

  // Unhighlight the rows
  for (var i=0;i <rows.length;i++){
    rows[i].style.backgroundColor="White";
  }

  // line is zero-based
  // line is the row number that you want to see into view after scroll
  rows[line+1].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
  });
  rows[line+1].style.backgroundColor='#EEE8AA';
*/
}

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

  console.log("currentData", currentData);

  // Add the rows and columns to the info table
  let info_rows = infoTablebody.selectAll("tr")
                      .data(currentData)
                      .attr("id", (d)=>(d.Name))
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
d3.select(window).on("resize", updateTimeline);
updateTimeline();
