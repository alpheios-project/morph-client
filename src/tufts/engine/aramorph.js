import ImportData from '../lib'
import * as Models from 'alpheios-data-models'

let data = new ImportData(Models.ArabicLanguageModel, 'aramorph')

data.addFeature(Models.Feature.types.part).importer
  .map('proper noun', Models.Constants.POFS_NOUN)

export default data
