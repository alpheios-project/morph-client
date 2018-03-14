import ImportData from '../lib'
import * as Models from 'alpheios-data-models'

let data = new ImportData(Models.ArabicLanguageModel, 'aramorph')
let types = Models.GrmFeature.types

data.addFeature(Models.GrmFeature.types.part).importer
  .map('proper noun', [data.model.features[types.part][Models.Constants.POFS_NOUN]])

export default data
