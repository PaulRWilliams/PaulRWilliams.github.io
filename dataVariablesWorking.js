// * * * * * * * * * * * * * * * * * * * * * * * * * * * //
// Variables that are Dependent on Data
// Written by Kristi Potter
// 10/02/2021
// * * * * * * * * * * * * * * * * * * * * * * * * * * * //

// List of all the attribute types
let attributeTypes={"Building Type": [...new Set(data.map(d=>d["Building Type"]))],
                    "Client Type": [...new Set(data.map(d=>d["Client Type"]))] };

// Get the unique dates in the data
const distinctDates = [...new Set(data.map(d=>d.Date))].sort();
const dates = data.map( d=>d.Date);
const datesCount = _.countBy(dates);

// The current dates we're looking at
currentDates = [string2Date(distinctDates[0]-1), string2Date(distinctDates[distinctDates.length-1]+2)];

// The current types of markers we're looking at
currentTypes = Object.keys(mapMarkerDefinitions[currentAttribute]);

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
                                   "color": mapMarkerDefinitions[t][type]["color"],
                                   "label":type
                                   };
    }
    datesByAttribute[t][type]["data"] = data.filter(function(d) {return d[t] == type;});
  });
  attTypes.forEach(function(type, j){
    let tmp = _.countBy(datesByAttribute[t][type]["data"].map(d=>d.Date));
    datesByAttribute[t][type]["data"] = {}
    for( i in tmp){
      datesByAttribute[t][type]["data"][i]={"idx":j, "count":tmp[i], "color":mapMarkerDefinitions[t][type]["color"], "type":type};
    }
  });
}

// Create all of the marker layers on intialize
var markerClusterLayers = {};
for(d in data){

  // Add markers in both the buildings and client layers
  for(a in attributes){
    let att = attributes[a];
    if(!(att in markerClusterLayers))
      markerClusterLayers[att]={}

    let date = data[d]['Date'];
    let type = data[d][att];
    let color = mapMarkerDefinitions[att][data[d][att]].color;

    if(!(markerClusterLayers[att][date]))
      markerClusterLayers[att][date]={}

    if(!(markerClusterLayers[att][date][type]))
      markerClusterLayers[att][date][type]=L.markerClusterGroup({
        maxClusterRadius: 20,
        spiderfyOnMaxZoom:true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false,
        animate:false,
        iconCreateFunction: function(cluster) {
             var symbol = 'n';
             if(cluster.getChildCount() < 100)
                  symbol = cluster.getChildCount();
             return L.ExtraMarkers.icon({
               number: symbol,
               icon: 'fa-number',
               shape: 'star',
               markerColor: color,
               svg: true
              });
       },

     }).on('clusterclick',(a)=>(a.layer.spiderfy()));

    let lat = data[d]['Lat'];
    let lon = data[d]['Lon'];
    let marker = L.marker([lat,lon],
                          {icon: preDefinedMarkers[att][type]},
                          {title: data[d]['Name']});
    marker.data = data[d];
    marker.bindTooltip(makeLabel(data[d]));
    markerClusterLayers[att][date][type].addLayer(marker);
  }
}
console.log("MCL", markerClusterLayers);
