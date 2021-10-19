// * * * * * * * * * * * * * * * * * * * * * * * * * * * //
// Definitions of Colors, Markers, etc.
// Written by Kristi Potter
// 10/02/2021
// * * * * * * * * * * * * * * * * * * * * * * * * * * * //

// Map of attribute type to label
let attributes = {"building":"Building Type", "client":"Client Type"};

const infoTableCols = ["Name", "Date", "Location", "Client", "Building Type", "Client Type", "Status", "Style"];
const noteTableCols = ["Name", "Notes", "Sources"];


// Colors for the legend
var legendColors = [
         d3.rgb(225, 177, 49),
		     d3.rgb(222, 108, 43),
		     d3.rgb(118, 82, 59),
		     d3.rgb(168, 149, 137),
		     d3.rgb(243, 199, 155),
		     d3.rgb(192, 205, 165),
		     d3.rgb(99, 139, 40),
		     d3.rgb(23, 68, 34),
		     d3.rgb(27, 51, 94),
		     d3.rgb(23, 100, 144),
		     d3.rgb(174, 216, 229),
		     d3.rgb(161, 133, 164),
		     d3.rgb(89, 38, 93),
		     d3.rgb(41, 21, 43),
		     d3.rgb(94, 14, 26)
];

// Definitions of map marker types
const mapMarkerDefinitions = {"Building Type":{
                    "Banks/Financial":{"icon":"fa-money-check-alt", "color":'#e6194B'},
                    "Commercial":{"icon":"fa-industry", "color":'#3cb44b'},
                    "Educational":{"icon":"fa-graduation-cap", "color":'#b2df8a'},
                    "Food Service/Restaurant":{"icon":"fa-utensils", "color":'#4363d8'},
                    "Government":{"icon":"fa-landmark", "color":'#f58231'},
                    "Hotels/Hospitality":{"icon":"fa-bed", "color":'#911eb4'},
                    "Medical":{"icon":"fa-hospital", "color":'#42d4f4'},
                    "Memorial":{"icon":"fa-hospital", "color":'#f032e6'},
                    "Office Building":{"icon":"fa-building", "color":'#bfef45'},
                    "Retail/Shopping":{"icon":"fa-shopping-cart", "color":'#fabed4'},
                    "Residential/Single Family":{"icon":"fa-home", "color":'#469990'},
                    "Residential/Multi-Unit":{"icon":"fa-hotel", "color":'#dcbeff'},
                    "Religious":{"icon":"fa-money-check-alt", "color":'#9A6324'},
                    "Recreational":{"icon":"fa-table-tennis", "color":'#fffac8'},
                    "Theater/Entertainment":{"icon":"fa-theater-masks", "color": '#800000'},
                  },
                              "Client Type":{
                                  "Private/Corporate":{"icon":"fa-user-tie", "color": '#7fc97f'},
                                  "Private/Individual":{"icon":"fa-user", "color": '#beaed4'},
                                  "Private/Religious":{"icon":"fa-pray", "color": '#fdc086'},
                                  "Public":{"icon":"fa-users", "color": '#ffff99'},
                                  "Public-gov":{"icon":"fa-flag-usa", "color": '#386cb0'},
                                  "Public/Military":{"icon":"fa-fighter-jet", "color": '#f0027f'},
                                  "Unknown":{"icon":"fa-question", "color": '#bf5b17'},
                                }
                    /*"Client Type":{
                        "Private/Corporate":{"icon":"fa-user-tie", "color": '#7fc97f'},
                        "Private/Individual":{"icon":"fa-user", "color": '#beaed4'},
                        "Private/Religious":{"icon":"fa-pray", "color": '#fdc086'},
                        "Public":{"icon":"fa-users", "color": 'red'},
                        "Public-gov":{"icon":"fa-flag-usa", "color": 'cyan'},
                        "Public/Military":{"icon":"fa-fighter-jet", "color": '#7fc97f'},
                        "Unknown":{"icon":"fa-question", "color": '#7fc97f'},
                      }*/
                  };

// Marker-icons for each client or building tyoe
let preDefinedMarkers = {}
for(m in mapMarkerDefinitions){
  preDefinedMarkers[m] = {};
  for (b in mapMarkerDefinitions[m]){
     // Creates a red marker with the coffee icon
     preDefinedMarkers[m][b] = L.ExtraMarkers.icon({
       icon: mapMarkerDefinitions[m][b]['icon'],
       markerColor: mapMarkerDefinitions[m][b]['color'],
       shape: 'circle',
       prefix: 'fas',
       svg: true
     });
   }
}
