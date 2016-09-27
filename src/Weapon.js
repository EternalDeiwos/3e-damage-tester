'use strict'

/**
 * Module Dependencies
 * @ignore
 */
const Bonus = require('./Bonus')
const Dice = require('./Dice')

/**
 * Weapon
 *
 * @class
 * Represents all aspects of a weapon.
 */
class Weapon {

  /**
   * Constructor
   * 
   * @param  {Object} [descriptor] - descriptor of the weapon.
   */
  constructor (descriptor) {
    let {name, critRange, critMultiplier, enchant, bonus, damage} = descriptor

    this.name = name || 'Unnamed Weapon'
    this.minCrit = critRange || 19
    this.critMultiplier = critMultiplier || 2
    this.enchantments = Array.isArray(enchant) 
      ? enchant.map(e => { return new Bonus(e) }) 
      : []
    this.bonuses = Array.isArray(bonus) 
      ? bonus.map(b => { return new Bonus(b) }) 
      : []
    this.damage = damage || '1d4'
    this.numCrits = 0
  }

  /**
   * Attack
   *
   * @description
   * Simulate an attack
   *
   * @param {boolean} [max=false] - fudge maximum roll
   * @param {boolean} [crit=false] - fudge critical rolls
   * @return {object} A dictionary of damage type and amount caused.
   */
  attack (max=false, crit=false) {
    let result = {}
    let attackRoll = Dice.d20(1, max || crit)
    let multiplier = attackRoll >= this.minCrit ? this.critMultiplier : 1

    if (multiplier > 1 && !crit && !max) {
      this.numCrits += 1
    }

    function damage (dmg) {
      return dmg * multiplier
    }

    result['Physical'] = damage(Dice.roll(this.damage, max))

    function evaluateBonuses (bonuses) {
      bonuses.forEach(bonus => {
        let {type, value} = bonus.evaluate(max)
        if (result[type]) {
          result[type] += damage(value)
        } else {
          result[type] = damage(value)
        }
      })
    }

    evaluateBonuses(this.enchantments)
    evaluateBonuses(this.bonuses)

    return result
  }

  /**
   * Critical Range
   *
   * @description 
   * Specify the critical range of the weapon
   *
   * @example
   * let w = new Weapon()
   * w.crit('18-20') // Range from 18-20
   *
   * @example
   * let w = new Weapon()
   * w.crit('18') // Range from 18-20
   *
   * @example
   * let w = new Weapon()
   * w.crit(18) // Range from 18-20
   *
   * @example
   * let w = new Weapon()
   * w.crit([18]) // Range from 18-20
   *
   * @example
   * let w = new Weapon()
   * w.crit({ min: '18' }) // Range from 18-20
   *
   * @example
   * let w = new Weapon()
   * w.crit({ minimum: 18 }) // Range from 18-20
   * 
   * @param  {!function} range - one of many representations of a critical
   * range.
   * @param  {number} multiplier
   * @return {Weapon} this
   */
  crit (critRange, multiplier) {
    function invalid () {
      throw new Error ('Invalid crit range')
    }

    if (typeof critRange === 'number') {
      // Handle static numbers
      this.minCrit = critRange
    } else if (typeof critRange === 'string') {
      // Handle strings
      let staticNum = Number(critRange)
      if (staticNum) {
        this.minCrit = staticNum
      } else if (critRange.indexOf('-' > -1)) {
        let [min, _] = critRange
        let minCrit = Number(min)
        if (minCrit) {
          this.minCrit = minCrit
        } else {
          invalid()
        }
      } else {
        invalid()
      }

    } else {
      // Handle Objects and Arrays
      return this.crit(critRange[0] || critRange['min'] || critRange['minimum'])
    }
    this.critMultiplier = multiplier
    return this
  }

  /**
   * Enchant
   *
   * @description
   * Add an enchantment to the weapon.
   *
   * @example
   * let w = new Weapon()
   * w.enchant({
   *   type: 'Sonic',
   *   bonus: '1d6'
   * })
   *
   * @example
   * let w = new Weapon()
   * w.enchant('Sonic', '1d6')
   * 
   * @param  {string|object} descriptor - Either the type of the enchantment
   * (i.e. Sonic, Acid, Fire, etc.) or a descriptor object containing those
   * details. If 'descriptor' is an object, then the second argument is ignored.
   * @param  {string} bonus - bonus string.
   * @return {Weapon}
   */
  enchant (descriptor, bonus) {
    this.enchantments.push(new Bonus(descriptor, bonus))
    return this
  }

  /**
   * Bonus
   *
   * @description
   * Add a bonus to the weapon.
   *
   * @example
   * let w = new Weapon()
   * w.bonus({
   *   type: 'Sonic',
   *   bonus: '1d6'
   * })
   *
   * @example
   * let w = new Weapon()
   * w.bonus('Sonic', '1d6')
   * 
   * @param  {string|object} descriptor - Either the type of the enchantment
   * (i.e. Sonic, Acid, Fire, etc.) or a descriptor object containing those
   * details. If 'descriptor' is an object, then the second argument is ignored.
   * @param  {string} bonus - bonus string.
   * @return {Weapon}
   */
  bonus (descriptor, bonus) {
    this.bonuses.push(new Bonus(descriptor, bonus))
    return this
  }

}

/**
 * Exports
 * @ignore
 */
module.exports = Weapon