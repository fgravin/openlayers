/**
 * Created by fgravin on 6/28/18.
 */

import Person from './Person';

export default class extends Person {

  /**
   * @constructor
   * @param {string} name
   */
  constructor(name) {
    super(name, null);
  };

  /**
   * @param {number} size
   * @returns {number}
   */
  getHeight(size) {
    return 180 + size;
  }
}