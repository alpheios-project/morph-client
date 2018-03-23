import ImportData from '../lib'
import * as Models from 'alpheios-data-models'

let data = new ImportData(Models.GreekLanguageModel, 'morpheusgrc')

/*
Below are value conversion maps for each grammatical feature to be parsed.
Format:
data.addFeature(typeName).add(providerValueName, LibValueName);
(functions are chainable)
Types and values that are unknown (undefined) will be skipped during parsing.
 */

data.addFeature(Models.Feature.types.gender).importer
  .map('masculine feminine', [Models.Constants.GEND_MASCULINE, Models.Constants.GEND_FEMININE])

data.addFeature(Models.Feature.types.declension).importer
  .map('1st & 2nd', [Models.Constants.ORD_1ST, Models.Constants.ORD_2ND])

export default data
