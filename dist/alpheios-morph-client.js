(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("alpheios-data-models"));
	else if(typeof define === 'function' && define.amd)
		define(["alpheios-data-models"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("alpheios-data-models")) : factory(root["alpheios-data-models"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(window, function(__WEBPACK_EXTERNAL_MODULE_alpheios_data_models__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./driver.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./base_adapter.js":
/*!*************************!*\
  !*** ./base_adapter.js ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/**
 * Base Adapter Class for a Morphology Service Client
 */
class BaseAdapter {
  /**
   * Method which is used to prepare a lookup request according
   * to the adapter specific logic
   * @param {string} lang - the language code
   * @param {string} word - the word to lookup
   * @returns {string} the url for the request
   */
  prepareRequestUrl (lang, word) {
    /** must be overridden in the adapter implementation class **/
    return null
  }

  /**
   * Lookup the supplied word using the preconfigured engines and
   * and return a Homonym
   * @param {string} lang - ISO 639-2 language code for the word
   * @param {string} word - the word to lookup
   * @return {Homonym} homonym object
   */
  async getHomonym (lang, word) {
    // implement in the derived adapater class
    return undefined
  }

  /**
   * Fetch response from a remote URL
   * @param {string} lang - the language code
   * @param {string} word - the word to lookup
   * @returns {Promise} a promse which if successful resolves to json response object
   *                    with the results of the analysis
   */
  fetch (lang, word) {
    let url = this.prepareRequestUrl(lang, word)
    return new Promise((resolve, reject) => {
      if (url) {
        window.fetch(url).then(
          function (response) {
            try {
              if (response.ok) {
                let json = response.json()
                resolve(json)
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
        reject(new Error(`Unable to prepare parser request url for ${lang}`))
      }
    })
  }

  /**
   * Fetch test data to test the adapter
   * @param {string} lang - the language code
   * @param {string} word - the word to lookup
   * @returns {Promise} a promse which if successful resolves to json response object
   *                    with the test data
   */
  fetchTestData (lang, word) {
    return new Promise((resolve, reject) => {
      try {
        let data = {}
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * A function that maps a morphological service's specific data types and values into an inflection library standard.
   * @param {object} jsonObj - A JSON data from the fetch request
   * @param {object} targetWord - the original target word of the analysis
   * @returns {Homonym} A library standard Homonym object.
   */
  transform (jsonObj, targetWord) {
    return {}
  }
}

/* harmony default export */ __webpack_exports__["default"] = (BaseAdapter);


/***/ }),

/***/ "./driver.js":
/*!*******************!*\
  !*** ./driver.js ***!
  \*******************/
/*! exports provided: BaseAdapter, AlpheiosTuftsAdapter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tufts_adapter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tufts/adapter */ "./tufts/adapter.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AlpheiosTuftsAdapter", function() { return _tufts_adapter__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _base_adapter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base_adapter */ "./base_adapter.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BaseAdapter", function() { return _base_adapter__WEBPACK_IMPORTED_MODULE_1__["default"]; });






/***/ }),

/***/ "./tufts/adapter.js":
/*!**************************!*\
  !*** ./tufts/adapter.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _base_adapter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base_adapter */ "./base_adapter.js");
/* harmony import */ var _engine_whitakers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./engine/whitakers */ "./tufts/engine/whitakers.js");
/* harmony import */ var _engine_morpheusgrc__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./engine/morpheusgrc */ "./tufts/engine/morpheusgrc.js");
/* harmony import */ var _engine_aramorph__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./engine/aramorph */ "./tufts/engine/aramorph.js");
/* harmony import */ var _engine_hazm__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./engine/hazm */ "./tufts/engine/hazm.js");
/* harmony import */ var alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! alpheios-data-models */ "alpheios-data-models");
/* harmony import */ var alpheios_data_models__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _engine_data_test_data__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./engine/data/test-data */ "./tufts/engine/data/test-data.js");
/* harmony import */ var _config_json__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./config.json */ "./tufts/config.json");
var _config_json__WEBPACK_IMPORTED_MODULE_7___namespace = /*#__PURE__*/Object.assign({}, _config_json__WEBPACK_IMPORTED_MODULE_7__, {"default": _config_json__WEBPACK_IMPORTED_MODULE_7__});









class AlpheiosTuftsAdapter extends _base_adapter__WEBPACK_IMPORTED_MODULE_0__["default"] {
  /**
   * A Morph Client Adapter for the Tufts Morphology Service
   * @constructor
   * @param {object} config configuraiton object
   */
  constructor (config = {}) {
    super()
    try {
      this.config = JSON.parse(_config_json__WEBPACK_IMPORTED_MODULE_7__)
    } catch (e) {
      this.config = Object.assign({}, _config_json__WEBPACK_IMPORTED_MODULE_7__)
    }
    Object.assign(this.config, config)
    this.engineMap = new Map(([ _engine_whitakers__WEBPACK_IMPORTED_MODULE_1__["default"], _engine_morpheusgrc__WEBPACK_IMPORTED_MODULE_2__["default"], _engine_aramorph__WEBPACK_IMPORTED_MODULE_3__["default"], _engine_hazm__WEBPACK_IMPORTED_MODULE_4__["default"] ]).map((e) => { return [ e.engine, e ] }))
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
        let wordData = new _engine_data_test_data__WEBPACK_IMPORTED_MODULE_6__["default"]().get(word)
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
    let provider = new alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["ResourceProvider"](providerUri, providerRights)
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
        ['src', 'source'],
        ['kind', 'kind']
      ]
      if (lexeme.rest.entry.dict) {
        if (Array.isArray(lexeme.rest.entry.dict)) {
          lemmaElements = lexeme.rest.entry.dict
        } else {
          if (!lexeme.rest.entry.dict.hdwd && inflectionsJSON[0].term) {
            lexeme.rest.entry.dict.hdwd = {}
            lexeme.rest.entry.dict.hdwd.lang = inflectionsJSON[0].term.lang
            lexeme.rest.entry.dict.hdwd.$ = inflectionsJSON[0].term.stem.$ + inflectionsJSON[0].term.suff.$
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
            shortdefs.push(alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["ResourceProvider"].getProxy(provider,
              new alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Definition"](meaning.$, lang, 'text/plain', lemmas[index].word)))
          }
        } else {
          // Changed to prevent some weird "Array Iterator.prototype.next called on incompatible receiver [object Unknown]" error
          let sDefs = meanings.map(meaning => {
            let lang = meaning.lang ? meaning.lang : 'eng'
            return alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["ResourceProvider"].getProxy(provider,
              new alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Definition"](meaning.$, lang, 'text/plain', lemma.word))
          })
          shortdefs.push(...sDefs)
        }
        let lexmodel = new alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Lexeme"](lemma, [])

        lexmodel.meaning.appendShortDefs(shortdefs)
        lexemeSet.push(alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["ResourceProvider"].getProxy(provider, lexmodel))
      }
      if (lemmas.length === 0) {
        continue
      }
      let inflections = []
      for (let inflectionJSON of inflectionsJSON) {
        let inflection = new alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Inflection"](inflectionJSON.term.stem.$, mappingData.model.languageID)
        if (targetWord) {
          inflection.addFeature(new alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"](alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.fullForm, targetWord, mappingData.model.languageID))
        }
        if (inflectionJSON.term.suff) {
          // Set suffix if provided by a morphological analyzer
          inflection.suffix = inflectionJSON.term.suff.$
        }

        if (inflectionJSON.xmpl) {
          inflection.example = inflectionJSON.xmpl.$
        }
        // Parse whatever grammatical features we're interested in
        mappingData.mapFeature(inflection, inflectionJSON, 'pofs', 'part', this.config.allowUnknownValues)
        mappingData.mapFeature(inflection, inflectionJSON, 'case', 'grmCase', this.config.allowUnknownValues)
        mappingData.mapFeature(inflection, inflectionJSON, 'decl', 'declension', this.config.allowUnknownValues)
        mappingData.mapFeature(inflection, inflectionJSON, 'num', 'number', this.config.allowUnknownValues)
        mappingData.mapFeature(inflection, inflectionJSON, 'gend', 'gender', this.config.allowUnknownValues)
        mappingData.mapFeature(inflection, inflectionJSON, 'conj', 'conjugation', this.config.allowUnknownValues)
        mappingData.mapFeature(inflection, inflectionJSON, 'tense', 'tense', this.config.allowUnknownValues)
        mappingData.mapFeature(inflection, inflectionJSON, 'voice', 'voice', this.config.allowUnknownValues)
        mappingData.mapFeature(inflection, inflectionJSON, 'mood', 'mood', this.config.allowUnknownValues)
        mappingData.mapFeature(inflection, inflectionJSON, 'pers', 'person', this.config.allowUnknownValues)
        mappingData.mapFeature(inflection, inflectionJSON, 'comp', 'comparison', this.config.allowUnknownValues)
        if (inflectionJSON.stemtype) {
          mappingData.mapFeature(inflection, inflectionJSON, 'stemtype', 'stemtype', this.config.allowUnknownValues)
        }
        if (inflectionJSON.derivtype) {
          mappingData.mapFeature(inflection, inflectionJSON, 'derivtype', 'derivtype', this.config.allowUnknownValues)
        }
        if (inflectionJSON.dial) {
          mappingData.mapFeature(inflection, inflectionJSON, 'dial', 'dialect', this.config.allowUnknownValues)
        }
        if (inflectionJSON.morph) {
          mappingData.mapFeature(inflection, inflectionJSON, 'morph', 'morph', this.config.allowUnknownValues)
        }
        // we only use the inflection if it tells us something the dictionary details do not
        if (inflection[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.grmCase] ||
          inflection[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.tense] ||
          inflection[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.mood] ||
          inflection[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.voice] ||
          inflection[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.person] ||
          inflection[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.comparison] ||
          inflection[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.stemtype] ||
          inflection[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.derivtype] ||
          inflection[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.dialect] ||
          inflection[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.morph] ||
          inflection[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.example]) {
          inflections.push(inflection)
        }
        // inflection can provide lemma decl, pofs, conj
        for (let lemma of lemmas) {
          if (!lemma.features[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.part]) {
            mappingData.mapFeature(lemma, inflectionJSON, 'pofs', 'part', this.config.allowUnknownValues)
          }
          // only take declension from inflection if lemma has no part of speech or its the same as the inflection
          if (!lemma.features[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.declension] &&
            (!lemma.features[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.part] || lemma.features[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.part].isEqual(inflection[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.part]))) {
            mappingData.mapFeature(lemma, inflectionJSON, 'decl', 'declension', this.config.allowUnknownValues)
          }
          // only take conjugation from inflection if lemma has a part of speech and its the same as the inflection
          if (!lemma.features[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.conjugation] &&
            (!lemma.features[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.part] || lemma.features[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.part].isEqual(inflection[alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Feature"].types.part]))) {
            mappingData.mapFeature(lemma, inflectionJSON, 'conj', 'conjugation', this.config.allowUnknownValues)
          }
        }
      }
      for (let lex of lexemeSet) {
        // only process if we have a lemma that differs from the target
        // word or if we have at least a part of speech
        if (mappingData.reportLexeme(lex)) {
          lex.inflections = inflections
          lexemes.push(lex)
        }
      }
    }
    if (lexemes.length > 0) {
      return new alpheios_data_models__WEBPACK_IMPORTED_MODULE_5__["Homonym"](lexemes, targetWord)
    } else {
      return undefined
    }
  }

  async getHomonym (lang, word) {
    let jsonObj = await this.fetch(lang, word)
    if (jsonObj) {
      let homonym = this.transform(jsonObj, word)
      return homonym
    } else {
      // No data found for this word
      return undefined
    }
  }
}

/* harmony default export */ __webpack_exports__["default"] = (AlpheiosTuftsAdapter);


/***/ }),

/***/ "./tufts/config.json":
/*!***************************!*\
  !*** ./tufts/config.json ***!
  \***************************/
/*! exports provided: engine, url, allowUnknownValues, default */
/***/ (function(module) {

module.exports = {"engine":{"lat":["whitakerLat"],"grc":["morpheusgrc"],"ara":["aramorph"],"per":["hazm"]},"url":"https://morph.alpheios.net/api/v1/analysis/word?word=r_WORD&engine=r_ENGINE&lang=r_LANG","allowUnknownValues":true};

/***/ }),

/***/ "./tufts/engine/aramorph.js":
/*!**********************************!*\
  !*** ./tufts/engine/aramorph.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib */ "./tufts/lib.js");
/* harmony import */ var alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! alpheios-data-models */ "alpheios-data-models");
/* harmony import */ var alpheios_data_models__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__);



let data = new _lib__WEBPACK_IMPORTED_MODULE_0__["default"](alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["ArabicLanguageModel"], 'aramorph')

data.addFeature(alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Feature"].types.part).importer
  .map('proper noun', alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Constants"].POFS_NOUN)

/* harmony default export */ __webpack_exports__["default"] = (data);


/***/ }),

/***/ "./tufts/engine/data/greek_noun_pilsopo.json":
/*!***************************************************!*\
  !*** ./tufts/engine/data/greek_noun_pilsopo.json ***!
  \***************************************************/
/*! exports provided: RDF, default */
/***/ (function(module) {

module.exports = {"RDF":{"Annotation":{"about":"urn:TuftsMorphologyService:φιλόσοφος:morpheuslat","creator":{"Agent":{"about":"org.perseus:tools:morpheus.v1"}},"created":{"$":"2017-10-15T14:06:40.522369"},"hasTarget":{"Description":{"about":"urn:word:φιλόσοφος"}},"title":{},"hasBody":{"resource":"urn:uuid:idm140446394225264"},"Body":{"about":"urn:uuid:idm140446394225264","type":{"resource":"cnt:ContentAsXML"},"rest":{"entry":{"uri":"http://data.perseus.org/collections/urn:cite:perseus:grclexent.lex78378.1","dict":{"hdwd":{"lang":"grc","$":"φιλόσοφος"},"pofs":{"order":3,"$":"noun"},"decl":{"$":"2nd"},"gend":{"$":"masculine"}},"infl":{"term":{"lang":"grc","stem":{"$":"φιλοσοφ"},"suff":{"$":"ος"}},"pofs":{"order":3,"$":"noun"},"decl":{"$":"2nd"},"case":{"order":7,"$":"nominative"},"gend":{"$":"masculine"},"num":{"$":"singular"},"stemtype":{"$":"os_ou"}}}}}}}};

/***/ }),

/***/ "./tufts/engine/data/latin_noun_adj_mare.json":
/*!****************************************************!*\
  !*** ./tufts/engine/data/latin_noun_adj_mare.json ***!
  \****************************************************/
/*! exports provided: RDF, default */
/***/ (function(module) {

module.exports = {"RDF":{"Annotation":{"about":"urn:TuftsMorphologyService:mare:morpheuslat","creator":{"Agent":{"about":"org.perseus:tools:morpheus.v1"}},"created":{"$":"2017-09-08T06:59:48.639180"},"rights":{"$":"Morphology provided by Morpheus from the Perseus Digital Library at Tufts University."},"hasTarget":{"Description":{"about":"urn:word:mare"}},"title":{},"hasBody":[{"resource":"urn:uuid:idm140446402389888"},{"resource":"urn:uuid:idm140446402332400"},{"resource":"urn:uuid:idm140446402303648"}],"Body":[{"about":"urn:uuid:idm140446402389888","type":{"resource":"cnt:ContentAsXML"},"rest":{"entry":{"uri":"http://data.perseus.org/collections/urn:cite:perseus:latlexent.lex34070.1","dict":{"hdwd":{"lang":"lat","$":"mare"},"pofs":{"order":3,"$":"noun"},"decl":{"$":"3rd"},"gend":{"$":"neuter"}},"infl":[{"term":{"lang":"lat","stem":{"$":"mar"},"suff":{"$":"e"}},"pofs":{"order":3,"$":"noun"},"decl":{"$":"3rd"},"case":{"order":3,"$":"ablative"},"gend":{"$":"neuter"},"num":{"$":"singular"},"stemtype":{"$":"is_is"}},{"term":{"lang":"lat","stem":{"$":"mar"},"suff":{"$":"e"}},"pofs":{"order":3,"$":"noun"},"decl":{"$":"3rd"},"case":{"order":7,"$":"nominative"},"gend":{"$":"neuter"},"num":{"$":"singular"},"stemtype":{"$":"is_is"}},{"term":{"lang":"lat","stem":{"$":"mar"},"suff":{"$":"e"}},"pofs":{"order":3,"$":"noun"},"decl":{"$":"3rd"},"case":{"order":1,"$":"vocative"},"gend":{"$":"neuter"},"num":{"$":"singular"},"stemtype":{"$":"is_is"}},{"term":{"lang":"lat","stem":{"$":"mar"},"suff":{"$":"e"}},"pofs":{"order":3,"$":"noun"},"decl":{"$":"3rd"},"case":{"order":4,"$":"accusative"},"gend":{"$":"neuter"},"num":{"$":"singular"},"stemtype":{"$":"is_is"}}],"mean":{"$":"the sea"}}}},{"about":"urn:uuid:idm140446402332400","type":{"resource":"cnt:ContentAsXML"},"rest":{"entry":{"uri":"http://data.perseus.org/collections/urn:cite:perseus:latlexent.lex34118.1","dict":{"hdwd":{"lang":"lat","$":"marum"},"pofs":{"order":3,"$":"noun"},"decl":{"$":"2nd"},"gend":{"$":"neuter"}},"infl":{"term":{"lang":"lat","stem":{"$":"mar"},"suff":{"$":"e"}},"pofs":{"order":3,"$":"noun"},"decl":{"$":"2nd"},"case":{"order":1,"$":"vocative"},"gend":{"$":"neuter"},"num":{"$":"singular"},"stemtype":{"$":"us_i"}}}}},{"about":"urn:uuid:idm140446402303648","type":{"resource":"cnt:ContentAsXML"},"rest":{"entry":{"uri":"http://data.perseus.org/collections/urn:cite:perseus:latlexent.lex34119.1","dict":{"hdwd":{"lang":"lat","$":"mas"},"pofs":{"order":2,"$":"adjective"},"decl":{"$":"3rd"}},"infl":[{"term":{"lang":"lat","stem":{"$":"mare"}},"pofs":{"order":2,"$":"adjective"},"decl":{"$":"3rd"},"case":{"order":3,"$":"ablative"},"gend":{"$":"masculine"},"num":{"$":"singular"},"stemtype":{"$":"irreg_adj3"},"morph":{"$":"indeclform"}},{"term":{"lang":"lat","stem":{"$":"mare"}},"pofs":{"order":2,"$":"adjective"},"decl":{"$":"3rd"},"case":{"order":3,"$":"ablative"},"gend":{"$":"feminine"},"num":{"$":"singular"},"stemtype":{"$":"irreg_adj3"},"morph":{"$":"indeclform"}},{"term":{"lang":"lat","stem":{"$":"mare"}},"pofs":{"order":2,"$":"adjective"},"decl":{"$":"3rd"},"case":{"order":3,"$":"ablative"},"gend":{"$":"neuter"},"num":{"$":"singular"},"stemtype":{"$":"irreg_adj3"},"morph":{"$":"indeclform"}}]}}}]}}};

/***/ }),

/***/ "./tufts/engine/data/latin_noun_cupidinibus.json":
/*!*******************************************************!*\
  !*** ./tufts/engine/data/latin_noun_cupidinibus.json ***!
  \*******************************************************/
/*! exports provided: RDF, default */
/***/ (function(module) {

module.exports = {"RDF":{"Annotation":{"about":"urn:TuftsMorphologyService:cupidinibus:whitakerLat","creator":{"Agent":{"about":"net.alpheios:tools:wordsxml.v1"}},"created":{"$":"2017-08-10T23:15:29.185581"},"hasTarget":{"Description":{"about":"urn:word:cupidinibus"}},"title":{},"hasBody":[{"resource":"urn:uuid:idm140578094883136"},{"resource":"urn:uuid:idm140578158026160"}],"Body":[{"about":"urn:uuid:idm140578094883136","type":{"resource":"cnt:ContentAsXML"},"rest":{"entry":{"infl":[{"term":{"lang":"lat","stem":{"$":"cupidin"},"suff":{"$":"ibus"}},"pofs":{"order":5,"$":"noun"},"decl":{"$":"3rd"},"var":{"$":"1st"},"case":{"order":2,"$":"locative"},"num":{"$":"plural"},"gend":{"$":"masculine"}},{"term":{"lang":"lat","stem":{"$":"cupidin"},"suff":{"$":"ibus"}},"pofs":{"order":5,"$":"noun"},"decl":{"$":"3rd"},"var":{"$":"1st"},"case":{"order":5,"$":"dative"},"num":{"$":"plural"},"gend":{"$":"masculine"}},{"term":{"lang":"lat","stem":{"$":"cupidin"},"suff":{"$":"ibus"}},"pofs":{"order":5,"$":"noun"},"decl":{"$":"3rd"},"var":{"$":"1st"},"case":{"order":3,"$":"ablative"},"num":{"$":"plural"},"gend":{"$":"masculine"}}],"dict":{"hdwd":{"lang":"lat","$":"Cupido, Cupidinis"},"pofs":{"order":5,"$":"noun"},"decl":{"$":"3rd"},"gend":{"$":"masculine"},"area":{"$":"religion"},"freq":{"order":4,"$":"common"},"src":{"$":"Ox.Lat.Dict."}},"mean":{"$":"Cupid, son of Venus; personification of carnal desire;"}}}},{"about":"urn:uuid:idm140578158026160","type":{"resource":"cnt:ContentAsXML"},"rest":{"entry":{"infl":[{"term":{"lang":"lat","stem":{"$":"cupidin"},"suff":{"$":"ibus"}},"pofs":{"order":5,"$":"noun"},"decl":{"$":"3rd"},"var":{"$":"1st"},"case":{"order":2,"$":"locative"},"num":{"$":"plural"},"gend":{"$":"common"}},{"term":{"lang":"lat","stem":{"$":"cupidin"},"suff":{"$":"ibus"}},"pofs":{"order":5,"$":"noun"},"decl":{"$":"3rd"},"var":{"$":"1st"},"case":{"order":5,"$":"dative"},"num":{"$":"plural"},"gend":{"$":"common"}},{"term":{"lang":"lat","stem":{"$":"cupidin"},"suff":{"$":"ibus"}},"pofs":{"order":5,"$":"noun"},"decl":{"$":"3rd"},"var":{"$":"1st"},"case":{"order":3,"$":"ablative"},"num":{"$":"plural"},"gend":{"$":"common"}}],"dict":{"hdwd":{"lang":"lat","$":"cupido, cupidinis"},"pofs":{"order":5,"$":"noun"},"decl":{"$":"3rd"},"gend":{"$":"common"},"freq":{"order":5,"$":"frequent"},"src":{"$":"Ox.Lat.Dict."}},"mean":{"$":"desire/love/wish/longing (passionate); lust; greed, appetite; desire for gain;"}}}}]}}};

/***/ }),

/***/ "./tufts/engine/data/latin_verb_cepit.json":
/*!*************************************************!*\
  !*** ./tufts/engine/data/latin_verb_cepit.json ***!
  \*************************************************/
/*! exports provided: RDF, default */
/***/ (function(module) {

module.exports = {"RDF":{"Annotation":{"about":"urn:TuftsMorphologyService:cepit:whitakerLat","creator":{"Agent":{"about":"net.alpheios:tools:wordsxml.v1"}},"created":{"$":"2017-08-10T23:16:53.672068"},"hasTarget":{"Description":{"about":"urn:word:cepit"}},"title":{},"hasBody":{"resource":"urn:uuid:idm140578133848416"},"Body":{"about":"urn:uuid:idm140578133848416","type":{"resource":"cnt:ContentAsXML"},"rest":{"entry":{"infl":{"term":{"lang":"lat","stem":{"$":"cep"},"suff":{"$":"it"}},"pofs":{"order":3,"$":"verb"},"conj":{"$":"3rd"},"var":{"$":"1st"},"tense":{"$":"perfect"},"voice":{"$":"active"},"mood":{"$":"indicative"},"pers":{"$":"3rd"},"num":{"$":"singular"}},"dict":{"hdwd":{"lang":"lat","$":"capio, capere, cepi, captus"},"pofs":{"order":3,"$":"verb"},"conj":{"$":"3rd"},"kind":{"$":"transitive"},"freq":{"order":6,"$":"very frequent"},"src":{"$":"Ox.Lat.Dict."}},"mean":{"$":"take hold, seize; grasp; take bribe; arrest/capture; put on; occupy; captivate;"}}}}}}};

/***/ }),

/***/ "./tufts/engine/data/test-data.js":
/*!****************************************!*\
  !*** ./tufts/engine/data/test-data.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _latin_noun_cupidinibus_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./latin_noun_cupidinibus.json */ "./tufts/engine/data/latin_noun_cupidinibus.json");
