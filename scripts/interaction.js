// * * * * * * * * * * * * * * * * * * * * * * * * * * * //
// Code that Drives Interaction
// Written by Kristi Potter
// 10/02/2021
// * * * * * * * * * * * * * * * * * * * * * * * * * * * //

// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
// Button actions
// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //

function closeRemoteWindow(){

  // Change the button text
  document.getElementById("openButton").innerHTML = '<span class="icon is-small"><i class="fas fa-window-restore" aria-hidden="true"></i></span> <span>Open Table in New Window</span>';

  // Get the table DOM and show
  var table = document.querySelector('#info-table');
  table.style.display = 'block';

  // Shrink the map
  var map = document.getElementById('map-column');
  map.classList.add("is-6");
  map.classList.remove("is-full");
  console.log("unexpamd");

  if(currentMarkerSelection !== undefined){
    console.log("CMS", currentMarkerSelection);
    currentMarkerSelection.fire('click');
    zoomMap(currentMarkerSelection.data.Name);
    scroll2Row();
  }
}

// Open new window on button click
document.getElementById("openButton").addEventListener("click", function(){

  //-- Open the new window --//
  if(openWindowButtonClicks %2 === 0){

    // Change the button text
    document.getElementById("openButton").innerHTML = '<span class="icon is-small"><i class="fas fa-window-maximize" aria-hidden="true"></i></span> <span>Put Table Back into Page</span>';

    // Get the table DOM
    var table = document.querySelector('#info-table');

    // Create a copy of the table
    var tableClone = table.cloneNode(true);

    // Update the ID
    tableClone.id = 'info-table-remote';
    tableClone.classList.remove("kp-table");
    tableClone.classList.add("kp-table-remote");

    // Hide the local table
    table.style.display = 'none';

    // Expand the map

    var map = document.getElementById('map-column');
    map.classList.remove("is-6");
    map.classList.add("is-full");

    // Open a new window
    newWindow = window.open("", "", "width=1200,height=670");

    // Write the header for styling
    newWindow.document.write('<head><meta charset="UTF-8"><title>Architectural Works by Paul R. Williams</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.min.css"/><link rel="stylesheet" href="./css/prw.css" /></head><body></body>')

    // Get the root of the window DOM
    let newWindowRoot = d3.select(newWindow.document.body);
    newWindowRoot.append(() => tableClone);

    let list = newWindow.document.querySelector('#list-table');
    list.id = 'list-table-remote'

    // Listen for click to sort the table
    newWindow.document.querySelectorAll(`th`).forEach((th, position) => {
     th.addEventListener(`click`, evt => sortRemoteTable(position));
    });

    // Listen for the click to highlight a row
    newWindow.document.querySelectorAll(`tr`).forEach((th, position) => {
     th.addEventListener(`click`, function(d) {

       // Get the name from the node id
       let name = d.target.parentNode.id;
       let marker = findMarker(name);

       // Zoom the map and click the marker
       zoomMap(name);
       marker.fire('click');
     })
    });


    // Put the table back if we close this new window
    newWindow.addEventListener("beforeunload", function (e) {
      closeRemoteWindow()
    });

    // Trigger the marker if we have one to scroll to the visible table to the row
    if(currentMarkerSelection !== undefined)
      currentMarkerSelection.fire('click');
  }

  //--  Close the new window --//
  else{

    // Close the window
    newWindow.close();

    // Actions after the window is closed
    closeRemoteWindow()

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
  updateRemoteList();
}

// Zoom to the lat/lon of this area
function zoomMap(name){

  // Find the item in the data based on the name
  let item  = data.find(el=>el.Name == name);

  // Fly to the location
  map.flyTo([item.Latitude, item.Longitude], 14, {duration: 1});
}

// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
// List
// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //

// Unhighlight everything
function unHighlight(){

  var rows = document.querySelectorAll('#list-table tr');
  for (var i=0;i <rows.length;i++){
    rows[i].style.border="1px solid black";
  }
}
function unHighlightRemote(){

  if(newWindow === undefined)
    return;

  var rows = newWindow.document.querySelectorAll('#list-table-remote tr');
    for (var i=0;i <rows.length;i++){
      rows[i].style.border="1px solid black";
    }
}

// Scroll the line that corresponds to the clicked marker
function scroll2Row(){

  // If we don't have a selection, dont do anything
  if(currentMarkerSelection === undefined)
    return;

  unHighlight();

  // Highlight the clicked element
  var elm = document.getElementById(currentMarkerSelection.data.Name);
  console.log("scroll2Row", elm);
  elm.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
  });
  elm.style.border='2px double DarkTurquoise';

}
// Scroll the line that corresponds to the clicked marker
function scroll2RowRemote(padding=undefined){

  // If we don't have a new window, return
  if(newWindow === undefined)
    return;

  // If we don't have a selection, dont do anything
  if(currentMarkerSelection === undefined)
    return;

  // Unhighlight all rows
  unHighlightRemote();

  // Highlight the clicked element
  var elm = newWindow.document.getElementById(currentMarkerSelection.data.Name);
  elm.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
  });

  elm.style.border='2px double DarkTurquoise';
}

