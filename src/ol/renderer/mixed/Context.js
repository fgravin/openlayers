/**
 * @module ol/renderer/canvas/Map
 */
// FIXME offset panning
import {inherits} from "../../index.js";
import Disposable from "../../Disposable.js";

/**
 * @constructor
 * @extends {ol.renderer.Map}
 * @param {Element} container Container.
 * @param {ol.PluggableMap} map Map.
 * @api
 */
const Context = function() {

  Disposable.call(this);

  /**
   * @private
   * @type {boolean}
   */
  this.renderedVisible_ = true;

  this.context;
  this.canvas_;
};

inherits(Context, Disposable);


Context.prototype.hide = function() {
  this.canvas_.style.display = 'none';
};
Context.prototype.show = function() {
  this.canvas_.style.display = '';
};
Context.prototype.save = function() {
  this.context.save();
};
Context.prototype.restore = function() {
  this.restore.save();
};
Context.prototype.clear;

export default Context;
