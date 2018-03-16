/*
Objects of a morphology analyzer's library
 */
import * as Models from 'alpheios-data-models'

/**
 * Holds all information required to transform from morphological analyzer's grammatical feature values to the
 * library standards. There is one ImportData object per language.
 */
class ImportData {
  /**
     * Creates an InmportData object for the language provided.
     * @param {Function<LanguageModel>} language - A language of the import data.
     * @param {string} engine - engine code
     */
  constructor (model, engine) {
    'use strict'
    this.model = model
    this.engine = engine
    // add all the features that the language supports so that we
    // can return the default values if we don't need to import a mapping
    for (let featureName of Object.keys(this.model.features)) {
      this.addFeature(featureName)
    }
    // may be overridden by specific engine use via setLemmaParser
    this.parseLemma = function (lemma) { return new Models.Lemma(lemma, this.model.languageID) }
    // may be overridden by specific engine use via setPropertyParser - default just returns the property value
    // as a list
    this.parseProperty = function (propertyName, propertyValue) {
      let propertyValues = []
      if (propertyName === 'decl') {
        propertyValues = propertyValue.split('&').map((p) => p.trim())
      } else if (propertyName === 'comp' && propertyValue === 'positive') {
        propertyValues = []
      } else {
        propertyValues = [propertyValue]
      }
      return propertyValues
    }
    // may be overridden by specifc engine use via setLexemeFilter - default assumes we will have a part of speech
    this.reportLexeme = function (lexeme) {
      return lexeme.lemma.features[Models.Feature.types.part]
    }
  }

  /**
     * Adds a grammatical feature whose values to be mapped.
     * @param {string} featureName - A name of a grammatical feature (i.e. declension, number, etc.)
     * @return {Object} An object that represent a newly created grammatical feature.
     */
  addFeature (featureName) {
    this[featureName] = {}
    let model = this.model

    this[featureName].add = function add (providerValue, alpheiosValue) {
      this[providerValue] = alpheiosValue
      return this
    }

    this[featureName].get = function get (providerValue, sortOrder = 1, allowUnknownValues = false) {
      let mappedValue = []
      if (!this.importer.has(providerValue)) {
        // if the providerValue matches the model value or the model value
        // is unrestricted, return a feature with the providerValue and order
        if (model.features[featureName][providerValue] ||
            model.features[featureName].hasUnrestrictedValue()) {
          mappedValue = model.features[featureName].get(providerValue, sortOrder)
        } else {
          let message = `Unknown value "${providerValue}" of feature "${featureName}" for ${model.languageCode} (allowed = ${allowUnknownValues})`
          if (allowUnknownValues) {
            console.log(message)
            mappedValue = model.features[featureName].get(providerValue, sortOrder)
          } else {
            throw new Error(message)
          }
        }
      } else {
        let tempValue = this.importer.get(providerValue)
        if (Array.isArray(tempValue)) {
          mappedValue = []
          for (let feature of tempValue) {
            mappedValue.push(model.features[featureName].get(feature.value, sortOrder))
          }
        } else {
          mappedValue = model.features[featureName].get(tempValue.value, sortOrder)
        }
      }
      return mappedValue
    }

    this[featureName].importer = new Models.FeatureImporter()

    return this[featureName]
  }

  /**
   * Add an engine-specific lemma parser
   */
  setLemmaParser (callback) {
    this.parseLemma = callback
  }

  /**
   * Add an engine-specific property parser
   */
  setPropertyParser (callback) {
    this.parseProperty = callback
  }

  /**
   * Add an engine-specific lexeme filter
   */
  setLexemeFilter (callback) {
    this.reportLexeme = callback
  }

  /**
   * map property to one or more Features and add it to the supplied model object
   * @param {object} model the model object to which the feature will be added
   * @param {object} inputElem the input data element
   * @param {object} inputName the  property name in the input data
   * @param {string} featureName the name of the feature it will be mapped to
   * @param {boolean} allowUnknownValues flag to indicate if unknown values are allowed
   */
  mapFeature (model, inputElem, inputName, featureName, allowUnknownValues) {
    let mapped = []
    let values = []
    if (inputElem[inputName]) {
      if (Array.isArray(inputElem[inputName])) {
        for (let e of inputElem[inputName]) {
          values.push(...this.parseProperty(inputName, e.$))
        }
      } else {
        values = this.parseProperty(inputName, inputElem[inputName].$)
      }
    }
    for (let value of values) {
      let features = this[Models.Feature.types[featureName]].get(
        value, inputElem[inputName].order, allowUnknownValues)
      if (Array.isArray(features)) {
        mapped.push(...features)
      } else {
        mapped.push(features)
      }
    }
    if (mapped.length > 0) {
      model.feature = mapped
    }
  }
}
export default ImportData
