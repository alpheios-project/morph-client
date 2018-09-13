/* eslint-env jest */
import { Constants } from 'alpheios-data-models'
import Whitakers from '../../src/tufts/engine/whitakers'

describe('Whitakers', () => {
  afterAll(() => {
    jest.clearAllMocks()
  })

  test('parses multiple lemmas', () => {
    let parse = 'sumo, sumere, sumsi, sumtus'
    let lemma = Whitakers.parseLemma(parse)
    expect(lemma.word).toEqual('sumo')
    expect(lemma.languageID).toEqual(Constants.LANG_LATIN)
    expect(lemma.principalParts).toEqual(['sumo', 'sumere', 'sumsi', 'sumtus'])
  })

  test('parses space-separated lemma', () => {
    let parse = 'cap io'
    let lemma = Whitakers.parseLemma(parse)
    expect(lemma.word).toEqual('cap')
  })

  test('parses irregular conjugation', () => {
    let parsed = Whitakers.parseProperty('conj', '5th')
    expect(parsed).toEqual([Constants.TYPE_IRREGULAR])
    parsed = Whitakers.parseProperty('conj', '6th')
    expect(parsed).toEqual([Constants.TYPE_IRREGULAR])
    parsed = Whitakers.parseProperty('conj', '7th')
    expect(parsed).toEqual([Constants.TYPE_IRREGULAR])
    parsed = Whitakers.parseProperty('conj', '8th')
    expect(parsed).toEqual([Constants.TYPE_IRREGULAR])
  })

  test('overrides inflection conjugation with lemma conjugation', () => {
    let mockInflection = {
      addFeature: function (feature) {}
    }
    let mockLemma = {
      features: { conjugation: 'foo' }
    }
    jest.spyOn(mockInflection, 'addFeature')
    Whitakers.overrideInflectionFeatureIfRequired('conjugation', mockInflection, [mockLemma])
    expect(mockInflection.addFeature).toHaveBeenCalled()
  })

  test('does not overrides inflection property with lemma property', () => {
    let mockInflection = {
      addFeature: function (feature) {}
    }
    let mockLemma = {
      features: { declension: 'foo' }
    }
    jest.spyOn(mockInflection, 'addFeature')
    Whitakers.overrideInflectionFeatureIfRequired('declension', mockInflection, [mockLemma])
    expect(mockInflection.addFeature).not.toHaveBeenCalled()
  })

  test('does not overrides inflection conjugation with undefined lemma property', () => {
    let mockInflection = {
      addFeature: function (feature) {}
    }
    let mockLemma = {
      features: { }
    }
    jest.spyOn(mockInflection, 'addFeature')
    Whitakers.overrideInflectionFeatureIfRequired('conjugation', mockInflection, [mockLemma])
    expect(mockInflection.addFeature).not.toHaveBeenCalled()
  })
})
