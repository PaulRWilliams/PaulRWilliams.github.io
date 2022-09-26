// * * * * * * * * * * * * * * * * * * * * * * * * * * * //
// Table Definitions
// Written by Kristi Potter
// 10/02/2021
// * * * * * * * * * * * * * * * * * * * * * * * * * * * //

// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
// The tables
// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //

// The columns we are interested in
const infoTableCols = ["Name", "Date", "Location", "Client", "Building Type", "Client Type", "Status", "Style", "Notes", "Sources"];

// Create the table
infoTable = d3.select("#info-table")
                   .append("table")
                   .attr("class", "table is-striped is-fullwidth is-hoverable is-bordered is-scrollable p-0 m-0")
                   .attr("id", "list-table");
let info_header = infoTable.append("thead").append("tr");
info_header.selectAll("th")
  .data(infoTableCols)
  .enter()
  .append("th")
  .attr("title", "Click to sort by this column.")
  .attr("class", "is-size-7")
  .style("text-align", "left")
  .text((d)=>(d));
  //.append("i")
  //.attr("class", "fas fa-cloud kp-right");
infoTableBody = infoTable.append("tbody");

// Listen for click to sort the table
document.querySelectorAll(`th`).forEach((th, position) => {
 th.addEventListener(`click`, evt => sortTable(position));
});