var _latin_noun_cupidinibus_json__WEBPACK_IMPORTED_MODULE_0___namespace = /*#__PURE__*/Object.assign({}, _latin_noun_cupidinibus_json__WEBPACK_IMPORTED_MODULE_0__, {"default": _latin_noun_cupidinibus_json__WEBPACK_IMPORTED_MODULE_0__});
/* harmony import */ var _latin_noun_adj_mare_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./latin_noun_adj_mare.json */ "./tufts/engine/data/latin_noun_adj_mare.json");
var _latin_noun_adj_mare_json__WEBPACK_IMPORTED_MODULE_1___namespace = /*#__PURE__*/Object.assign({}, _latin_noun_adj_mare_json__WEBPACK_IMPORTED_MODULE_1__, {"default": _latin_noun_adj_mare_json__WEBPACK_IMPORTED_MODULE_1__});
/* harmony import */ var _latin_verb_cepit_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./latin_verb_cepit.json */ "./tufts/engine/data/latin_verb_cepit.json");
var _latin_verb_cepit_json__WEBPACK_IMPORTED_MODULE_2___namespace = /*#__PURE__*/Object.assign({}, _latin_verb_cepit_json__WEBPACK_IMPORTED_MODULE_2__, {"default": _latin_verb_cepit_json__WEBPACK_IMPORTED_MODULE_2__});
/* harmony import */ var _greek_noun_pilsopo_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./greek_noun_pilsopo.json */ "./tufts/engine/data/greek_noun_pilsopo.json");
var _greek_noun_pilsopo_json__WEBPACK_IMPORTED_MODULE_3___namespace = /*#__PURE__*/Object.assign({}, _greek_noun_pilsopo_json__WEBPACK_IMPORTED_MODULE_3__, {"default": _greek_noun_pilsopo_json__WEBPACK_IMPORTED_MODULE_3__});





