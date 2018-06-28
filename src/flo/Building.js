/**
 * Created by fgravin on 6/28/18.
 */

/**
 *
 * @param {string} type
 * @constructor
 */
const Building = function(type) {
  /** @type {string} */
  this.type = type;
};

/**
 *
 * @returns {string}
 */
Building.prototype.getType = function() {
  return this.type;
};

export default Building;