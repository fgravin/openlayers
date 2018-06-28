/**
 * Created by fgravin on 6/28/18.
 */

import Person from './Men';
import Building from './House';
import MyType from './MyType';
import {MyOpt} from './Person';

/** @typedef {typeof import("./MyType")} MyType */



class Main {

  /**
   * @param {Building} building
   * @param {Person} person
   * @param {MyType} type
   * @param {MyOpt} option
   */
  constructor(person, building, type, option) {
    person.getName();
    building.getSize();
    person.getHeight(10);

    console.log(option.attributions);
    console.log(option.dumy);
    option.cacheSize = 'dumy'; 


    //person.getHeight(); ERROR
    //building.getType(); ERROR
    //building.toto(); ERROR
  }
}