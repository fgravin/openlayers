/**
 * @module ol/renderer/canvas/Map
 */
// FIXME offset panning

import _ol_transform_ from '../../transform.js';
import {inherits} from '../../index.js';
import {stableSort} from '../../array.js';
import {CLASS_UNSELECTABLE} from '../../css.js';
import {createCanvasContext2D} from '../../dom.js';
import {visibleAtResolution} from '../../layer/Layer.js';
import RenderEvent from '../../render/Event.js';
import RenderEventType from '../../render/EventType.js';
import {rotateAtOffset} from '../../render/canvas.js';
import CanvasImmediateRenderer from '../../render/canvas/Immediate.js';
import MapRenderer, {sortByZIndex} from '../Map.js';
import RendererType from '../Type.js';
import SourceState from '../../source/State.js';
import ContextManager from './ContextManager.js';

/**
 * @constructor
 * @extends {ol.renderer.Map}
 * @param {Element} container Container.
 * @param {ol.PluggableMap} map Map.
 * @api
 */
const MixedMapRenderer = function(container, map) {

  MapRenderer.call(this, container, map);

  this.contextManager_ = new ContextManager();

  /**
   * @private
   * @type {ol.Transform}
   */
  this.transform_ = _ol_transform_.create();

};

inherits(MixedMapRenderer, MapRenderer);


/**
 * Determine if this renderer handles the provided layer.
 * @param {ol.renderer.Type} type The renderer type.
 * @return {boolean} The renderer can render the layer.
 */
MixedMapRenderer['handles'] = function(type) {
  return type === RendererType.MIXED;
};


/**
 * Create the map renderer.
 * @param {Element} container Container.
 * @param {ol.PluggableMap} map Map.
 * @return {ol.renderer.canvas.Map} The map renderer.
 */
MixedMapRenderer['create'] = function(container, map) {
  return new MixedMapRenderer(container, map);
};


/**
 * @param {ol.render.EventType} type Event type.
 * @param {olx.FrameState} frameState Frame state.
 * @private
 */
MixedMapRenderer.prototype.dispatchComposeEvent_ = function(type, frameState) {
  const map = this.getMap();
  const context = this.context_;
  if (map.hasListener(type)) {
    const extent = frameState.extent;
    const pixelRatio = frameState.pixelRatio;
    const viewState = frameState.viewState;
    const rotation = viewState.rotation;

    const transform = this.getTransform(frameState);

    const vectorContext = new CanvasImmediateRenderer(context, pixelRatio,
      extent, transform, rotation);
    const composeEvent = new RenderEvent(type, vectorContext,
      frameState, context, null);
    map.dispatchEvent(composeEvent);
  }
};


/**
 * @param {olx.FrameState} frameState Frame state.
 * @protected
 * @return {!ol.Transform} Transform.
 */
MixedMapRenderer.prototype.getTransform = function(frameState) {
  const viewState = frameState.viewState;
  const dx1 = this.canvas_.width / 2;
  const dy1 = this.canvas_.height / 2;
  const sx = frameState.pixelRatio / viewState.resolution;
  const sy = -sx;
  const angle = -viewState.rotation;
  const dx2 = -viewState.center[0];
  const dy2 = -viewState.center[1];
  return _ol_transform_.compose(this.transform_, dx1, dy1, sx, sy, angle, dx2, dy2);
};


/**
 * @inheritDoc
 */
MixedMapRenderer.prototype.getType = function() {
  return RendererType.MIXED;
};


/**
 * @inheritDoc
 */
MixedMapRenderer.prototype.renderFrame = function(frameState) {

  if (!frameState) {
    if (this.renderedVisible_) {
      this.contextManager_.hide();
      this.renderedVisible_ = false;
    }
    return;
  }

  const pixelRatio = frameState.pixelRatio;
  const width = Math.round(frameState.size[0] * pixelRatio);
  const height = Math.round(frameState.size[1] * pixelRatio);
  this.contextManager_.clear(width, height);


  const rotation = frameState.viewState.rotation;
  this.calculateMatrices2D(frameState);
  this.dispatchComposeEvent_(RenderEventType.PRECOMPOSE, frameState);

  const layerStatesArray = frameState.layerStatesArray;
  stableSort(layerStatesArray, sortByZIndex);

  if (rotation) {
    this.contextManager_.save();
    // rotateAtOffset(context, rotation, width / 2, height / 2);
  }

  const viewResolution = frameState.viewState.resolution;
  let i, ii, layer, layerRenderer, layerState;
  for (i = 0, ii = layerStatesArray.length; i < ii; ++i) {
    layerState = layerStatesArray[i];
    layer = layerState.layer;
    layerRenderer = (this.getLayerRenderer(layer));
    if (!visibleAtResolution(layerState, viewResolution) ||
        layerState.sourceState != SourceState.READY) {
      continue;
    }
    const context = this.contextManager_.getContext(layerRenderer);
    layerRenderer.mapRenderer = context;
    if (layerRenderer.prepareFrame(frameState, layerState,context.context)) {
      layerRenderer.composeFrame(frameState, layerState, context.context);
    }
  }

  if (rotation) {
    this.contextManager_.restore();
  }

  this.dispatchComposeEvent_(RenderEventType.POSTCOMPOSE, frameState);

  if (!this.renderedVisible_) {
    this.contextManager_.show();
    this.renderedVisible_ = true;
  }

  this.scheduleRemoveUnusedLayerRenderers(frameState);
  this.scheduleExpireIconCache(frameState);
};


export default MixedMapRenderer;
