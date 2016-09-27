'use strict'

/**
 * Module Dependencies
 * @ignore
 */
const Dice = require('./Dice')

/**
 * Bonus
 *
 * @class
 * Bonus parser and evalutator.
 */
class Bonus {

  /**
   * Constructor
   * 
   * @param  {string|object} descriptor - Either the name of the bonus or a
   * descriptor object containing those details. If 'descriptor' is an object,
   * then the second argument is ignored.
   * @param  {string} bonus - bonus string.
   */
  constructor (descriptor, bonus) {
    function invalid () {
      throw new Error ('Bonus descriptor is invalid')
    }

    if (typeof descriptor === 'object') {
      if (Array.isArray(descriptor)) {
        invalid()
      }

      bonus = descriptor['bonus']
      descriptor = descriptor['type'] || descriptor['name']
    }

    if (descriptor && bonus) {
      this.type = descriptor
      this.bonus = bonus
    } else {
      invalid()
    }
  }

  /** 
   * @param {boolean} [max=false] - fudge maximum roll
   * @return {Object} evaluated bonus
   */
  evaluate (max=false) {
    return {
      type: this.type,
      value: Bonus.parse(this.bonus, max)
    }
  }

  /**
   * Parse Bonus
   *
   * @description
   * Parses and evaluates a bonus string
   * 
   * @param  {!funtion} bonus - a bonus, or collection of bonuses.
   * @param {boolean} [max=false] - fudge maximum roll
   * @return {number} evaluated bonus value
   */
  static parse (bonus, max=false) {
    if (typeof bonus === 'number') {
      return bonus
    } else if (typeof bonus === 'string') {
      let staticBonus = Number(bonus)
      if (staticBonus) {
        return staticBonus
      }

      if (bonus.indexOf('d') > -1) {
        return Dice.roll(bonus, max)
      }  
    } else if (typeof bonus === 'object') {
      let sum = 0
      
      if (Array.isArray(bonus)) {
        bonus.forEach(item => {
          sum += Bonus.parse(item)
        })
      } else {
        Object.keys(bonus).forEach(key => {
          sum += Bonus.parse(bonus[key])
        })
      }
      return sum
    }

    throw new Error('Invalid bonus syntax')
  }

}

/**
 * Exports
 * @ignore
 */
module.exports = Bonus