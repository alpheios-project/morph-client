import ImportData from '../lib'
import * as Models from 'alpheios-data-models'

let data = new ImportData(Models.PersianLanguageModel, 'hazm')
let types = Models.Feature.types

data.addFeature(Models.Feature.types.part).importer
  .map('proper noun', Models.Constants.POFS_NOUN)

// hazm allow all lemmas in without respect features as all we use it for is lemmatizing
data.setLexemeFilter(function (lexeme) { return Boolean(lexeme.lemma.word) })

export default data