class WordTestData {
  constructor () {
    this._words = {
      'cupidinibus': _latin_noun_cupidinibus_json__WEBPACK_IMPORTED_MODULE_0__,
      'mare': _latin_noun_adj_mare_json__WEBPACK_IMPORTED_MODULE_1__,
      'cepit': _latin_verb_cepit_json__WEBPACK_IMPORTED_MODULE_2__,
      'φιλόσοφος': _greek_noun_pilsopo_json__WEBPACK_IMPORTED_MODULE_3__
    }
  }

  get (word) {
    if (this._words.hasOwnProperty(word)) {
      return this._words[word]
    }
    throw new Error(`Word "${word}" does not exist in test data`)
  }
}
/* harmony default export */ __webpack_exports__["default"] = (WordTestData);


/***/ }),

/***/ "./tufts/engine/hazm.js":
/*!******************************!*\
  !*** ./tufts/engine/hazm.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib */ "./tufts/lib.js");
/* harmony import */ var alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! alpheios-data-models */ "alpheios-data-models");
/* harmony import */ var alpheios_data_models__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__);



let data = new _lib__WEBPACK_IMPORTED_MODULE_0__["default"](alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["PersianLanguageModel"], 'hazm')

data.addFeature(alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Feature"].types.part).importer
  .map('proper noun', alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Constants"].POFS_NOUN)

// hazm allow all lemmas in without respect features as all we use it for is lemmatizing
data.setLexemeFilter(function (lexeme) { return Boolean(lexeme.lemma.word) })

/* harmony default export */ __webpack_exports__["default"] = (data);


/***/ }),

