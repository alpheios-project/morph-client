import { ArabicLanguageModel, Constants, Definition, Feature, FeatureImporter, GreekLanguageModel, Homonym, Inflection, LatinLanguageModel, Lemma, Lexeme, PersianLanguageModel, ResourceProvider } from 'alpheios-data-models';

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
   * Fetch response from a remote URL
   * @param {string} lang - the language code
   * @param {string} word - the word to lookup
   * @returns {Promise} a promse which if successful resolves to json response object
   *                    with the results of the analysis
   */
  fetch (lang, word) {
    let url = this.prepareRequestUrl(lang, word);
    return new Promise((resolve, reject) => {
      if (url) {
        window.fetch(url).then(
            function (response) {
              try {
                if (response.ok) {
                  let json = response.json();
                  resolve(json);
                } else {
                  reject(response.statusText);
                }
              } catch (error) {
                reject(error);
              }
            }
          ).catch((error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error(`Unable to prepare parser request url for ${lang}`));
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
        let data = {};
        resolve(data);
      } catch (error) {
        reject(error);
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

/*
Objects of a morphology analyzer's library
 */
/**
 * Holds all information required to transform from morphological analyzer's grammatical feature values to the
 * library standards. There is one ImportData object per language.
 */
class ImportData {
    /**
     * Creates an InmportData object for the language provided.
     * @param {Models.LanguageModel} language - A language of the import data.
     * @param {string} engine - engine code
     */
  constructor (language, engine) {
    'use strict';
    this.language = language;
    this.engine = engine;
    // add all the features that the language supports so that we
    // can return the default values if we don't need to import a mapping
    for (let featureName of Object.keys(language.features)) {
      this.addFeature(featureName);
    }
    // may be overridden by specific engine use via setLemmaParser
    this.parseLemma = function (lemma) { return new Lemma(lemma, this.language.toCode()) };
    // may be overridden by specific engine use via setPropertyParser - default just returns the property value
    // as a list
    this.parseProperty = function (propertyName, propertyValue) {
      let propertyValues = [];
      if (propertyName === 'decl') {
        propertyValues = propertyValue.split('&').map((p) => p.trim());
      } else if (propertyName === 'comp' && propertyValue === 'positive') {
        propertyValues = [];
      } else {
        propertyValues = [propertyValue];
      }
      return propertyValues
    };
    // may be overridden by specifc engine use via setLexemeFilter - default assumes we will have a part of speech
    this.reportLexeme = function (lexeme) {
      return lexeme.lemma.features[Feature.types.part]
    };
  }

    /**
     * Adds a grammatical feature whose values to be mapped.
     * @param {string} featureName - A name of a grammatical feature (i.e. declension, number, etc.)
     * @return {Object} An object that represent a newly created grammatical feature.
     */
  addFeature (featureName) {
    this[featureName] = {};
    let language = this.language;

    this[featureName].add = function add (providerValue, alpheiosValue) {
      this[providerValue] = alpheiosValue;
      return this
    };

    this[featureName].get = function get (providerValue, sortOrder = 1, allowUnknownValues = false) {
      let mappedValue = [];
      if (!this.importer.has(providerValue)) {
        // if the providerValue matches the model value or the model value
        // is unrestricted, return a feature with the providerValue and order
        if (language.features[featureName][providerValue] ||
            language.features[featureName].hasUnrestrictedValue()) {
          mappedValue = language.features[featureName].get(providerValue, sortOrder);
        } else {
          let message = `Unknown value "${providerValue}" of feature "${featureName}" for ${language} (allowed = ${allowUnknownValues})`;
          if (allowUnknownValues) {
            console.log(message);
            mappedValue = language.features[featureName].get(providerValue, sortOrder);
          } else {
            throw new Error(message)
          }
        }
      } else {
        let tempValue = this.importer.get(providerValue);
        if (Array.isArray(tempValue)) {
          mappedValue = [];
          for (let feature of tempValue) {
            mappedValue.push(language.features[featureName].get(feature.value, sortOrder));
          }
        } else {
          mappedValue = language.features[featureName].get(tempValue.value, sortOrder);
        }
      }
      return mappedValue
    };

    this[featureName].importer = new FeatureImporter();

    return this[featureName]
  }

  /**
   * Add an engine-specific lemma parser
   */
  setLemmaParser (callback) {
    this.parseLemma = callback;
  }

  /**
   * Add an engine-specific property parser
   */
  setPropertyParser (callback) {
    this.parseProperty = callback;
  }

  /**
   * Add an engine-specific lexeme filter
   */
  setLexemeFilter (callback) {
    this.reportLexeme = callback;
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
    let mapped = [];
    let values = [];
    if (inputElem[inputName]) {
      if (Array.isArray(inputElem[inputName])) {
        for (let e of inputElem[inputName]) {
          values.push(...this.parseProperty(inputName, e.$));
        }
      } else {
        values = this.parseProperty(inputName, inputElem[inputName].$);
      }
    }
    for (let value of values) {
      let features = this[Feature.types[featureName]].get(
        value, inputElem[inputName].order, allowUnknownValues);
      if (Array.isArray(features)) {
        mapped.push(...features);
      } else {
        mapped.push(features);
      }
    }
    if (mapped.length > 0) {
      model.feature = mapped;
    }
  }
}

let data = new ImportData(new LatinLanguageModel(), 'whitakerLat');
let types = Feature.types;

/*
Below are value conversion maps for each grammatical feature to be parsed.
Format:
data.addFeature(typeName).add(providerValueName, LibValueName);
(functions are chainable)
Types and values that are unknown (undefined) will be skipped during parsing.
 */

 // TODO  - per inflections.xsd
 // Whitakers Words uses packon and tackon in POFS, not sure how

data.addFeature(Feature.types.gender).importer
    .map('common',
  [ data.language.features[types.gender][Constants.GEND_MASCULINE],
    data.language.features[types.gender][Constants.GEND_FEMININE]
  ])
    .map('all',
  [ data.language.features[types.gender][Constants.GEND_MASCULINE],
    data.language.features[types.gender][Constants.GEND_FEMININE],
    data.language.features[types.gender][Constants.GEND_NEUTER]
  ]);

data.addFeature(Feature.types.tense).importer
    .map('future_perfect', data.language.features[types.tense][Constants.TENSE_FUTURE_PERFECT]);

data.setLemmaParser(function (lemma) {
  // Whitaker's Words returns principal parts for some words
  // and sometimes has a space separted stem and suffix
  let parsed, primary;
  let parts = [];
  let lemmas = lemma.split(', ');
  for (let [index, l] of lemmas.entries()) {
    let normalized = l.split(' ')[0];
    if (index === 0) {
      primary = normalized;
    }
    parts.push(normalized);
  }
  if (primary) {
    parsed = new Lemma(primary, this.language.toCode(), parts);
  }

  return parsed
});

let data$1 = new ImportData(new GreekLanguageModel(), 'morpheusgrc');
let types$1 = Feature.types;

/*
Below are value conversion maps for each grammatical feature to be parsed.
Format:
data.addFeature(typeName).add(providerValueName, LibValueName);
(functions are chainable)
Types and values that are unknown (undefined) will be skipped during parsing.
 */

data$1.addFeature(Feature.types.gender).importer
    .map('masculine feminine',
  [ data$1.language.features[types$1.gender][Constants.GEND_MASCULINE],
    data$1.language.features[types$1.gender][Constants.GEND_FEMININE]
  ]);

data$1.addFeature(Feature.types.declension).importer
    .map('1st & 2nd',
  [ data$1.language.features[types$1.declension][Constants.ORD_1ST],
    data$1.language.features[types$1.declension][Constants.ORD_2ND]
  ]);

let data$2 = new ImportData(new ArabicLanguageModel(), 'aramorph');
let types$2 = Feature.types;

data$2.addFeature(Feature.types.part).importer
    .map('proper noun', [data$2.language.features[types$2.part][Constants.POFS_NOUN]]);

let data$3 = new ImportData(new PersianLanguageModel(), 'hazm');
let types$3 = Feature.types;

data$3.addFeature(Feature.types.part).importer
    .map('proper noun', [data$3.language.features[types$3.part][Constants.POFS_NOUN]]);

// hazm allow all lemmas in without respect features as all we use it for is lemmatizing
data$3.setLexemeFilter(function (lexeme) { return Boolean(lexeme.lemma.word) });

var Cupidinibus = "{\n  \"RDF\": {\n    \"Annotation\": {\n      \"about\": \"urn:TuftsMorphologyService:cupidinibus:whitakerLat\",\n      \"creator\": {\n        \"Agent\": {\n          \"about\": \"net.alpheios:tools:wordsxml.v1\"\n        }\n      },\n      \"created\": {\n        \"$\": \"2017-08-10T23:15:29.185581\"\n      },\n      \"hasTarget\": {\n        \"Description\": {\n          \"about\": \"urn:word:cupidinibus\"\n        }\n      },\n      \"title\": {},\n      \"hasBody\": [\n        {\n          \"resource\": \"urn:uuid:idm140578094883136\"\n        },\n        {\n          \"resource\": \"urn:uuid:idm140578158026160\"\n        }\n      ],\n      \"Body\": [\n        {\n          \"about\": \"urn:uuid:idm140578094883136\",\n          \"type\": {\n            \"resource\": \"cnt:ContentAsXML\"\n          },\n          \"rest\": {\n            \"entry\": {\n              \"infl\": [\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"cupidin\"\n                    },\n                    \"suff\": {\n                      \"$\": \"ibus\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 5,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"var\": {\n                    \"$\": \"1st\"\n                  },\n                  \"case\": {\n                    \"order\": 2,\n                    \"$\": \"locative\"\n                  },\n                  \"num\": {\n                    \"$\": \"plural\"\n                  },\n                  \"gend\": {\n                    \"$\": \"masculine\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"cupidin\"\n                    },\n                    \"suff\": {\n                      \"$\": \"ibus\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 5,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"var\": {\n                    \"$\": \"1st\"\n                  },\n                  \"case\": {\n                    \"order\": 5,\n                    \"$\": \"dative\"\n                  },\n                  \"num\": {\n                    \"$\": \"plural\"\n                  },\n                  \"gend\": {\n                    \"$\": \"masculine\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"cupidin\"\n                    },\n                    \"suff\": {\n                      \"$\": \"ibus\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 5,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"var\": {\n                    \"$\": \"1st\"\n                  },\n                  \"case\": {\n                    \"order\": 3,\n                    \"$\": \"ablative\"\n                  },\n                  \"num\": {\n                    \"$\": \"plural\"\n                  },\n                  \"gend\": {\n                    \"$\": \"masculine\"\n                  }\n                }\n              ],\n              \"dict\": {\n                \"hdwd\": {\n                  \"lang\": \"lat\",\n                  \"$\": \"Cupido, Cupidinis\"\n                },\n                \"pofs\": {\n                  \"order\": 5,\n                  \"$\": \"noun\"\n                },\n                \"decl\": {\n                  \"$\": \"3rd\"\n                },\n                \"gend\": {\n                  \"$\": \"masculine\"\n                },\n                \"area\": {\n                  \"$\": \"religion\"\n                },\n                \"freq\": {\n                  \"order\": 4,\n                  \"$\": \"common\"\n                },\n                \"src\": {\n                  \"$\": \"Ox.Lat.Dict.\"\n                }\n              },\n              \"mean\": {\n                \"$\": \"Cupid, son of Venus; personification of carnal desire;\"\n              }\n            }\n          }\n        },\n        {\n          \"about\": \"urn:uuid:idm140578158026160\",\n          \"type\": {\n            \"resource\": \"cnt:ContentAsXML\"\n          },\n          \"rest\": {\n            \"entry\": {\n              \"infl\": [\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"cupidin\"\n                    },\n                    \"suff\": {\n                      \"$\": \"ibus\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 5,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"var\": {\n                    \"$\": \"1st\"\n                  },\n                  \"case\": {\n                    \"order\": 2,\n                    \"$\": \"locative\"\n                  },\n                  \"num\": {\n                    \"$\": \"plural\"\n                  },\n                  \"gend\": {\n                    \"$\": \"common\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"cupidin\"\n                    },\n                    \"suff\": {\n                      \"$\": \"ibus\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 5,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"var\": {\n                    \"$\": \"1st\"\n                  },\n                  \"case\": {\n                    \"order\": 5,\n                    \"$\": \"dative\"\n                  },\n                  \"num\": {\n                    \"$\": \"plural\"\n                  },\n                  \"gend\": {\n                    \"$\": \"common\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"cupidin\"\n                    },\n                    \"suff\": {\n                      \"$\": \"ibus\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 5,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"var\": {\n                    \"$\": \"1st\"\n                  },\n                  \"case\": {\n                    \"order\": 3,\n                    \"$\": \"ablative\"\n                  },\n                  \"num\": {\n                    \"$\": \"plural\"\n                  },\n                  \"gend\": {\n                    \"$\": \"common\"\n                  }\n                }\n              ],\n              \"dict\": {\n                \"hdwd\": {\n                  \"lang\": \"lat\",\n                  \"$\": \"cupido, cupidinis\"\n                },\n                \"pofs\": {\n                  \"order\": 5,\n                  \"$\": \"noun\"\n                },\n                \"decl\": {\n                  \"$\": \"3rd\"\n                },\n                \"gend\": {\n                  \"$\": \"common\"\n                },\n                \"freq\": {\n                  \"order\": 5,\n                  \"$\": \"frequent\"\n                },\n                \"src\": {\n                  \"$\": \"Ox.Lat.Dict.\"\n                }\n              },\n              \"mean\": {\n                \"$\": \"desire/love/wish/longing (passionate); lust; greed, appetite; desire for gain;\"\n              }\n            }\n          }\n        }\n      ]\n    }\n  }\n}\n";

var Mare = "{\n  \"RDF\": {\n    \"Annotation\": {\n      \"about\": \"urn:TuftsMorphologyService:mare:morpheuslat\",\n      \"creator\": {\n        \"Agent\": {\n          \"about\": \"org.perseus:tools:morpheus.v1\"\n        }\n      },\n      \"created\": {\n        \"$\": \"2017-09-08T06:59:48.639180\"\n      },\n      \"rights\": {\n        \"$\": \"Morphology provided by Morpheus from the Perseus Digital Library at Tufts University.\"\n      },\n      \"hasTarget\": {\n        \"Description\": {\n          \"about\": \"urn:word:mare\"\n        }\n      },\n      \"title\": {},\n      \"hasBody\": [\n        {\n          \"resource\": \"urn:uuid:idm140446402389888\"\n        },\n        {\n          \"resource\": \"urn:uuid:idm140446402332400\"\n        },\n        {\n          \"resource\": \"urn:uuid:idm140446402303648\"\n        }\n      ],\n      \"Body\": [\n        {\n          \"about\": \"urn:uuid:idm140446402389888\",\n          \"type\": {\n            \"resource\": \"cnt:ContentAsXML\"\n          },\n          \"rest\": {\n            \"entry\": {\n              \"uri\": \"http://data.perseus.org/collections/urn:cite:perseus:latlexent.lex34070.1\",\n              \"dict\": {\n                \"hdwd\": {\n                  \"lang\": \"lat\",\n                  \"$\": \"mare\"\n                },\n                \"pofs\": {\n                  \"order\": 3,\n                  \"$\": \"noun\"\n                },\n                \"decl\": {\n                  \"$\": \"3rd\"\n                },\n                \"gend\": {\n                  \"$\": \"neuter\"\n                }\n              },\n              \"infl\": [\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"mar\"\n                    },\n                    \"suff\": {\n                      \"$\": \"e\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 3,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"case\": {\n                    \"order\": 3,\n                    \"$\": \"ablative\"\n                  },\n                  \"gend\": {\n                    \"$\": \"neuter\"\n                  },\n                  \"num\": {\n                    \"$\": \"singular\"\n                  },\n                  \"stemtype\": {\n                    \"$\": \"is_is\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"mar\"\n                    },\n                    \"suff\": {\n                      \"$\": \"e\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 3,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"case\": {\n                    \"order\": 7,\n                    \"$\": \"nominative\"\n                  },\n                  \"gend\": {\n                    \"$\": \"neuter\"\n                  },\n                  \"num\": {\n                    \"$\": \"singular\"\n                  },\n                  \"stemtype\": {\n                    \"$\": \"is_is\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"mar\"\n                    },\n                    \"suff\": {\n                      \"$\": \"e\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 3,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"case\": {\n                    \"order\": 1,\n                    \"$\": \"vocative\"\n                  },\n                  \"gend\": {\n                    \"$\": \"neuter\"\n                  },\n                  \"num\": {\n                    \"$\": \"singular\"\n                  },\n                  \"stemtype\": {\n                    \"$\": \"is_is\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"mar\"\n                    },\n                    \"suff\": {\n                      \"$\": \"e\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 3,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"case\": {\n                    \"order\": 4,\n                    \"$\": \"accusative\"\n                  },\n                  \"gend\": {\n                    \"$\": \"neuter\"\n                  },\n                  \"num\": {\n                    \"$\": \"singular\"\n                  },\n                  \"stemtype\": {\n                    \"$\": \"is_is\"\n                  }\n                }\n              ],\n              \"mean\": {\n                \"$\": \"the sea\"\n              }\n            }\n          }\n        },\n        {\n          \"about\": \"urn:uuid:idm140446402332400\",\n          \"type\": {\n            \"resource\": \"cnt:ContentAsXML\"\n          },\n          \"rest\": {\n            \"entry\": {\n              \"uri\": \"http://data.perseus.org/collections/urn:cite:perseus:latlexent.lex34118.1\",\n              \"dict\": {\n                \"hdwd\": {\n                  \"lang\": \"lat\",\n                  \"$\": \"marum\"\n                },\n                \"pofs\": {\n                  \"order\": 3,\n                  \"$\": \"noun\"\n                },\n                \"decl\": {\n                  \"$\": \"2nd\"\n                },\n                \"gend\": {\n                  \"$\": \"neuter\"\n                }\n              },\n              \"infl\": {\n                \"term\": {\n                  \"lang\": \"lat\",\n                  \"stem\": {\n                    \"$\": \"mar\"\n                  },\n                  \"suff\": {\n                    \"$\": \"e\"\n                  }\n                },\n                \"pofs\": {\n                  \"order\": 3,\n                  \"$\": \"noun\"\n                },\n                \"decl\": {\n                  \"$\": \"2nd\"\n                },\n                \"case\": {\n                  \"order\": 1,\n                  \"$\": \"vocative\"\n                },\n                \"gend\": {\n                  \"$\": \"neuter\"\n                },\n                \"num\": {\n                  \"$\": \"singular\"\n                },\n                \"stemtype\": {\n                  \"$\": \"us_i\"\n                }\n              }\n            }\n          }\n        },\n        {\n          \"about\": \"urn:uuid:idm140446402303648\",\n          \"type\": {\n            \"resource\": \"cnt:ContentAsXML\"\n          },\n          \"rest\": {\n            \"entry\": {\n              \"uri\": \"http://data.perseus.org/collections/urn:cite:perseus:latlexent.lex34119.1\",\n              \"dict\": {\n                \"hdwd\": {\n                  \"lang\": \"lat\",\n                  \"$\": \"mas\"\n                },\n                \"pofs\": {\n                  \"order\": 2,\n                  \"$\": \"adjective\"\n                },\n                \"decl\": {\n                  \"$\": \"3rd\"\n                }\n              },\n              \"infl\": [\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"mare\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 2,\n                    \"$\": \"adjective\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"case\": {\n                    \"order\": 3,\n                    \"$\": \"ablative\"\n                  },\n                  \"gend\": {\n                    \"$\": \"masculine\"\n                  },\n                  \"num\": {\n                    \"$\": \"singular\"\n                  },\n                  \"stemtype\": {\n                    \"$\": \"irreg_adj3\"\n                  },\n                  \"morph\": {\n                    \"$\": \"indeclform\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"mare\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 2,\n                    \"$\": \"adjective\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"case\": {\n                    \"order\": 3,\n                    \"$\": \"ablative\"\n                  },\n                  \"gend\": {\n                    \"$\": \"feminine\"\n                  },\n                  \"num\": {\n                    \"$\": \"singular\"\n                  },\n                  \"stemtype\": {\n                    \"$\": \"irreg_adj3\"\n                  },\n                  \"morph\": {\n                    \"$\": \"indeclform\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"mare\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 2,\n                    \"$\": \"adjective\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"case\": {\n                    \"order\": 3,\n                    \"$\": \"ablative\"\n                  },\n                  \"gend\": {\n                    \"$\": \"neuter\"\n                  },\n                  \"num\": {\n                    \"$\": \"singular\"\n                  },\n                  \"stemtype\": {\n                    \"$\": \"irreg_adj3\"\n                  },\n                  \"morph\": {\n                    \"$\": \"indeclform\"\n                  }\n                }\n              ]\n            }\n          }\n        }\n      ]\n    }\n  }\n}\n";

var Cepit = "{\n  \"RDF\": {\n    \"Annotation\": {\n      \"about\": \"urn:TuftsMorphologyService:cepit:whitakerLat\",\n      \"creator\": {\n        \"Agent\": {\n          \"about\": \"net.alpheios:tools:wordsxml.v1\"\n        }\n      },\n      \"created\": {\n        \"$\": \"2017-08-10T23:16:53.672068\"\n      },\n      \"hasTarget\": {\n        \"Description\": {\n          \"about\": \"urn:word:cepit\"\n        }\n      },\n      \"title\": {},\n      \"hasBody\": {\n        \"resource\": \"urn:uuid:idm140578133848416\"\n      },\n      \"Body\": {\n        \"about\": \"urn:uuid:idm140578133848416\",\n        \"type\": {\n          \"resource\": \"cnt:ContentAsXML\"\n        },\n        \"rest\": {\n          \"entry\": {\n            \"infl\": {\n              \"term\": {\n                \"lang\": \"lat\",\n                \"stem\": {\n                  \"$\": \"cep\"\n                },\n                \"suff\": {\n                  \"$\": \"it\"\n                }\n              },\n              \"pofs\": {\n                \"order\": 3,\n                \"$\": \"verb\"\n              },\n              \"conj\": {\n                \"$\": \"3rd\"\n              },\n              \"var\": {\n                \"$\": \"1st\"\n              },\n              \"tense\": {\n                \"$\": \"perfect\"\n              },\n              \"voice\": {\n                \"$\": \"active\"\n              },\n              \"mood\": {\n                \"$\": \"indicative\"\n              },\n              \"pers\": {\n                \"$\": \"3rd\"\n              },\n              \"num\": {\n                \"$\": \"singular\"\n              }\n            },\n            \"dict\": {\n              \"hdwd\": {\n                \"lang\": \"lat\",\n                \"$\": \"capio, capere, cepi, captus\"\n              },\n              \"pofs\": {\n                \"order\": 3,\n                \"$\": \"verb\"\n              },\n              \"conj\": {\n                \"$\": \"3rd\"\n              },\n              \"kind\": {\n                \"$\": \"transitive\"\n              },\n              \"freq\": {\n                \"order\": 6,\n                \"$\": \"very frequent\"\n              },\n              \"src\": {\n                \"$\": \"Ox.Lat.Dict.\"\n              }\n            },\n            \"mean\": {\n              \"$\": \"take hold, seize; grasp; take bribe; arrest/capture; put on; occupy; captivate;\"\n            }\n          }\n        }\n      }\n    }\n  }\n}\n";

var Pilsopo = "{\n  \"RDF\": {\n    \"Annotation\": {\n      \"about\": \"urn:TuftsMorphologyService:φιλόσοφος:morpheuslat\",\n      \"creator\": {\n        \"Agent\": {\n          \"about\": \"org.perseus:tools:morpheus.v1\"\n        }\n      },\n      \"created\": {\n        \"$\": \"2017-10-15T14:06:40.522369\"\n      },\n      \"hasTarget\": {\n        \"Description\": {\n          \"about\": \"urn:word:φιλόσοφος\"\n        }\n      },\n      \"title\": {},\n      \"hasBody\": {\n        \"resource\": \"urn:uuid:idm140446394225264\"\n      },\n      \"Body\": {\n        \"about\": \"urn:uuid:idm140446394225264\",\n        \"type\": {\n          \"resource\": \"cnt:ContentAsXML\"\n        },\n        \"rest\": {\n          \"entry\": {\n            \"uri\": \"http://data.perseus.org/collections/urn:cite:perseus:grclexent.lex78378.1\",\n            \"dict\": {\n              \"hdwd\": {\n                \"lang\": \"grc\",\n                \"$\": \"φιλόσοφος\"\n              },\n              \"pofs\": {\n                \"order\": 3,\n                \"$\": \"noun\"\n              },\n              \"decl\": {\n                \"$\": \"2nd\"\n              },\n              \"gend\": {\n                \"$\": \"masculine\"\n              }\n            },\n            \"infl\": {\n              \"term\": {\n                \"lang\": \"grc\",\n                \"stem\": {\n                  \"$\": \"φιλοσοφ\"\n                },\n                \"suff\": {\n                  \"$\": \"ος\"\n                }\n              },\n              \"pofs\": {\n                \"order\": 3,\n                \"$\": \"noun\"\n              },\n              \"decl\": {\n                \"$\": \"2nd\"\n              },\n              \"case\": {\n                \"order\": 7,\n                \"$\": \"nominative\"\n              },\n              \"gend\": {\n                \"$\": \"masculine\"\n              },\n              \"num\": {\n                \"$\": \"singular\"\n              },\n              \"stemtype\": {\n                \"$\": \"os_ou\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}";

class WordTestData {
  constructor () {
    this._words = {
      'cupidinibus': Cupidinibus,
      'mare': Mare,
      'cepit': Cepit,
      'φιλόσοφος': Pilsopo
    };
  }

  get (word) {
    if (this._words.hasOwnProperty(word)) {
      return this._words[word]
    }
    throw new Error(`Word "${word}" does not exist in test data`)
  }
}

var DefaultConfig = "{\n  \"engine\": {\n    \"lat\": [\"whitakerLat\"],\n    \"grc\": [\"morpheusgrc\"],\n    \"ara\": [\"aramorph\"],\n    \"per\": [\"hazm\"]\n  },\n  \"url\": \"https://morph.alpheios.net/api/v1/analysis/word?word=r_WORD&engine=r_ENGINE&lang=r_LANG\",\n  \"allowUnknownValues\": true\n}\n";

class AlpheiosTuftsAdapter extends BaseAdapter {
  /**
   * A Morph Client Adapter for the Tufts Morphology Service
   * @constructor
   * @param {object} config configuraiton object
   */
  constructor (config = {}) {
    super();
    try {
      this.config = JSON.parse(DefaultConfig);
    } catch (e) {
      this.config = Object.assign({}, DefaultConfig);
    }
    Object.assign(this.config, config);
    this.engineMap = new Map(([ data, data$1, data$2, data$3 ]).map((e) => { return [ e.engine, e ] }));
  }

  getEngineLanguageMap (lang) {
    if (this.config.engine[lang]) {
      return this.engineMap.get(this.config.engine[lang][0])
    } else {
      return null
    }
  }

  prepareRequestUrl (lang, word) {
    let engine = this.getEngineLanguageMap(lang);
    if (engine) {
      let code = engine.engine;
      return this.config.url.replace('r_WORD', word).replace('r_ENGINE', code).replace('r_LANG', lang)
    } else {
      return null
    }
  }

  fetchTestData (lang, word) {
    return new Promise((resolve, reject) => {
      try {
        let wordData = new WordTestData().get(word);
        let json = JSON.parse(wordData);
        resolve(json);
      } catch (error) {
                // Word is not found in test data
        reject(error);
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
    'use strict';
    let lexemes = [];
    let annotationBody = jsonObj.RDF.Annotation.Body;
    if (!Array.isArray(annotationBody)) {
            /*
            If only one lexeme is returned, Annotation Body will not be an array but rather a single object.
            Let's convert it to an array so we can work with it in the same way no matter what format it is.
             */
      if (annotationBody) {
        annotationBody = [annotationBody];
      } else {
        annotationBody = [];
      }
    }
    let providerUri = jsonObj.RDF.Annotation.creator.Agent.about;
    let providerRights = '';
    if (jsonObj.RDF.Annotation.rights) {
      providerRights = jsonObj.RDF.Annotation.rights.$;
    }
    let provider = new ResourceProvider(providerUri, providerRights);
    for (let lexeme of annotationBody) {
      let inflectionsJSON = lexeme.rest.entry.infl;
      if (!inflectionsJSON) {
        inflectionsJSON = [];
      } else if (!Array.isArray(inflectionsJSON)) {
        // If only one inflection returned, it is a single object, not an array of objects.
        // Convert it to an array for uniformity.
        inflectionsJSON = [inflectionsJSON];
      }
      let lemmaElements;
      if ((lexeme.rest.entry.dict && lexeme.rest.entry.dict.hdwd) || (Array.isArray(lexeme.rest.entry.dict) && lexeme.rest.entry.dict[0].hdwd)) {
        if (Array.isArray(lexeme.rest.entry.dict)) {
          lemmaElements = lexeme.rest.entry.dict;
        } else {
          lemmaElements = [lexeme.rest.entry.dict];
        }
      } else if (inflectionsJSON.length > 0 && inflectionsJSON[0].term) {
        lemmaElements = [inflectionsJSON[0].term];
      }
      // in rare cases (e.g. conditum in Whitakers) multiple dict entries
      // exist - always use the lemma and language from the first
      let language = lemmaElements[0].hdwd ? lemmaElements[0].hdwd.lang : lemmaElements[0].lang;
      // Get importer based on the language
      let mappingData = this.getEngineLanguageMap(language);
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
        ['src', 'source']
      ];
      let lemmas = [];
      let lexemeSet = [];
      for (let entry of lemmaElements.entries()) {
        let shortdefs = [];
        let index = entry[0];
        let elem = entry[1];
        let lemmaText;
        if (elem.hdwd) {
          lemmaText = elem.hdwd.$;
        } else {
          // term
          if (elem.stem) {
            lemmaText = elem.stem.$;
          }
          if (elem.suff) {
            lemmaText += elem.suff.$;
          }
        }
        if (!lemmaText || !language) {
          continue
        }
        let lemma = mappingData.parseLemma(lemmaText, language);
        lemmas.push(lemma);
        for (let feature of features) {
          mappingData.mapFeature(lemma, elem, ...feature, this.config.allowUnknownValues);
        }
        let meanings = lexeme.rest.entry.mean;
        if (!Array.isArray(meanings)) {
          meanings = [meanings];
        }
        meanings = meanings.filter((m) => m);
        // if we have multiple dictionary elements, take the meaning with the matching index
        if (lemmaElements.length > 1) {
          if (meanings && meanings[index]) {
            let meaning = meanings[index];
            // TODO: convert a source-specific language code to ISO 639-3 if don't match
            let lang = meaning.lang ? meaning.lang : 'eng';
            shortdefs.push(ResourceProvider.getProxy(provider,
              new Definition(meaning.$, lang, 'text/plain', lemmas[index].word)));
          }
        } else {
          for (let meaning of meanings) {
            let lang = meaning.lang ? meaning.lang : 'eng';
            shortdefs.push(ResourceProvider.getProxy(provider,
              new Definition(meaning.$, lang, 'text/plain', lemma.word)));
          }
        }
        let lexmodel = new Lexeme(lemma, []);

        lexmodel.meaning.appendShortDefs(shortdefs);
        lexemeSet.push(ResourceProvider.getProxy(provider, lexmodel));
      }
      if (lemmas.length === 0) {
        continue
      }
      let inflections = [];
      for (let inflectionJSON of inflectionsJSON) {
        let inflection = new Inflection(inflectionJSON.term.stem.$, mappingData.language.toCode());
        if (inflectionJSON.term.suff) {
                    // Set suffix if provided by a morphological analyzer
          inflection.suffix = inflectionJSON.term.suff.$;
        }

        if (inflectionJSON.xmpl) {
          inflection.example = inflectionJSON.xmpl.$;
        }
        // Parse whatever grammatical features we're interested in
        mappingData.mapFeature(inflection, inflectionJSON, 'pofs', 'part', this.config.allowUnknownValues);
        mappingData.mapFeature(inflection, inflectionJSON, 'case', 'grmCase', this.config.allowUnknownValues);
        mappingData.mapFeature(inflection, inflectionJSON, 'decl', 'declension', this.config.allowUnknownValues);
        mappingData.mapFeature(inflection, inflectionJSON, 'num', 'number', this.config.allowUnknownValues);
        mappingData.mapFeature(inflection, inflectionJSON, 'gend', 'gender', this.config.allowUnknownValues);
        mappingData.mapFeature(inflection, inflectionJSON, 'conj', 'conjugation', this.config.allowUnknownValues);
        mappingData.mapFeature(inflection, inflectionJSON, 'tense', 'tense', this.config.allowUnknownValues);
        mappingData.mapFeature(inflection, inflectionJSON, 'voice', 'voice', this.config.allowUnknownValues);
        mappingData.mapFeature(inflection, inflectionJSON, 'mood', 'mood', this.config.allowUnknownValues);
        mappingData.mapFeature(inflection, inflectionJSON, 'pers', 'person', this.config.allowUnknownValues);
        mappingData.mapFeature(inflection, inflectionJSON, 'comp', 'comparison', this.config.allowUnknownValues);
        if (inflectionJSON.stemtype) {
          mappingData.mapFeature(inflection, inflectionJSON, 'stemtype', 'stemtype', this.config.allowUnknownValues);
        }
        if (inflectionJSON.derivtype) {
          mappingData.mapFeature(inflection, inflectionJSON, 'derivtype', 'derivtype', this.config.allowUnknownValues);
        }
        if (inflectionJSON.dial) {
          mappingData.mapFeature(inflection, inflectionJSON, 'dial', 'dialect', this.config.allowUnknownValues);
        }
        if (inflectionJSON.morph) {
          mappingData.mapFeature(inflection, inflectionJSON, 'morph', 'morph', this.config.allowUnknownValues);
        }
        // we only use the inflection if it tells us something the dictionary details do not
        if (inflection[Feature.types.grmCase] ||
          inflection[Feature.types.tense] ||
          inflection[Feature.types.mood] ||
          inflection[Feature.types.voice] ||
          inflection[Feature.types.person] ||
          inflection[Feature.types.comparison] ||
          inflection[Feature.types.stemtype] ||
          inflection[Feature.types.derivtype] ||
          inflection[Feature.types.dialect] ||
          inflection[Feature.types.morph] ||
          inflection[Feature.types.example]) {
          inflections.push(inflection);
        }
        // inflection can provide lemma decl, pofs, conj
        for (let lemma of lemmas) {
          if (!lemma.features[Feature.types.declension]) {
            mappingData.mapFeature(lemma, inflectionJSON, 'decl', 'declension', this.config.allowUnknownValues);
          }
          if (!lemma.features[Feature.types.part]) {
            mappingData.mapFeature(lemma, inflectionJSON, 'pofs', 'part', this.config.allowUnknownValues);
          }
          if (!lemma.features[Feature.types.conjugation]) {
            mappingData.mapFeature(lemma, inflectionJSON, 'conj', 'conjugation', this.config.allowUnknownValues);
          }
        }
      }
      for (let lex of lexemeSet) {
        // only process if we have a lemma that differs from the target
        // word or if we have at least a part of speech
        if (mappingData.reportLexeme(lex)) {
          lex.inflections = inflections;
          lexemes.push(lex);
        }
      }
    }
    if (lexemes.length > 0) {
      return new Homonym(lexemes, targetWord)
    } else {
      return undefined
    }
  }

  async getHomonym (lang, word) {
    let jsonObj = await this.fetch(lang, word);
    if (jsonObj) {
      let homonym = this.transform(jsonObj, word);
      return homonym
    } else {
        // No data found for this word
      return undefined
    }
  }
}

export { BaseAdapter, AlpheiosTuftsAdapter };
