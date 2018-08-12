import ImportData from '../lib'
import * as Models from 'alpheios-data-models-node'

let data = new ImportData(Models.PersianLanguageModel, 'hazm')

// hazm allow all lemmas in without respect features as all we use it for is lemmatizing
data.setLexemeFilter(function (lexeme) { return Boolean(lexeme.lemma.word) })

export default data
