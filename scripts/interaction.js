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

    // Hide the table
    table.style.display = 'none';

    // Expand the map
    var map = document.getElementById('map-column');
    map.classList.remove("is-6");
    map.classList.add("is-full");

    // Put the table back if we close this new window
    newWindow.addEventListener("beforeunload", function (e) {

      // Change the button text
      document.getElementById("openButton").innerHTML = '<span class="icon is-small"><i class="fas fa-window-restore" aria-hidden="true"></i></span> <span>Open Table in New Window</span>';

      // Get the table DOM and show
      var table = document.querySelector('#info-table');
      table.style.display = 'block';

      // Shrink the map
      var map = document.getElementById('map-column');
      map.classList.add("is-6");
      map.classList.remove("is-full")

      // Listen for click to sort the table
      document.querySelectorAll(`th`).forEach((th, position) => {
       th.addEventListener(`click`, evt => sortTable(position));
      });

    });

    // Scroll to the selected row
    scroll2RowRemote();
  }

  //--  Close the new window --//
  else{

    // Change the button text
    document.getElementById("openButton").innerHTML = '<span class="icon is-small"><i class="fas fa-window-restore" aria-hidden="true"></i></span> <span>Open Table in New Window</span>';

    // Close the window
    newWindow.close();

    // Get the table DOM and show
    var table = document.querySelector('#info-table');
    table.style.display = 'block';

    // Shrink the map
    var map = document.getElementById('map-column');
    map.classList.add("is-6");
    map.classList.remove("is-full")

    // Listen for click to sort the table
    document.querySelectorAll(`th`).forEach((th, position) => {
     th.addEventListener(`click`, evt => sortTable(position));
    });
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

// DRIVE
updateMapMarkers();
d3.select(window).on("resize", updateTimeline);
updateTimeline();
