/**
 * @module ol/renderer/canvas/Map
 */
// FIXME offset panning

import _ol_transform_ from '../../transform.js';
import {stableSort} from '../../array.js';
import {CLASS_UNSELECTABLE} from '../../css.js';
import {createCanvasContext2D} from '../../dom.js';
import {visibleAtResolution} from '../../layer/Layer.js';
import RenderEvent from '../../render/Event.js';
import RenderEventType from '../../render/EventType.js';
import {rotateAtOffset} from '../../render/canvas.js';
import IntermediateCanvas from '../canvas/IntermediateCanvas';
import WebGLLayerRenderer from '../webgl/Layer';
import CanvasContext from './CanvasContext';
import WebglContext from './WebglContext';
import MapRenderer, {sortByZIndex} from '../Map.js';
import RendererType from '../Type.js';
import SourceState from '../../source/State.js';
import {getUid, inherits, nullFunction} from '../../index.js';
import Disposable from "../../Disposable.js";

/**
 * @constructor
 * @api
 */
const ContextManager = function() {

  Disposable.call(this);

  this.pool_ = {};

};

inherits(ContextManager, Disposable);


ContextManager.prototype.getContext = function(layerRenderer, layer) {
  const layerKey = getUid(layerRenderer).toString();
  if (layerKey in this.pool_) {
    return this.pool_[layerKey];
  } else {
    if (layerRenderer instanceof IntermediateCanvas) {
      const context = new CanvasContext(layer);
      this.pool_[layerKey] = context;
      return context;
    }
    else if (layerRenderer instanceof WebGLLayerRenderer) {
      return null;
      const context = new WebglContext(layer);
      this.pool_[layerKey] = context;
      return context;
    }
  }
};

ContextManager.prototype.show = function() {
  for(let id in this.pool_) {
    const context = this.pool_[id];
    context.show();
  }
};
ContextManager.prototype.hide = function() {
  for(let id in this.pool_) {
    const context = this.pool_[id];
    context.hide();
  }
};
ContextManager.prototype.clear = function(width, height) {
  for(let id in this.pool_) {
    const context = this.pool_[id];
    context.clear(width, height);
  }
};
ContextManager.prototype.save = function() {
  for(let id in this.pool_) {
    const context = this.pool_[id];
    context.save();
  }
};
ContextManager.prototype.restore = function() {
  for(let id in this.pool_) {
    const context = this.pool_[id];
    context.restore();
  }
};


export default ContextManager;
