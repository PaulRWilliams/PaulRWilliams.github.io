// * * * * * * * * * * * * * * * * * * * * * * * * * * * //
// General Utility Functions
// Written by Kristi Potter
// 10/02/2021
// * * * * * * * * * * * * * * * * * * * * * * * * * * * //

// Change a label to a DOM-appropriate ID
// DOM ids can't have '/' or ' '
function changeToDomId(label){
  return label.replace(/\s+/g, '').replace("/", '')
}

// Date formatters
var string2Date = d3.timeParse("%Y");
var date2String = d3.timeFormat("%Y");
function date2Int(date) { return parseInt(date2String(date)); }

// Make the marker label
function makeLabel(d){
   var label = "<b>Name:</b> " + d["Name"];
   if (d["Building Type"] != null)
  label += "<br><b>Building Type:</b> " + d["Building Type"];
   if (d["Style"] != null)
  label += "<br><b>Style:</b> " + d["Style"];
   if (d["Client"] != null)
  label += "<br><b>Client:</b> " + d["Client"];
   if (d["Client Type"] != null)
  label += "<br><b>Client Type:</b> " + d["Client Type"];
   if(d["Location"] != null)
  label += "<br><b>Location:</b> " + d["Location"];
   if (d["Date"] != null)
  label += "<br><b>Year:</b> " + d["Date"];
   /*if (d["Lat"] != null)
  label += "<br><b>Coords:</b>" + d["Lat"] +", "+d["Lon"];
   */
   return label
};

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

  // Set the location of the time slider end point
  endCircle.attr("cx", endDatePosition);

  // Set the rectangle showing the data NOT selected
  endRect.attr("x", 0)
    .attr("width", date2Pos(xScale.domain()[1])-endDatePosition);
 }
