import ImportData from '../lib'
import * as Models from 'alpheios-data-models'

let data = new ImportData(Models.PersianLanguageModel, 'hazm')
let types = Models.GrmFeature.types

data.addFeature(Models.GrmFeature.types.part).importer
  .map('proper noun', [data.model.features[types.part][Models.Constants.POFS_NOUN]])

// hazm allow all lemmas in without respect features as all we use it for is lemmatizing
data.setLexemeFilter(function (lexeme) { return Boolean(lexeme.lemma.word) })

export default data
