/**
 * @module ol/layer/Layer
 */
import {listen, unlistenByKey} from '../events.js';
import EventType from '../events/EventType.js';
import {getUid, inherits} from '../index.js';
import BaseObject from '../Object.js';
import BaseLayer from '../layer/Base.js';
import LayerProperty from '../layer/Property.js';
import {assign} from '../obj.js';
import RenderEventType from '../render/EventType.js';
import SourceState from '../source/State.js';
import mapboxgl from 'mapbox-gl';
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
    container: map.getTargetElement(),
    zoom: view.getZoom() - 1
  });

  this.mbmap = new mapboxgl.Map(options);
  this.mbmap.on("load", () => {
    const viewport = document.getElementsByClassName('ol-viewport')[0];
    const mbcanvas = document.getElementsByClassName('mapboxgl-canvas')[0];
    viewport.insertBefore(mbcanvas, viewport.firstChild);
    [ 'mapboxgl-missing-css',
      'mapboxgl-control-container',
      'mapboxgl-canvas-container',
    ].forEach( className => document.getElementsByClassName(className)[0].remove());
  });

  map.on('precompose', () => {
    const center = transformToLatLng(view.getCenter());
    const zoom = view.getZoom() - 1;
    this.mbmap.jumpTo({
      center: center,
      zoom: zoom
    });
    console.log('move mapbox');
  });
  window.mbmap = this.mbmap;
};

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

export default MapBox;
