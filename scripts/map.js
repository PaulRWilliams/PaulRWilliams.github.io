// * * * * * * * * * * * * * * * * * * * * * * * * * * * //
// Map Definitions
// Written by Kristi Potter
// 10/02/2021
// * * * * * * * * * * * * * * * * * * * * * * * * * * * //

const defaultView = [17.8622043251, -90.0353411];
let defaultZoom = 2;

// --- Create the map the div #map --- //
var map = L.map('map',
                {zoomControl: false,
                 minZoom: 1,
                 worldCopyJump: false})
                .setView(defaultView, defaultZoom);
map.on("popupopen", function(evt){currentPopup = evt.popup});

const popup = new L.Popup({
  closeButton: true,
  offset: new L.Point(0.5, -24)
});

// Resize the map when it's containing DOM changes size
const resizeObserver = new ResizeObserver(() => {
  map.invalidateSize();
});
const mapDiv = document.getElementById("map");
resizeObserver.observe(mapDiv);

// Add the tile layer
// Tile options: https://carto.com/help/building-maps/basemap-list/
let tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png').addTo(map);

// Create a home and fit to marker bounds button
L.Control.zoomHome = L.Control.extend({
    options: {
        position: 'topleft',
        zoomInText: '<i class="fa fa-plus" style="line-height:1.65;"></i>',
        zoomInTitle: 'Zoom in',
        zoomOutText: '<i class="fa fa-minus" style="line-height:1.65;"></i>',
        zoomOutTitle: 'Zoom out',
        zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
        zoomHomeTitle: 'Camera home',
        zoomBoundsTitle: 'Zoom to Marker Bounds',
        zoomBoundsText: '<i class="fa fa-draw-polygon" style="line-height:1.65;"></i>',
    },
    onAdd: function (map) {
        var controlName = 'gin-control-zoom',
            container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
            options = this.options;
        this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
        controlName + '-in', container, this._zoomIn);
        this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
        controlName + '-home', container, this._zoomHome);
        this._zoomBoundsButton = this._createButton(options.zoomBoundsText, options.zoomBoundsTitle,
        controlName + '-bounds', container, this._zoomBounds);
        this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
        controlName + '-out', container, this._zoomOut);

        this._updateDisabled();
        map.on('zoomend zoomlevelschange', this._updateDisabled, this);

        return container;
    },

    onRemove: function (map) {
        map.off('zoomend zoomlevelschange', this._updateDisabled, this);
    },

    _zoomIn: function (e) {
        this._map.zoomIn(e.shiftKey ? 3 : 1);
    },

    _zoomOut: function (e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },

    _zoomHome: function (e) {
        map.setView(defaultView, defaultZoom);
    },
    _zoomBounds: function (e) {
        map.fitBounds(bounds, { padding: [5, 5] });
    },

    _createButton: function (html, title, className, container, fn) {
        var link = L.DomUtil.create('a', className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', fn, this)
            .on(link, 'click', this._refocusOnMap, this);

        return link;
    },

    _updateDisabled: function () {
        var map = this._map,
            className = 'leaflet-disabled';

        L.DomUtil.removeClass(this._zoomInButton, className);
        L.DomUtil.removeClass(this._zoomOutButton, className);

        if (map._zoom === map.getMinZoom()) {
            L.DomUtil.addClass(this._zoomOutButton, className);
        }
        if (map._zoom === map.getMaxZoom()) {
            L.DomUtil.addClass(this._zoomInButton, className);
        }
    }
});

// add the new control to the map
var zoomHome = new L.Control.zoomHome();
zoomHome.addTo(map);

// Marker-icons for each client or building tyoe (Relies in iconMap.js
let preDefinedMarkers={}
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

// Create the marker groups by type
let markerGroups = {};
for(let att in iconMap){
  markerGroups[att] = {};
  for(let type in iconMap[att]){
    let color = iconMap[att][type]['color'];
    markerGroups[att][type] = L.markerClusterGroup({
      maxClusterRadius: 20,
      spiderfyOnMaxZoom:true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
      animate:false,
      iconCreateFunction: function(cluster) {
          //console.log("cluster", cluster);
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
  }
}

// Create all of the marker layers on intialize
var markerClusterArrays = {};
for(d in data){

  // Add markers in both the buildings and client layers
  for(a in attributes){
    let att = attributes[a];
    if(!(att in markerClusterArrays))
      markerClusterArrays[att]={}

    let date = data[d]['Date'];
    let type = data[d][att];
    let color = iconMap[att][data[d][att]].color;

    if(!(markerClusterArrays[att][date]))
      markerClusterArrays[att][date]={}
    if(!(markerClusterArrays[att][date][type]))
      markerClusterArrays[att][date][type]=[];

    let lat = data[d]['Lat'];
    let lon = data[d]['Lon'];
    let marker = L.marker([lat,lon],
                          {icon: preDefinedMarkers[att][type]},
                          {title: data[d]['Name']}).on('click',function(e) {
                            let marker = e.target;
                            popup.setContent(marker.desc);
                            popup.setLatLng([marker.data.Lat, marker.data.Lon]);//marker.getLatLng());
                            map.openPopup(popup);

                            // Scroll the table to this row
                            scroll2Row(marker);
                          });;
    marker.data = data[d];
    marker.index = parseInt(d);
    marker.desc =
    marker.bindTooltip(data[d]['Name']);
    marker.desc = makeLabel(data[d]);
    markerClusterArrays[att][date][type].push(marker);
  }
}

function updateMap(){

  // Remove all layers
  if(currentMarkers.length > 0){
       map.eachLayer((layer) => {
         if(layer._url === undefined)
           layer.remove();
       });
       currentMarkers = [];
  }

  // Filter the data by the current dates and types
  // Get the markers layers to add, filtered by date
  var filteredByDates = _.pickBy(markerClusterArrays[currentAttribute], function(value, key) {
     return date2Int(currentDates[0]) <= key && key <= date2Int(currentDates[1]);
  });

  // Get the marker layers to add, filtered by type
  var filteredByType = {};
  for(let f in filteredByDates) {
     let types = _.pickBy(filteredByDates[f], function(value, key){
      return currentTypes.indexOf(key) > -1;
     });
     if(Object.keys(types).length > 0)
       filteredByType[f] = types;
  }

  // Create and add the subgroups
   for(let date in filteredByType){
     for (let type in filteredByType[date]){
       let mySubGroup = L.featureGroup.subGroup(markerGroups[currentAttribute][type], filteredByType[date][type]);
       currentMarkers.push(filteredByType[date][type]);
       mySubGroup.addTo(map);
    }
   }

   // Add the marker groups
   let bounds = undefined;
   for(let t in currentTypes){
     let type = currentTypes[t];

     markerGroups[currentAttribute][type].addTo(map);
     if(bounds === undefined)
       bounds = markerGroups[currentAttribute][type].getBounds();
     else
       bounds.extend(markerGroups[currentAttribute][type].getBounds());
   }

   // Set the bounds around the currently displayed markers
   markerBounds = bounds;

   // If this is the first time we run, save the bounds
   if(initState){
     defaultBounds = bounds;

     //map.fitBounds(defaultBounds);
     initState = false;
   }

   // Update the list of data
   updateList();
}
