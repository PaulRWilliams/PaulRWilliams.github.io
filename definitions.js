// * * * * * * * * * * * * * * * * * * * * * * * * * * * //
// Definitions of Colors, Markers, etc.
// Written by Kristi Potter
// 10/02/2021
//
// Be sure to load AFTER iconMap.js
// * * * * * * * * * * * * * * * * * * * * * * * * * * * //

// Map of attribute type to label
let attributes = {"building":"Building Type", "client":"Client Type"};

const infoTableCols = ["Name", "Date", "Location", "Client", "Building Type", "Client Type", "Status", "Style", "Notes", "Sources"];

// Marker-icons for each client or building tyoe (Relies in iconMap.js)
let preDefinedMarkers = {}
for(m in iconMap){
  preDefinedMarkers[m] = {};
  for (b in iconMap[m]){
     // Creates a red marker with the coffee icon
     preDefinedMarkers[m][b] = L.ExtraMarkers.icon({
       icon: iconMap[m][b]['icon'],
       markerColor: iconMap[m][b]['color'],
       shape: 'circle',
       prefix: 'fas',
       svg: true
     });
   }
}
