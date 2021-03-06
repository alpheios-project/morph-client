import BaseAdapter from '../base_adapter'
import * as Models from 'alpheios-data-models'
import DefaultConfig from './config.json'
import xmlToJSON from 'xmltojson'
import axios from 'axios'

class AlpheiosTreebankAdapter extends BaseAdapter {
  /**
   * A Morph Client Adapter for the Tufts Morphology Service
   * @constructor
   * @param {object} config configuraiton object
   */
  constructor (config = {}) {
    super()
    try {
      this.config = JSON.parse(DefaultConfig)
    } catch (e) {
      this.config = Object.assign({}, DefaultConfig)
    }
    Object.assign(this.config, config)
    this.models = { 'lat': Models.LatinLanguageModel,
      'grc': Models.GreekLanguageModel
    }
  }

  prepareRequestUrl (lang, word) {
    let [text, fragment] = word.split(/#/)
    let url
    if (this.config.texts.includes(text)) {
      url = this.config.url.replace('r_TEXT', text)
      url = url.replace('r_WORD', fragment).replace('r_CLIENT', this.config.clientId)
    }
    return url
  }

  fetchWindow (url, languageID) {
    return new Promise((resolve, reject) => {
      if (url) {
        window.fetch(url).then(
          function (response) {
            try {
              if (response.ok) {
                let xmlString = response.text()
                resolve(xmlString)
              } else {
                reject(response.statusText)
              }
            } catch (error) {
              reject(error)
            }
          }
        ).catch((error) => {
          reject(error)
        }
        )
      } else {
        reject(new Error(`Unable to prepare parser request url for ${languageID.toString()}`))
      }
    })
  }

  async fetchAxios (url, languageID) {
    try {
      let res = await axios.get(url)
      return res.data
    } catch (error) {
      console.error(`Unable to prepare parser request url for ${languageID.toString()}`)
    }
  }

  /**
   * Fetch response from a remote URL
   * @override BaseAdapter#fetch
   * @param {String} word is expected to be a reference to a word identifier fragement
  *                       in a text in the form textid#wordid
   *                      e.g. 1999.02.0066#1-1
   */
  fetch (languageID, word) {
    const langCode = Models.LanguageModelFactory.getLanguageCodeFromId(languageID)
    let url = this.prepareRequestUrl(langCode, word)
    if (typeof window !== 'undefined') {
      return this.fetchWindow(url, languageID)
    } else {
      return this.fetchAxios(url, languageID)
    }
  }

  /**
   * A function that maps a morphological service's specific data types and values into an inflection library standard.
   * @param {object} jsonObj - A JSON data from a Morphological Analyzer.
   * @param {object} targetWord - the target of the analysis
   * @returns {Models.Homonym} A library standard Homonym object.
   */
  transform (jsonObj, targetWord) {
    'use strict'
    let providerUri = this.config.providerUri
    let providerRights = this.config.providerRights
    let provider = new Models.ResourceProvider(providerUri, providerRights)
    let hdwd = jsonObj.words[0].word[0].entry[0].dict[0].hdwd[0]
    let lemmaText = hdwd._text
    // the Alpheios v1 treebank data kept trailing digits on the lemmas
    // these won't match morphology service lemmas which have them stripped
    lemmaText = lemmaText.replace(/\d+$/, '')
    let model = this.models[hdwd._attr.lang._value]
    let lemma = new Models.Lemma(lemmaText, model.languageCode)
    let lexmodel = new Models.Lexeme(lemma, [])
    let inflection = new Models.Inflection(lemmaText, model.languageID, null, null, null)
    let infl = jsonObj.words[0].word[0].entry[0].infl[0]
    inflection.addFeature(new Models.Feature(Models.Feature.types.fullForm, targetWord, model.languageID))
    let features = [
      ['pofs', 'part', true],
      ['case', 'grmCase', false],
      ['num', 'number', false],
      ['gend', 'gender', false],
      ['voice', 'voice', false],
      ['mood', 'mood', false],
      ['pers', 'person', false],
      ['comp', 'comparison', false]
    ]
    for (let feature of features) {
      let localName = feature[0]
      let featureType = feature[1]
      let addToLemma = feature[2]
      if (infl[localName]) {
        let obj = model.typeFeature(Models.Feature.types[featureType]).createFeatures(infl[localName][0]._text, 1)
        inflection.addFeature(obj)
        if (addToLemma) {
          lemma.addFeature(obj)
        }
      }
    }
    lexmodel.inflections = [ inflection ]
    return new Models.Homonym([Models.ResourceProvider.getProxy(provider, lexmodel)], targetWord)
  }

  async getHomonym (languageID, word) {
    let xmlString = await this.fetch(languageID, word)
    if (xmlString) {
      let langCode = this.getLanguageCode(languageID)
      console.log(`LangCode ${langCode}`)
      let jsonObj = xmlToJSON.parseString(xmlString)
      jsonObj.words[0].word[0].entry[0].dict[0].hdwd[0]._attr = { lang: { _value: langCode } }
      let homonym = this.transform(jsonObj, jsonObj.words[0].word[0].form[0]._text)
      return homonym
    } else {
      // No data found for this word
      return undefined
    }
  }

  getLanguageCode (languageID) {
    return Models.LanguageModelFactory.getLanguageCodeFromId(languageID)
  }
}

export default AlpheiosTreebankAdapter
