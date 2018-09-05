import BaseAdapter from '../base_adapter'
import Whitakers from './engine/whitakers'
import Morpheusgrc from './engine/morpheusgrc'
import Aramorph from './engine/aramorph'
import Hazm from './engine/hazm'
import Traces from './engine/traces'
import * as Models from 'alpheios-data-models'
import WordTestData from './engine/data/test-data'
import DefaultConfig from './config.json'

class AlpheiosTuftsAdapter extends BaseAdapter {
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
    this.engineMap = new Map(([ Whitakers, Morpheusgrc, Aramorph, Hazm, Traces ]).map((e) => { return [ e.engine, e ] }))
  }

  getEngineLanguageMap (lang) {
    if (this.config.engine[lang]) {
      return this.engineMap.get(this.config.engine[lang][0])
    } else {
      return null
    }
  }

  prepareRequestUrl (lang, word) {
    let engine = this.getEngineLanguageMap(lang)
    if (engine) {
      let code = engine.engine
      return this.config.url.replace('r_WORD', word).replace('r_ENGINE', code).replace('r_LANG', lang)
    } else {
      return null
    }
  }

  fetchTestData (lang, word) {
    return new Promise((resolve, reject) => {
      try {
        let wordData = new WordTestData().get(word)
        let json = JSON.parse(wordData)
        resolve(json)
      } catch (error) {
        // Word is not found in test data
        reject(error)
      }
    })
  }

  /**
   * A function that maps a morphological service's specific data types and values into an inflection library standard.
   * @param {object} jsonObj - A JSON data from a Morphological Analyzer.
   * @param {object} targetWord - the target of the analysis
   * @returns {Models.Homonym} A library standard Homonym object.
   */
  transform (jsonObj, targetWord) {
    'use strict'
    let lexemes = []
    let annotationBody = jsonObj.RDF.Annotation.Body
    if (!Array.isArray(annotationBody)) {
      /*
      If only one lexeme is returned, Annotation Body will not be an array but rather a single object.
      Let's convert it to an array so we can work with it in the same way no matter what format it is.
      */
      if (annotationBody) {
        annotationBody = [annotationBody]
      } else {
        annotationBody = []
      }
    }
    let providerUri = jsonObj.RDF.Annotation.creator.Agent.about
    let providerRights = ''
    if (jsonObj.RDF.Annotation.rights) {
      providerRights = jsonObj.RDF.Annotation.rights.$
    }
    let provider = new Models.ResourceProvider(providerUri, providerRights)
    for (let lexeme of annotationBody) {
      let inflectionsJSON = lexeme.rest.entry.infl
      if (!inflectionsJSON) {
        inflectionsJSON = []
      } else if (!Array.isArray(inflectionsJSON)) {
        // If only one inflection returned, it is a single object, not an array of objects.
        // Convert it to an array for uniformity.
        inflectionsJSON = [inflectionsJSON]
      }
      let lemmaElements
      let features = [
        ['pofs', 'part'],
        ['case', 'grmCase'],
        ['gend', 'gender'],
        ['decl', 'declension'],
        ['conj', 'conjugation'],
        ['area', 'area'],
        ['age', 'age'],
        ['geo', 'geo'],
        ['freq', 'frequency'],
        ['note', 'note'],
        ['pron', 'pronunciation'],
        ['kind', 'kind'],
        ['src', 'source']
      ]
      let reconstructHdwd = []
      if (lexeme.rest.entry.dict) {
        if (Array.isArray(lexeme.rest.entry.dict)) {
          lemmaElements = lexeme.rest.entry.dict
        } else {
          if (!lexeme.rest.entry.dict.hdwd && inflectionsJSON[0].term) {
            lexeme.rest.entry.dict.hdwd = {}
            lexeme.rest.entry.dict.hdwd.lang = inflectionsJSON[0].term.lang
            reconstructHdwd.push(inflectionsJSON[0].term.prefix ? inflectionsJSON[0].term.prefix.$ : '')
            reconstructHdwd.push(inflectionsJSON[0].term.stem ? inflectionsJSON[0].term.stem.$ : '')
            reconstructHdwd.push(inflectionsJSON[0].term.suff ? inflectionsJSON[0].term.suff.$ : '')
          }
          lemmaElements = [lexeme.rest.entry.dict]
        }
      } else if (inflectionsJSON.length > 0 && inflectionsJSON[0].term) {
        lemmaElements = [ inflectionsJSON[0].term ]
      }
      // in rare cases (e.g. conditum in Whitakers) multiple dict entries
      // exist - always use the lemma and language from the first
      let language = lemmaElements[0].hdwd ? lemmaElements[0].hdwd.lang : lemmaElements[0].lang
      // Get importer based on the language
      let mappingData = this.getEngineLanguageMap(language)
      if (!mappingData) {
        console.log(`No mapping data found for ${language}`)
        continue
      }
      if (reconstructHdwd.length > 0) {
        if (mappingData.model.direction === Models.Constants.LANG_DIR_RTL) {
          reconstructHdwd.reverse()
        }
        lexeme.rest.entry.dict.hdwd.$ = reconstructHdwd.join('')
      }
      let lemmas = []
      let lexemeSet = []
      for (let entry of lemmaElements.entries()) {
        let shortdefs = []
        let index = entry[0]
        let elem = entry[1]
        let lemmaText
        if (elem.hdwd) {
          lemmaText = elem.hdwd.$
        }
        if (!lemmaText || !language) {
          console.log('No lemma or language found')
          continue
        }
        let lemma = mappingData.parseLemma(lemmaText, language)
        lemmas.push(lemma)
        for (let feature of features) {
          mappingData.mapFeature(lemma, elem, ...feature, this.config.allowUnknownValues)
        }
        let meanings = lexeme.rest.entry.mean
        if (!Array.isArray(meanings)) {
          meanings = [meanings]
        }
        meanings = meanings.filter((m) => m)
        // if we have multiple dictionary elements, take the meaning with the matching index
        if (lemmaElements.length > 1) {
          if (meanings && meanings[index]) {
            let meaning = meanings[index]
            // TODO: convert a source-specific language code to ISO 639-3 if don't match
            let lang = meaning.lang ? meaning.lang : 'eng'
            shortdefs.push(Models.ResourceProvider.getProxy(provider,
              new Models.Definition(meaning.$, lang, 'text/plain', lemmas[index].word)))
          }
        } else {
          // Changed to prevent some weird "Array Iterator.prototype.next called on incompatible receiver [object Unknown]" error
          let sDefs = meanings.map(meaning => {
            let lang = meaning.lang ? meaning.lang : 'eng'
            return Models.ResourceProvider.getProxy(provider,
              new Models.Definition(meaning.$, lang, 'text/plain', lemma.word))
          })
          shortdefs.push(...sDefs)
        }
        let lexmodel = new Models.Lexeme(lemma, [])

        lexmodel.meaning.appendShortDefs(shortdefs)
        lexemeSet.push(Models.ResourceProvider.getProxy(provider, lexmodel))
      }
      if (lemmas.length === 0) {
        continue
      }
      let inflections = []
      for (let inflectionJSON of inflectionsJSON) {
        let stem = inflectionJSON.term.stem ? inflectionJSON.term.stem.$ : null
        let suffix = inflectionJSON.term.suff ? inflectionJSON.term.suff.$ : null
        let prefix = inflectionJSON.term.pref ? inflectionJSON.term.pref.$ : null
        let xmpl = inflectionJSON.xmpl ? inflectionJSON.xmpl.$ : null
        let inflection = new Models.Inflection(stem, mappingData.model.languageID, suffix, prefix, xmpl)
        if (targetWord) {
          inflection.addFeature(new Models.Feature(Models.Feature.types.fullForm, targetWord, mappingData.model.languageID))
        }
        // Parse whatever grammatical features we're interested in and are provided
        for (let f of [
          ['pofs', 'part'],
          ['case', 'grmCase'],
          ['decl', 'declension'],
          ['num', 'number'],
          ['gend', 'gender'],
          ['conj', 'conjugation'],
          ['tense', 'tense'],
          ['voice', 'voice'],
          ['mood', 'mood'],
          ['pers', 'person'],
          ['comp', 'comparison'],
          ['stemtype', 'stemtype'],
          ['derivtype', 'derivtype'],
          ['dial', 'dialect'],
          ['morph', 'morph']
        ]) {
          try {
            mappingData.mapFeature(inflection, inflectionJSON, ...f, this.config.allowUnknownValues)
          } catch (e) {
            console.log(`Unable to map ${f[0]}`, e)
          }
        }
        // we only use the inflection if it tells us something the dictionary details do not
        if (inflection[Models.Feature.types.grmCase] ||
          inflection[Models.Feature.types.tense] ||
          inflection[Models.Feature.types.mood] ||
          inflection[Models.Feature.types.voice] ||
          inflection[Models.Feature.types.person] ||
          inflection[Models.Feature.types.comparison] ||
          inflection[Models.Feature.types.stemtype] ||
          inflection[Models.Feature.types.derivtype] ||
          inflection[Models.Feature.types.dialect] ||
          inflection[Models.Feature.types.morph] ||
          inflection[Models.Feature.types.example]) {
          inflections.push(inflection)
        }
        // inflection can provide lemma decl, pofs, conj
        for (let lemma of lemmas) {
          if (!lemma.features[Models.Feature.types.part]) {
            mappingData.mapFeature(lemma, inflectionJSON, 'pofs', 'part', this.config.allowUnknownValues)
          }
          // only take declension from inflection if lemma has no part of speech or its the same as the inflection
          if (!lemma.features[Models.Feature.types.declension] &&
            (!lemma.features[Models.Feature.types.part] || lemma.features[Models.Feature.types.part].isEqual(inflection[Models.Feature.types.part]))) {
            mappingData.mapFeature(lemma, inflectionJSON, 'decl', 'declension', this.config.allowUnknownValues)
          }
          // only take conjugation from inflection if lemma has a part of speech and its the same as the inflection
          if (!lemma.features[Models.Feature.types.conjugation] &&
            (!lemma.features[Models.Feature.types.part] || lemma.features[Models.Feature.types.part].isEqual(inflection[Models.Feature.types.part]))) {
            mappingData.mapFeature(lemma, inflectionJSON, 'conj', 'conjugation', this.config.allowUnknownValues)
          }
        }
      }
      let aggregated = mappingData.aggregateLexemes(lexemeSet, inflections)
      lexemes.push(...aggregated)
    }
    if (lexemes.length > 0) {
      return new Models.Homonym(lexemes, targetWord)
    } else {
      return undefined
    }
  }

  async getHomonym (languageID, word) {
    let jsonObj = await this.fetch(languageID, word)
    if (jsonObj) {
      let homonym = this.transform(jsonObj, word)
      homonym.lexemes.sort(Models.Lexeme.getSortByTwoLemmaFeatures(Models.Feature.types.frequency, Models.Feature.types.part))
      return homonym
    } else {
      // No data found for this word
      return undefined
    }
  }
}

export default AlpheiosTuftsAdapter