// Sort table functions
function compareValues(a, b) {
  // return -1/0/1 based on what you "know" a and b
  // are here. Numbers, text, some custom case-insensitive
  // and natural number ordering, etc. That's up to you.
  // A typical "do whatever JS would do" is:
  return (a<b) ? -1 : (a>b) ? 1 : 0;
}
function sortRemoteTable(colnum){

  // Get the table
  var table = newWindow.document.getElementById("list-table-remote");

  // get all the rows in this table:
  let rows = Array.from(table.querySelectorAll(`tr`));

  // but ignore the heading row:
  rows = rows.slice(1);

  // set up the queryselector for getting the indicated
  // column from a row, so we can compare using its value:
  let qs = 'td:eq('+colnum+')';

  // and then just... sort the rows:
  rows.sort( (r1,r2) => {
    // get each row's relevant column
    let t1 = $(r1).find(qs).text();
    let t2 = $(r2).find(qs).text();

    // and then effect sorting by comparing their content:
    return compareValues(t1,t2);
  });

  // and then the magic part that makes the sorting appear on-page:
  rows.forEach(row => table.appendChild(row));

  // Scroll to the current selection, if we have one
  scroll2RowRemote();
}
function sortTable(colnum) {


  // Grab the table
  var table = document.getElementById("list-table");

  // get all the rows in this table:
  let rows = Array.from(table.querySelectorAll(`tr`));

  // but ignore the heading row:
  rows = rows.slice(1);

  // set up the queryselector for getting the indicated
  // column from a row, so we can compare using its value:
  let qs = 'td:eq('+colnum+')';

  // and then just... sort the rows:
  rows.sort( (r1,r2) => {
    // get each row's relevant column
    let t1 = $(r1).find(qs).text();
    let t2 = $(r2).find(qs).text();

    // and then effect sorting by comparing their content:
    return compareValues(t1,t2);
  });

  // and then the magic part that makes the sorting appear on-page:
  rows.forEach(row => table.appendChild(row));

  // Scroll to the current selection, if we have one
  scroll2Row();
}

// Update the tables
function findMarker(name){
  // Find the item in the data based on the name
  let item  = data.find(el=>el.Name == name);
  console.log("309 item", item);

  // Get the date and type
  let date = item.Date;
  let type = item[currentAttribute]

  // Find the marker in the saved cluster array
  let marker = undefined;

  // Iterate over the markers
  for(i in currentMarkers){

    // Filter the current markers by date
    let cDate = currentMarkers[i][0].data.Date;

    // If this isn't the date we are looking for, move on
    if(cDate !== date)
      continue;
    else{
      let cType = currentMarkers[i][0].data[currentAttribute];
      if(cType !== type)
        continue;
      else{
        for(j in currentMarkers[i]){
          let cName = currentMarkers[i][j].data.Name;
          if(name === cName)
            return currentMarkers[i][j];
        }
      }
    }
  }
}
function updateRemoteList(){

  if(newWindow === undefined)
    return;

  // Iterate over the current markers
  let currentData = [];
  for(i in currentMarkers){
    for(j in currentMarkers[i]){
      currentData.push(currentMarkers[i][j].data);
    }
  }

  let tableBody = newWindow.document.querySelector('#list-table-remote').getElementsByTagName('tbody')[0];

  // Add the rows and columns to the info table
  let info_rows = d3.select(tableBody).selectAll("tr")
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

}
function updateList (){

  // Iterate over the current markers
  let currentData = [];
  for(i in currentMarkers){
    for(j in currentMarkers[i]){
      currentData.push(currentMarkers[i][j].data);
    }
  }
  // Add the rows and columns to the info table
  let info_rows = infoTableBody.selectAll("tr")
                     .data(currentData)
                     .attr("id", (d)=>(d.Name))
                     .join(
                       enter => enter.append("tr"),
                       update => update,
                       exit => exit.remove()
                     )
                     .on("click", function(d) {

                       // Get the name from the node id
                       let name = d.target.parentNode.id;
                       let marker = findMarker(name);

                       // Zoom the map and click the marker
                       zoomMap(name);
                       marker.fire('click');

                     });
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
 }

// DRIVE
updateMapMarkers();
d3.select(window).on("resize", updateTimeline);
updateTimeline();
