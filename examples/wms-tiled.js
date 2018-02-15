import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';
import TileWMS from '../src/ol/source/TileWMS.js';


const layers = [
  new TileLayer({
    extent: [-13884991, 2870341, -7455066, 6338219],
    renderer: 'canvas',
    source: new TileWMS({
      url: 'https://ahocevar.com/geoserver/wms',
      params: {'LAYERS': 'topp:states', 'TILED': true},
      serverType: 'geoserver',
      // Countries have transparency, so do not fade tiles:
      transition: 0
    })
  }),
  new TileLayer({
    renderer: 'webgl',
    source: new OSM()
  })
];
const map = new Map({
  layers: layers,
  target: 'map',
  renderer: 'webgl',
  view: new View({
    center: [-10997148, 4569099],
    zoom: 4
  })
});
