// * * * * * * * * * * * * * * * * * * * * * * * * * * * //
// State Variables Containing Current State
// Global Variables that Don't Change
// Written by Kristi Potter
// 10/02/2021
// * * * * * * * * * * * * * * * * * * * * * * * * * * * //

// Are we needing to intialize??
var initState = true;

// --- Windowing variables

// Toggle the open table in new window button
var openWindowButtonClicks = 0;

// The new window we create for the table
var newWindow = undefined;

// Table variables
var infoTable = undefined;
var infoTableBody = undefined;
var remoteInfoTable = undefined;
var remoteTableBody = undefined;

// The current makerLayers
let currentMarkers = [];

// The currently selected marker
var currentMarkerSelection = undefined;

// --- Attribute is building vs client, types are within the attribute
// Create labels for each attribute
let attributes = {"building":"Building Type", "client":"Client Type"};

// List of all the attribute types
let attributeTypes={"Building Type": [...new Set(data.map(d=>d["Building Type"]))],
                    "Client Type": [...new Set(data.map(d=>d["Client Type"]))] };

attributeTypes["Building Type"].sort().reverse();
attributeTypes["Client Type"].sort().reverse();

// The current attribute type we're looking at
let currentAttribute = "Building Type";

// The current types of markers we're looking at
let currentTypes = Object.keys(iconMap[currentAttribute]);

// --- Dates

// Get the unique dates in the data
const distinctDates = [...new Set(data.map(d=>d.Date))].sort();
const dates = data.map( d=>d.Date);
const datesCount = _.countBy(dates);

// The current dates we're looking at
let currentDates = [string2Date(distinctDates[0]-1), string2Date(distinctDates[distinctDates.length-1]+2)];

// Get the dates count by attribute type
var datesByAttribute = {};
for(types in attributes){
  let t = attributes[types];
  // Get the unique attribute types
  var attTypes = attributeTypes[t];
  datesByAttribute[t] = {};
  attTypes.forEach(function(type){
    if(!(type in datesByAttribute[t])){
      datesByAttribute[t][type] = {"data":{},
                                   "display":true,
                                   "color": iconMap[t][type]["color"],
                                   "label":type
                                   };
    }
    datesByAttribute[t][type]["data"] = data.filter(function(d) {return d[t] == type;});
  });
  attTypes.forEach(function(type, j){
    let tmp = _.countBy(datesByAttribute[t][type]["data"].map(d=>d.Date));
    datesByAttribute[t][type]["data"] = {}
    for( i in tmp){
      datesByAttribute[t][type]["data"][i]={"idx":j, "count":tmp[i], "color":iconMap[t][type]["color"], "type":type};
    }
  });
}

// The map Bounds
var bounds = undefined;
