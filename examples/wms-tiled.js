import Map from "../src/ol/Map.js";
import View from "../src/ol/View.js";
import TileLayer from "../src/ol/layer/Tile.js";
import MapBox from "../src/ol/layer/MapBox";
import mapboxgl from "mapbox-gl/dist/mapbox-gl-dev.js";
import OLTileJSON from "../src/ol/source/TileJSON.js";
import Overlay from "../src/ol/Overlay.js";
import {get as getTransform} from "../src/ol/proj/transforms.js";

const layers = [];

const transformFromLatLng = getTransform("EPSG:4326", "EPSG:3857");
const transformToLatLng = getTransform("EPSG:3857", "EPSG:4326");

const map = new Map({
  layers: layers,
  target: 'map',
  renderer: 'mixed',
  view: new View({
    center: transformFromLatLng([6.5124174, 46.5284586]),
    maxZoom: 18,
    zoom: 11
  })
});

const mbLayer = new MapBox({
  map: map,
  container: map.getTarget(),
  style: 'data/sbm.json',

});

const  swisstopoBauzonenSource = new OLTileJSON({
  tileJSON: {
    "attribution": "&copy; swisstopo",
    "bounds": [
      5.140242,
      45.398181,
      11.47757,
      48.230651
    ],
    "id": "bauzonen",
    "maxzoom": 18,
    "minzoom": 0,
    "type": "raster",
    "tileSize": 256,
    "tiles": [
      "https://wmts.geo.admin.ch/1.0.0/ch.are.bauzonen/default/current/3857/{z}/{x}/{y}.png"
    ],
  }
});

const  swisstopoBoundariesSource = new OLTileJSON({
  tileJSON: {
    "attribution": "&copy; swisstopo",
    "bounds": [
      5.140242,
      45.398181,
      11.47757,
      48.230651
    ],
    "id": "bauzonen",
    "maxzoom": 18,
    "minzoom": 0,
    "type": "raster",
    "tileSize": 256,
    "tiles": [
      "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissboundaries3d-land-flaeche.fill/default/current/3857/{z}/{x}/{y}.png"
    ],
  }
});

map.addLayer(new TileLayer({
  opacity: 1,
  source: swisstopoBauzonenSource
}));

map.addLayer(new TileLayer({
  opacity: 1,
  source: swisstopoBoundariesSource
}));

/*
map.on('pointermove', (e) => {
  const point = new mapboxgl.Point(e.pixel[0], e.pixel[1]);
  const features = mbmap.queryRenderedFeatures(point);
  console.log(features);
});
*/


const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

const overlay = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});
closer.onclick = function() {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

map.getOverlays().push(overlay);

const mbmap = mbLayer.getMbMap();
let parkColor;

mbmap.on("load", () => {
  parkColor = mbmap.getPaintProperty('NationalPark', 'fill-color');
  mbmap.addLayer({
    "id": "river-hover",
    "type": "fill",
    "source": "swissbasemap",
    "source-layer": "swissbasemap-layer",
    "layout": {},
    "paint": {
      "fill-color": "blue",
      "fill-opacity": 1
    },
    "filter": ["==", "UUID", ""]
  });

});

mbmap.on('mouseenter', 'NationalPark', (e) => {
  mbmap.setPaintProperty('NationalPark', 'fill-color', 'red');
});
mbmap.on('mouseleave', 'NationalPark', (e) => {
  mbmap.setPaintProperty('NationalPark', 'fill-color', parkColor);
});

mbmap.on("mousemove", "GEWAESSER Fliessgewaesser PLY", function(e) {
  setMousePointer();
  mbmap.setFilter("river-hover", ["==", "UUID", e.features[0].properties.UUID]);
});

// Reset the state-fills-hover layer's filter when the mouse leaves the layer.
mbmap.on("mouseleave", "GEWAESSER Fliessgewaesser PLY", function() {
  removeMousePointer();
  mbmap.setFilter("river-hover", ["==", "UUID", ""]);
});

const displayPopup =  function (e) {
  const description = e.features[0].properties.layerid;
  content.innerHTML = `<p>${description}</p>`;
  overlay.setPosition(transformFromLatLng([e.lngLat.lng, e.lngLat.lat]));
};

const setMousePointer = function () {
  map.getTargetElement().style.cursor = 'pointer';
};
const removeMousePointer = function () {
  map.getTargetElement().style.cursor = '';
};

['OEV Einspur', 'OEV Mehrspur'].forEach((layer) => {
  mbmap.on('click', layer, displayPopup);
  mbmap.on('mouseenter', layer, setMousePointer);
  mbmap.on('mouseleave', layer, removeMousePointer);
});


const mbToggleButton = document.getElementById('mbToggle');
const mbOpacityButton = document.getElementById('mbOpacity');

mbToggleButton.addEventListener('click', function() {
  mbLayer.setVisible(!mbLayer.getVisible());
}, false);

mbOpacityButton.addEventListener('change', function(e) {
  mbLayer.setOpacity(parseFloat(this.value));
}, false);

const mbZIndexInput = document.getElementById('mbZIndex');
mbZIndexInput.onchange = function() {
  mbLayer.setZIndex(parseInt(this.value, 10) || 0);
};
mbZIndexInput.value = String(mbLayer.getZIndex());