import ImportData from '../lib'
import * as Models from 'alpheios-data-models'

let data = new ImportData(Models.GreekLanguageModel, 'morpheusgrc')
let types = Models.GrmFeature.types

/*
Below are value conversion maps for each grammatical feature to be parsed.
Format:
data.addFeature(typeName).add(providerValueName, LibValueName);
(functions are chainable)
Types and values that are unknown (undefined) will be skipped during parsing.
 */

data.addFeature(Models.GrmFeature.types.gender).importer
  .map('masculine feminine',
    [ data.model.features[types.gender][Models.Constants.GEND_MASCULINE],
      data.model.features[types.gender][Models.Constants.GEND_FEMININE]
    ])

data.addFeature(Models.GrmFeature.types.declension).importer
  .map('1st & 2nd',
    [ data.model.features[types.declension][Models.Constants.ORD_1ST],
      data.model.features[types.declension][Models.Constants.ORD_2ND]
    ])

export default data
