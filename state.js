// * * * * * * * * * * * * * * * * * * * * * * * * * * * //
// State Variables Containing Current State
// Written by Kristi Potter
// 10/02/2021
// * * * * * * * * * * * * * * * * * * * * * * * * * * * //

// The current attribute type we're looking at
let currentAttribute = "Building Type";

// The current dates we're looking at
let currentDates = undefined;

// The current types of markers we're looking at
let currentTypes = undefined

// The current data for the list
let currentData = undefined;

// The current makerLayers
let currentMarkers = [];

// The current popup for hovering
var currentPopup;

// The current map zoom
var currentMapZoom;

var initState = true;

// Toggle the open table in new window button
var openWindowButtonClicks = 0;

// The new window we create for the table
var newWindow = undefined;

// Toggle the cluster button
var clusterButtonClicks = 0;

// Constant dimension variables for timeline
const margin = {top: 12, right: 25, bottom: 5, left: 10},
      padding = {top: 10, right: 10, bottom: 10, left: 10};
const startX = margin.left,
      startY = margin.top,
      startInX = startX + padding.left,
      startInY = startY + padding.top;

// Dimension variables that depend on the window size >>> These change in timelineSizeChange
var outerWidth, outerHeight, innerWidth, innerHeight,
    width, height;
var endX, endY, endInX, endInY, aspect;
