'use strict'

/**
 * Dependencies
 * @ignore
 */
const crypto = require('crypto')

/**
 * Constants
 * @ignore
 */
const BUFFER_LENGTH = 256

/**
 * Singletons
 * @ignore
 */
let random = null

/**
 * Dice
 *
 * @class
 * Pseudo-random dice simulator.
 */
class Dice {

  /**
   * Roll
   *
   * @description
   * Pseudo-random dice simulator. Returns the sum of the rolls as opposed to
   * the individual numbers.
   * 
   * @param  {string} dice - string representation of the number of and type of
   * dice to be rolled
   * @param {boolean} [max=false] - fudge maximum roll
   * @return {number} result of the roll.
   */
  static roll (dice, max=false) {
    if (!random) {
      random = new RandomBuffer()
    }

    if (dice && typeof dice === 'string') {
      let [num, mod] = dice.split('d')
      num = num === '' ? 1 : Number(num)
      mod = Number(mod)
      if (num && mod) {
        let sum = 0
        for (let i = 0; i < num; i++) {
          sum += max ? mod : random.read(mod)
        }
        return sum
      }
      
      return null
    }
  }

  /**
   * d6
   *
   * @description 
   * Roll a number of d6's
   * 
   * @param  {number} num - number of dice to roll.
   * @param {boolean} [max=false] - fudge maximum roll
   * @return {number} sum of the results of the rolls.
   */
  static d6 (num, max=false) {
    return Dice.roll((num || '') + 'd6', max)
  }

  /**
   * d8
   *
   * @description 
   * Roll a number of d8's
   * 
   * @param  {number} num - number of dice to roll.
   * @param {boolean} [max=false] - fudge maximum roll
   * @return {number} sum of the results of the rolls.
   */
  static d8 (num, max=false) {
    return Dice.roll((num || '') + 'd8', max)
  }

  /**
   * d10
   *
   * @description 
   * Roll a number of d10's
   * 
   * @param  {number} num - number of dice to roll.
   * @param {boolean} [max=false] - fudge maximum roll
   * @return {number} sum of the results of the rolls.
   */
  static d10 (num, max=false) {
    return Dice.roll((num || '') + 'd10', max)
  }

  /**
   * d12
   *
   * @description 
   * Roll a number of d12's
   * 
   * @param  {number} num - number of dice to roll.
   * @param {boolean} [max=false] - fudge maximum roll
   * @return {number} sum of the results of the rolls.
   */
  static d12 (num, max=false) {
    return Dice.roll((num || '') + 'd12', max)
  }

  /**
   * d20
   *
   * @description 
   * Roll a number of d20's
   * 
   * @param  {number} num - number of dice to roll.
   * @param {boolean} [max=false] - fudge maximum roll
   * @return {number} sum of the results of the rolls.
   */
  static d20 (num, max=false) {
    return Dice.roll((num || '') + 'd20', max)
  }

  /**
   * d100
   *
   * @description 
   * Roll a number of d100's
   * 
   * @param  {number} num - number of dice to roll.
   * @param {boolean} [max=false] - fudge maximum roll
   * @return {number} sum of the results of the rolls.
   */
  static d100 (num, max) {
    return Dice.roll((num || '') + 'd100', max)
  }

}

/**
 * RandomBuffer
 * 
 * @class
 * An abstraction of the crypto.randomBytes API for use in dice simulation.
 */
class RandomBuffer {

  constructor () {
    this.reset()
  }

  reset () {
    this.idx = 0
    this.buf = crypto.randomBytes(BUFFER_LENGTH)
  }

  /**
   * Read
   *
   * @description
   * Read a random value between 1-mod or 0-255 if mod is unspecified.
   * 
   * @param  {number} mod - Inclusive maximum value.
   * @return {number} A random value between 1-mod or 0-255 if mod is unspecified.
   */
  read (mod) {
    if (this.idx < BUFFER_LENGTH) {
      let rand = this.buf.readUInt8(this.idx)
      this.idx += 1

      return mod && typeof mod === 'number'
        ? (rand % mod) + 1
        : rand

    } else {
      this.reset()
      return this.read(mod)
    }
  }
}

/**
 * Exports
 * @ignore
 */
module.exports = Dice