/***/ "./tufts/engine/morpheusgrc.js":
/*!*************************************!*\
  !*** ./tufts/engine/morpheusgrc.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib */ "./tufts/lib.js");
/* harmony import */ var alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! alpheios-data-models */ "alpheios-data-models");
/* harmony import */ var alpheios_data_models__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__);



let data = new _lib__WEBPACK_IMPORTED_MODULE_0__["default"](alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["GreekLanguageModel"], 'morpheusgrc')

/*
Below are value conversion maps for each grammatical feature to be parsed.
Format:
data.addFeature(typeName).add(providerValueName, LibValueName);
(functions are chainable)
Types and values that are unknown (undefined) will be skipped during parsing.
 */

data.addFeature(alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Feature"].types.gender).importer
  .map('masculine feminine', [[alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Constants"].GEND_MASCULINE, 1], [alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Constants"].GEND_FEMININE, 2]])

data.addFeature(alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Feature"].types.declension).importer
  .map('1st & 2nd', [[alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Constants"].ORD_1ST, 1], [alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Constants"].ORD_2ND, 2]])

/* harmony default export */ __webpack_exports__["default"] = (data);


/***/ }),

/***/ "./tufts/engine/whitakers.js":
/*!***********************************!*\
  !*** ./tufts/engine/whitakers.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib */ "./tufts/lib.js");
