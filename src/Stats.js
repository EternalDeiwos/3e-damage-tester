'use strict'

/**
 * Module Dependencies
 * @ignore
 */
const Weapon = require('./Weapon')

/**
 * Constants
 * @ignore
 */
const TAB_SPACES = 8
const TABS = 6

/**
 * Stats
 *
 * @class
 * Weapon statistics evaluator
 */
class Stats {

  /**
   * Constructor
   * 
   * @param  {Object} weapons - weapons descriptor
   */
  constructor (weapons) {
    this.weapons = {}
    this.attacks = {}
    this.critAttacks = {}
    this.iterations = 0
    this.register(weapons)
  }

  /**
   * Register
   *
   * @description
   * Register a weapon or weapons for analysis
   * 
   * @param  {Object} weapons - weapons descritor
   * @return {Stats} This. Useful for method chaining
   */
  register (weapons) {
    if (weapons instanceof Weapon) {
      this.weapons[weapons.name] = weapons
      this.attacks[weapons.name] = []
      this.critAttacks[weapons.name] = []
    } else if (typeof weapons === 'object') {
      if (Array.isArray(weapons)) {
        weapons.forEach(weapon => {
          this.weapons[weapon.name] = weapon
          this.attacks[weapon.name] = []
          this.critAttacks[weapon.name] = []
        })
      } else {
        Object.keys(weapons).forEach(key => {
          this.weapons[weapons[key].name || key] = weapon
          this.attacks[weapons[key].name || key] = []
          this.critAttacks[weapons[key].name || key] = []
        })
      }
    }
    return this
  }

  /**
   * Run
   *
   * @description
   * Run the simulation.
   * 
   * @param  {Number} [iterations=100] - number of iterations for simulation
   * @return {Stats} This. Useful for method chaining
   */
  run (iterations=100) {
    Object.keys(this.weapons).forEach(key => {
      let weapon = this.weapons[key]

      for (let i = 0; i < iterations; i++) {
        this.attacks[key].push(weapon.attack())
        this.critAttacks[key].push(weapon.attack(false, true))
      }
    })
    this.iterations += iterations
    return this
  }

  /**
   * Report
   *
   * @description 
   * Print the analysis report
   * 
   * @return {Stats} This. Useful for method chaining
   */
  report () {
    function reduceResults (resultSet) {
      return resultSet.reduce((pre, cur) => {
        Object.keys(cur).forEach(type => {
          if (pre[type]) {
            pre[type] += cur[type]
          } else {
            pre[type] = cur[type]
          }
        })
        return pre
      }, {})
    }

    function calcAverages (reducedSet, iterations) {
      let sum = 0
      let result = {}
      Object.keys(reducedSet).forEach(type => {
        let average = reducedSet[type] / iterations
        sum += average
        result[type] = average
      })
      result['Total Damage'] = sum
      return result
    }

    function reportStats (averages) {
      Object.keys(averages).forEach(type => {
        let tabs = TABS - Math.ceil((type.length + 1) / TAB_SPACES) + 2
        console.log(type, new Array(tabs).join('\t'), averages[type].toFixed(2))
      })
    }

    function reportCritRate (weapon, iterations) {
      console.log('Crit Percent', new Array(TABS).join('\t'),
        ((weapon.numCrits / iterations) * 100).toFixed(2), '%')
    }

    console.log('ITERATIONS', this.iterations)
    console.log('WEAPONS')
    Object.keys(this.weapons).forEach(key => {
      let weapon = this.weapons[key]
      let attacks = this.attacks[key]
      let critAttacks = this.critAttacks[key]
      console.log(key, weapon)

      let reducedAttacks = reduceResults(attacks)
      let reducedCrits = reduceResults(critAttacks)

      let results = calcAverages(reducedAttacks, this.iterations)
      let resultsCrits = calcAverages(reducedCrits, this.iterations)
      let resultsMax = calcAverages(weapon.attack(true), 1)

      console.log('\nRESULTS MAX')
      reportStats(resultsMax)

      console.log('\nRESULTS AVG CRITS')
      reportStats(resultsCrits)

      console.log('\nRESULTS AVG')
      reportStats(results)
      reportCritRate(weapon, this.iterations)

      console.log('=========================================================\n')
    })
    return this
  }

}

/**
 * Exports
 * @ignore
 */
module.exports = Stats