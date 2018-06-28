/**
 * Created by fgravin on 6/28/18.
 */


/**
 * @typedef {Object} MyOpt
 * @property {number} [attributions] Attributions.
 * @property {number} [cacheSize=2048] Cache size.
**/
export let MyOpt;

export default class {

  /** @type {string} */
  name;

  /**
   * @constructor
   * @param {string} name
   * @param {MyOpt} option
   */
  constructor(name, option) {
    this.name = name;
    console.log(option.attributions);
    //console.log(option.dumy); ERROR
    //option.cacheSize = 'dumy'; ERROR
  };

  getName() {
    return this.name;
  }
}