/**
 * @module ol/renderer/mixed/CanvasContext
 */
import {inherits} from '../../index.js';
import Context from './Context';
import {createCanvasContext2D} from "../../dom.js";
import {CLASS_UNSELECTABLE} from "../../css.js";

/**
 * @constructor
 * @extends {ol.renderer.Map}
 * @param {Element} container Container.
 * @param {ol.PluggableMap} map Map.
 * @api
 */
const CanvasContext = function(container, map) {

  Context.call(this);


  this.context = createCanvasContext2D();
  this.canvas_ = this.context.canvas;

  const viewport = document.getElementsByClassName('ol-viewport')[0];
  this.canvas_.style.width = '100%';
  this.canvas_.style.height = '100%';
  this.canvas_.style.position = 'absolute';
  this.canvas_.style.display = 'block';
  this.canvas_.className = CLASS_UNSELECTABLE;
  viewport.insertBefore(this.canvas_, viewport.childNodes[0] || null);

};

inherits(CanvasContext, Context);

CanvasContext.prototype.clear = function(width, height) {
  if (this.canvas_.width != width || this.canvas_.height != height) {
    this.canvas_.width = width;
    this.canvas_.height = height;
  } else {
    this.context.clearRect(0, 0, width, height);
  }
};


export default CanvasContext;
