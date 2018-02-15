/**
 WebglContext */
import {inherits} from '../../index.js';
import Context from './Context';
import {createCanvasContext2D} from "../../dom.js";
import {CLASS_UNSELECTABLE} from "../../css.js";
import {inherits} from '../../index.js';
import {stableSort} from '../../array.js';
import {listen} from '../../events.js';
import {WEBGL} from '../../has.js';
import Layer from '../../layer/Layer.js';
import RenderEvent from '../../render/Event.js';
import RenderEventType from '../../render/EventType.js';
import WebGLImmediateRenderer from '../../render/webgl/Immediate.js';
import MapRenderer, {sortByZIndex} from '../Map.js';
import RendererType from '../Type.js';
import SourceState from '../../source/State.js';
import LRUCache from '../../structs/LRUCache.js';
import PriorityQueue from '../../structs/PriorityQueue.js';
import _ol_webgl_ from '../../webgl.js';
import WebGLContext from '../../webgl/Context.js';
import ContextEventType from '../../webgl/ContextEventType.js';

/**
 * @constructor
 * @api
 */
const WebglContext = function() {

  Context.call(this);

  const viewport = document.getElementsByClassName('ol-viewport')[0];

  /**
   * @private
   * @type {HTMLCanvasElement}
   */
  this.canvas_ = /** @type {HTMLCanvasElement} */
    (document.createElement('CANVAS'));
  this.canvas_.style.width = '100%';
  this.canvas_.style.height = '100%';
  this.canvas_.style.display = 'block';
  this.canvas_.className = CLASS_UNSELECTABLE;
  viewport.insertBefore(this.canvas_, viewport.childNodes[0] || null);

  /**
   * @private
   * @type {number}
   */
  this.clipTileCanvasWidth_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.clipTileCanvasHeight_ = 0;

  /**
   * @private
   * @type {CanvasRenderingContext2D}
   */
  this.clipTileContext_ = createCanvasContext2D();

  /**
   * @private
   * @type {boolean}
   */
  this.renderedVisible_ = true;

  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  this.gl_ = _ol_webgl_.getContext(this.canvas_, {
    antialias: true,
    depth: true,
    failIfMajorPerformanceCaveat: true,
    preserveDrawingBuffer: false,
    stencil: true
  });

  /**
   * @private
   * @type {ol.webgl.Context}
   */
  this.context = new WebGLContext(this.canvas_, this.gl_);

  listen(this.canvas_, ContextEventType.LOST,
    this.handleWebGLContextLost, this);
  listen(this.canvas_, ContextEventType.RESTORED,
    this.handleWebGLContextRestored, this);
  /**
   * @private
   * @type {ol.structs.LRUCache.<ol.WebglTextureCacheEntry|null>}
   */
  this.textureCache_ = new LRUCache();

  /**
   * @private
   * @type {ol.Coordinate}
   */
  this.focus_ = null;

  /**
   * @private
   * @type {ol.structs.PriorityQueue.<Array>}
   */
  this.tileTextureQueue_ = new PriorityQueue(
    /**
     * @param {Array.<*>} element Element.
     * @return {number} Priority.
     * @this {ol.renderer.webgl.Map}
     */
    (function(element) {
      const tileCenter = /** @type {ol.Coordinate} */ (element[1]);
      const tileResolution = /** @type {number} */ (element[2]);
      const deltaX = tileCenter[0] - this.focus_[0];
      const deltaY = tileCenter[1] - this.focus_[1];
      return 65536 * Math.log(tileResolution) +
        Math.sqrt(deltaX * deltaX + deltaY * deltaY) / tileResolution;
    }).bind(this),
    /**
     * @param {Array.<*>} element Element.
     * @return {string} Key.
     */
    function(element) {
      return /** @type {ol.Tile} */ (element[0]).getKey();
    });


  /**
   * @param {ol.PluggableMap} map Map.
   * @param {?olx.FrameState} frameState Frame state.
   * @return {boolean} false.
   * @this {ol.renderer.webgl.Map}
   */
  this.loadNextTileTexture_ =
    function(map, frameState) {
      if (!this.tileTextureQueue_.isEmpty()) {
        this.tileTextureQueue_.reprioritize();
        const element = this.tileTextureQueue_.dequeue();
        const tile = /** @type {ol.Tile} */ (element[0]);
        const tileSize = /** @type {ol.Size} */ (element[3]);
        const tileGutter = /** @type {number} */ (element[4]);
        this.bindTileTexture(
          tile, tileSize, tileGutter, _ol_webgl_.LINEAR, _ol_webgl_.LINEAR);
      }
      return false;
    }.bind(this);


  /**
   * @private
   * @type {number}
   */
  this.textureCacheFrameMarkerCount_ = 0;

  this.initializeGL_();

};

inherits(WebglContext, Context);


/**
 * @param {ol.events.Event} event Event.
 * @protected
 */
WebglContext.prototype.handleWebGLContextLost = function(event) {
  event.preventDefault();
  this.textureCache_.clear();
  this.textureCacheFrameMarkerCount_ = 0;

  const renderers = this.getLayerRenderers();
  for (const id in renderers) {
    const renderer = /** @type {ol.renderer.webgl.Layer} */ (renderers[id]);
    renderer.handleWebGLContextLost();
  }
};


/**
 * @protected
 */
WebglContext.prototype.handleWebGLContextRestored = function() {
  this.initializeGL_();
  this.getMap().render();
};


/**
 * @private
 */
WebglContext.prototype.initializeGL_ = function() {
  const gl = this.gl_;
  gl.activeTexture(_ol_webgl_.TEXTURE0);
  gl.blendFuncSeparate(
    _ol_webgl_.SRC_ALPHA, _ol_webgl_.ONE_MINUS_SRC_ALPHA,
    _ol_webgl_.ONE, _ol_webgl_.ONE_MINUS_SRC_ALPHA);
  gl.disable(_ol_webgl_.CULL_FACE);
  gl.disable(_ol_webgl_.DEPTH_TEST);
  gl.disable(_ol_webgl_.SCISSOR_TEST);
  gl.disable(_ol_webgl_.STENCIL_TEST);
};

WebglContext.prototype.getContext = function() {
  return this.context;
};
/**
 * @return {WebGLRenderingContext} GL.
 */
WebglContext.prototype.getGL = function() {
  return this.gl_;
};


/**
 * @return {ol.structs.PriorityQueue.<Array>} Tile texture queue.
 */
WebglContext.prototype.getTileTextureQueue = function() {
  return this.tileTextureQueue_;
};


/**
 * @inheritDoc
 */
WebglContext.prototype.getType = function() {
  return RendererType.WEBGL;
};
WebglContext.prototype.clear = function(width, height) {
  if (this.canvas_.width != width || this.canvas_.height != height) {
    this.canvas_.width = width;
    this.canvas_.height = height;
  }
};

/**
 * @param {ol.Tile} tile Tile.
 * @return {boolean} Is tile texture loaded.
 */
WebglContext.prototype.isTileTextureLoaded = function(tile) {
  return this.textureCache_.containsKey(tile.getKey());
};

export default WebglContext;
