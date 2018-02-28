/**
 * @module ol/layer/Layer
 */
import {inherits} from "../index.js";
import BaseLayer from "../layer/Base.js";
import {assign} from "../obj.js";
import mapboxgl from "mapbox-gl/dist/mapbox-gl-dev.js";
import {getTransform} from "../proj";


const MapBox = function(options) {

  this.map_;
  this.baseOptions = assign({}, options);

  BaseLayer.call(this, /** @type {olx.layer.BaseOptions} */ (this.baseOptions));

  if (options.map) {
    this.setMap(options.map);
  }
};

inherits(MapBox, BaseLayer);


/**
 * Return `true` if the layer is visible, and if the passed resolution is
 * between the layer's minResolution and maxResolution. The comparison is
 * inclusive for `minResolution` and exclusive for `maxResolution`.
 * @param {ol.LayerState} layerState Layer state.
 * @param {number} resolution Resolution.
 * @return {boolean} The layer is visible at the given resolution.
 */
export function visibleAtResolution(layerState, resolution) {
  return layerState.visible && resolution >= layerState.minResolution &&
    resolution < layerState.maxResolution;
}


MapBox.prototype.initMap = function() {
  const transformToLatLng = getTransform("EPSG:3857", "EPSG:4326");
  const map = this.map_;
  const view = map.getView();
  const center = transformToLatLng(view.getCenter());

  const options = assign(this.baseOptions, {
    center,
    scrollZoom: false,
    dragPan: false,
    dragRotate: false,
    boxZoom: false,
    keyboard: false,
    doubleClickZoom: false,
    touchZoomRotate: false,
    container: map.getTargetElement(),
    zoom: view.getZoom() - 1
  });

  this.mbmap = new mapboxgl.Map(options);
  this.mbmap.on("load", () => {
    const viewport = document.getElementsByClassName('ol-viewport')[0];
    const mbcanvas = document.getElementsByClassName('mapboxgl-canvas')[0];
    viewport.insertBefore(mbcanvas, viewport.firstChild);
    [
      'mapboxgl-control-container'
    ].forEach( className => document.getElementsByClassName(className)[0].remove());
  });

  let centerLastRender = view.getCenter();
  let centerNextRender;
  let zoomLastRender = view.getZoom();
  let zoomNextRender;

  map.on('postrender', () => {
    // Update offset
    centerNextRender = view.getCenter();
    const lastRender = map.getPixelFromCoordinate(centerLastRender);
    const nextRender = map.getPixelFromCoordinate(centerNextRender);
    const centerOffset = [lastRender[0] - nextRender[0], lastRender[1] - nextRender[1]];
    zoomNextRender = view.getZoom();
    const zoomOffset = Math.pow(2, zoomNextRender - zoomLastRender);
    this.updateRenderedPosition(centerOffset, zoomOffset);

    // Re-render mbmap
    const center = transformToLatLng(centerNextRender);
    const zoom = view.getZoom() - 1;
    this.mbmap.jumpTo({
      center: center,
      zoom: zoom
    });
  });

  this.mbmap.on("render", () => {
    // Reset offset
    centerLastRender = centerNextRender;
    zoomLastRender = zoomNextRender;
    this.updateRenderedPosition([0, 0], 1);
  });
};

MapBox.prototype.updateRenderedPosition = function(centerOffset, zoomOffset) {
  const style = this.mbmap.getCanvas().style;
  style.left = Math.round(centerOffset[0]) + 'px';
  style.top = Math.round(centerOffset[1]) + 'px';
  style.transform = 'scale(' + zoomOffset + ')';
}

MapBox.prototype.setVisible = function(visible) {
  BaseLayer.prototype.setVisible.call(this, visible);

  const canvas = this.mbmap.getCanvas();
  canvas.style.display = visible ? 'block' : 'none';
};

MapBox.prototype.setOpacity = function(opacity) {
  BaseLayer.prototype.setOpacity.call(this, opacity);
  const canvas = this.mbmap.getCanvas();
  canvas.style.opacity = opacity;
};

MapBox.prototype.setZIndex = function(zindex) {
  BaseLayer.prototype.setZIndex.call(this, zindex);
  const canvas = this.mbmap.getCanvas();
  canvas.style.zIndex = zindex;
};

/**
 * @inheritDoc
 */
MapBox.prototype.getLayersArray = function(opt_array) {
  const array = opt_array ? opt_array : [];
  array.push(this);
  return array;
};


/**
 * @inheritDoc
 */
MapBox.prototype.getLayerStatesArray = function(opt_states) {
  const states = opt_states ? opt_states : [];
  states.push(this.getLayerState());
  return states;
};

/**
 * @private
 */
MapBox.prototype.handleSourcePropertyChange_ = function() {
  this.changed();
};

MapBox.prototype.setMap = function(map) {
  this.map_ = map;
  this.initMap();
};

MapBox.prototype.getMbMap = function() {
  return this.mbmap;
};

mapboxgl.Map.prototype._setupContainer = function _setupContainer () {
  var container = this._container;
  container.classList.add('mapboxgl-map');

  var canvasContainer = this._canvasContainer = container.firstChild;

  this._canvas = document.createElement('canvas');
  canvasContainer.insertBefore(this._canvas, canvasContainer.firstChild);
  this._canvas.style.position = 'absolute';
  this._canvas.addEventListener('webglcontextlost', this._contextLost, false);
  this._canvas.addEventListener('webglcontextrestored', this._contextRestored, false);
  this._canvas.setAttribute('tabindex', '0');
  this._canvas.setAttribute('aria-label', 'Map');
  this._canvas.className = 'mapboxgl-canvas';

  var dimensions = this._containerDimensions();
  this._resizeCanvas(dimensions[0], dimensions[1]);

  this._controlContainer = canvasContainer;
  var controlContainer = this._controlContainer = document.createElement('div');
  controlContainer.className = 'mapboxgl-control-container';
  container.appendChild(controlContainer);

  var positions = this._controlPositions = {};
  ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(function (positionName) {
    var elem = document.createElement('div');
    elem.className = "mapboxgl-ctrl-" + positionName;
    controlContainer.appendChild(elem);
    positions[positionName] = elem;
  });
};

export default MapBox;
