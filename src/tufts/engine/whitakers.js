import ImportData from '../lib'
import * as Models from 'alpheios-data-models'

let data = new ImportData(Models.LatinLanguageModel, 'whitakerLat')

/*
Below are value conversion maps for each grammatical feature to be parsed.
Format:
data.addFeature(typeName).add(providerValueName, LibValueName);
(functions are chainable)
Types and values that are unknown (undefined) will be skipped during parsing.
 */

// TODO  - per inflections.xsd
// Whitakers Words uses packon and tackon in POFS, not sure how

data.addFeature(Models.Feature.types.gender).importer
  .map('common', [[Models.Constants.GEND_MASCULINE, 1], [Models.Constants.GEND_FEMININE, 2]])
  .map('all', [[Models.Constants.GEND_MASCULINE, 1], [Models.Constants.GEND_FEMININE, 2], [Models.Constants.GEND_NEUTER, 3]])

data.addFeature(Models.Feature.types.tense).importer
  .map('future_perfect', Models.Constants.TENSE_FUTURE_PERFECT)

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
    parsed = new Models.Lemma(primary, this.model.languageCode, parts)
  }

  return parsed
})

export default data