/* harmony import */ var alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! alpheios-data-models */ "alpheios-data-models");
/* harmony import */ var alpheios_data_models__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__);



let data = new _lib__WEBPACK_IMPORTED_MODULE_0__["default"](alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["LatinLanguageModel"], 'whitakerLat')

/*
Below are value conversion maps for each grammatical feature to be parsed.
Format:
data.addFeature(typeName).add(providerValueName, LibValueName);
(functions are chainable)
Types and values that are unknown (undefined) will be skipped during parsing.
 */

// TODO  - per inflections.xsd
// Whitakers Words uses packon and tackon in POFS, not sure how

data.addFeature(alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Feature"].types.gender).importer
  .map('common', [[alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Constants"].GEND_MASCULINE, 1], [alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Constants"].GEND_FEMININE, 2]])
  .map('all', [[alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Constants"].GEND_MASCULINE, 1], [alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Constants"].GEND_FEMININE, 2], [alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Constants"].GEND_NEUTER, 3]])

data.addFeature(alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Feature"].types.tense).importer
  .map('future_perfect', alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Constants"].TENSE_FUTURE_PERFECT)

data.setLemmaParser(function (lemma) {
  // Whitaker's Words returns principal parts for some words
  // and sometimes has a space separted stem and suffix
  let parsed, primary
  let parts = []
  let lemmas = lemma.split(', ')
  for (let [index, l] of lemmas.entries()) {
    let normalized = l.split(' ')[0]
    if (index === 0) {
      primary = normalized
    }
    parts.push(normalized)
  }
  if (primary) {
    parsed = new alpheios_data_models__WEBPACK_IMPORTED_MODULE_1__["Lemma"](primary, this.model.languageCode, parts)
  }

  return parsed
})

/* harmony default export */ __webpack_exports__["default"] = (data);


/***/ }),

/***/ "./tufts/lib.js":
/*!**********************!*\
  !*** ./tufts/lib.js ***!
  \**********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var alpheios_data_models__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alpheios-data-models */ "alpheios-data-models");
/* harmony import */ var alpheios_data_models__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(alpheios_data_models__WEBPACK_IMPORTED_MODULE_0__);
/*
Objects of a morphology analyzer's library
 */


/**
 * Holds all information required to transform from morphological analyzer's grammatical feature values to the
 * library standards. There is one ImportData object per language.
 */
class ImportData {
  /**
     * Creates an ImportData object for the language provided.
     * @param {Function<LanguageModel>} model - A language model of the import data.
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
    this.parseLemma = function (lemma) { return new alpheios_data_models__WEBPACK_IMPORTED_MODULE_0__["Lemma"](lemma, this.model.languageID) }
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
      return lexeme.lemma.features[alpheios_data_models__WEBPACK_IMPORTED_MODULE_0__["Feature"].types.part]
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
        if (model.typeFeature(featureName).hasValue(providerValue) ||
            model.typeFeature(featureName).valuesUnrestricted) {
          mappedValue = model.typeFeature(featureName).createFeature(providerValue, sortOrder)
        } else {
          let message = `Unknown value "${providerValue}" of feature "${featureName}" for ${model.languageCode} (allowed = ${allowUnknownValues})`
          if (allowUnknownValues) {
            console.log(message)
            mappedValue = model.typeFeature(featureName).createFeature(providerValue, sortOrder)
          } else {
            throw new Error(message)
          }
        }
      } else {
        let tempValue = this.importer.get(providerValue)
        if (Array.isArray(tempValue)) {
          mappedValue = model.typeFeature(featureName).createFeatures(tempValue, sortOrder)
        } else {
          mappedValue = model.typeFeature(featureName).createFeature(tempValue, sortOrder)
        }
      }
      return mappedValue
    }

    /**
     * @param {Object[]} data - An array of objects with `providerData` (an item value) and `sortOrder` fields
     * @param allowUnknownValues
     * @return {Feature}
     */
    this[featureName].getMultiple = function get (data, allowUnknownValues = false) {
      let values = [] // Converts values from `data` into `values` array
      for (const item of data) {
        if (this.importer.has(item.providerValue)) {
          let value = this.importer.get(item.providerValue)
          if (Array.isArray(value)) {
            // if the import returns an array, it should already have the sortOrder
            values = value
          } else {
            values = [value, item.sortOrder]
          }
        } else if (model.typeFeature(featureName).hasValue(item.providerValue) ||
          model.typeFeature(featureName).valuesUnrestricted) {
          values.push([item.providerValue, item.sortOrder])
        } else {
          let message = `Unknown value "${item.providerValue}" of feature "${featureName}" for ${model.languageCode} (allowed = ${allowUnknownValues})`
          if (allowUnknownValues) {
            console.log(message)
            values.push([item.providerValue, item.sortOrder])
          } else {
            throw new Error(message)
          }
        }
      }
      return model.typeFeature(featureName).createFeatures(values)
    }

    this[featureName].importer = new alpheios_data_models__WEBPACK_IMPORTED_MODULE_0__["FeatureImporter"]()

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
   * Maps property of a single feature type to a single Feature object with one or more values
   * (if this feature has multiple values). Feature is stored as a property of the supplied model object.
   * @param {object} model the model object to which the feature will be added
   * @param {object} inputElem the input data element
   * @param {object} inputName the  property name in the input data
   * @param {string} featureName the name of the feature it will be mapped to
   * @param {boolean} allowUnknownValues flag to indicate if unknown values are allowed
   */
  mapFeature (model, inputElem, inputName, featureName, allowUnknownValues) {
    let values = []
    let inputItem = inputElem[inputName]
    if (inputItem) {
      if (Array.isArray(inputItem)) {
        // There are multiple values of this feature
        for (let e of inputItem) {
          values.push(...this.parseProperty(inputName, e.$))
        }
      } else {
        values = this.parseProperty(inputName, inputItem.$)
      }
      // `values` is always an array as an array is a return value of `parseProperty`
    }
    if (values.length > 0) {
      // There are some values found
      values = values.map(v => { return { providerValue: v, sortOrder: inputItem.order ? inputItem.order : 1 } })
      let feature = this[alpheios_data_models__WEBPACK_IMPORTED_MODULE_0__["Feature"].types[featureName]].getMultiple(values, allowUnknownValues)
      model.addFeature(feature)
    }
  }
}
/* harmony default export */ __webpack_exports__["default"] = (ImportData);


/***/ }),

/***/ "alpheios-data-models":
/*!***************************************!*\
  !*** external "alpheios-data-models" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_alpheios_data_models__;

/***/ })

/******/ });
});
//# sourceMappingURL=alpheios-morph-client.js.map