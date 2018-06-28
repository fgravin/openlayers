/**
 * Created by fgravin on 6/28/18.
 */
import Building from './Building';
import {inherits } from '../ol/util';

/**
 *
 * @param {string} type
 * @constructor
 */
const House = function(type) {
  Building.call(this, type)
};

/**
 *
 * @returns {string}
 */
House.prototype.getSize = function() {
  return 'size';
};

inherits(House, Building);

export default House;