// * * * * * * * * * * * * * * * * * * * * * * * * * * * //
// General Utility Functions
// Written by Kristi Potter
// 10/02/2021
// * * * * * * * * * * * * * * * * * * * * * * * * * * * //

// -- Change a label to a DOM-appropriate ID --//
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

// Convert the json data to csv
function arrayToCSV (data) {
  csv = data.map(row => Object.values(row));
  csv.unshift(Object.keys(data[0]));
  return csv.join('\n');
}

//  Save the data as a csv
downloadCSVFromJson = (filename, arrayOfJson) => {

  csv = arrayToCSV(arrayOfJson)

  // Create link and download
  var link = document.createElement('a');
  link.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(csv));
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
