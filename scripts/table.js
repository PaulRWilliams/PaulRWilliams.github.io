// * * * * * * * * * * * * * * * * * * * * * * * * * * * //
// Table Definitions
// Written by Kristi Potter
// 10/02/2021
// * * * * * * * * * * * * * * * * * * * * * * * * * * * //


// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
// The tables
// - -- -- - - --- - -- - - --- - ---- -- --- -- - -- -  //
const infoTableCols = ["Name", "Date", "Location", "Client", "Building Type", "Client Type", "Status", "Style", "Notes", "Sources"];

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
