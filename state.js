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

// Constant dimension variables for timeline
const margin = {top: 15, right: 25, bottom: 25, left: 10},
      padding = {top: 15, right: 175, bottom: 45, left: 10};
const startX = margin.left,
      startY = margin.top,
      startInX = startX + padding.left,
      startInY = startY + padding.top;

// Dimension variables that depend on the window size >>> These change in timelineSizeChange
var outerWidth, outerHeight, innerWidth, innerHeight,
    width, height;
var endX, endY, endInX, endInY, aspect;
