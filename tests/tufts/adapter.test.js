/* eslint-env jest */
'use strict'
import TuftsAdapter from '../../src/tufts/adapter.js'
import * as Models from 'alpheios-data-models'

describe('TuftsAdapter object', () => {
  beforeAll(() => {
  })

  test('default config', () => {
    let adapter = new TuftsAdapter()
    expect(adapter.config).toBeTruthy()
    expect(adapter.config.engine).toBeTruthy()
  })

  test('get correct engine for language', () => {
    let adapter = new TuftsAdapter()
    let data = adapter.getEngineLanguageMap('grc')
    expect(data.engine).toEqual('morpheusgrc')
  })

  test('get persian engine', () => {
    let adapter = new TuftsAdapter()
    let data = adapter.getEngineLanguageMap('per')
    expect(data.engine).toEqual('hazm')
  })

  test('default values are returned', () => {
    let adapter = new TuftsAdapter()
    let retrieved = adapter.getEngineLanguageMap('grc')[Models.Feature.types.grmCase].get('nominative')
    let def = new Models.Feature(Models.Feature.types.grmCase, 'nominative', Models.Constants.LANG_GREEK)
    expect(retrieved).toEqual(def)
  })

  test('mapped values are returned', () => {
    let adapter = new TuftsAdapter()
    let retrieved = adapter.getEngineLanguageMap('grc')[Models.Feature.types.gender].get('masculine feminine')
    let def = new Models.Feature(
      Models.Feature.types.gender,
      [[Models.Constants.GEND_FEMININE, 1], [Models.Constants.GEND_MASCULINE, 1]],
      Models.Constants.LANG_GREEK
    )
    expect(retrieved).toEqual(def)
  })

  test('unmapped values with no defaults throws an error if unknown values not allowed', () => {
    let adapter = new TuftsAdapter({'allowUnknownValues': false})
    expect(() => {
      let retrieved = adapter.getEngineLanguageMap('grc')[Models.Feature.types.person].get('1') // eslint-disable-line no-unused-vars
    }).toThrowError(/unknown value/i)
  })

  test('unmapped values with no defaults still works if unknown values allowed', () => {
    let adapter = new TuftsAdapter()
    let retrieved = adapter.getEngineLanguageMap('grc')[Models.Feature.types.person].get('1', 1, adapter.config.allowUnknownValues) // eslint-disable-line no-unused-vars
    let def = new Models.Feature(Models.Feature.types.person, '1', Models.Constants.LANG_GREEK)

    expect(retrieved).toEqual(def)
  })

  test('we adapted mare properly', () => {
    let adapter = new TuftsAdapter()
    let mare = require('../../src/tufts/engine/data/latin_noun_adj_mare.json')
    let homonym = adapter.transform(mare)
    expect(homonym.lexemes.length).toEqual(3)
    let nounMare = homonym.lexemes.filter(l => l.lemma.word === 'mare')
    expect(nounMare.length).toEqual(1)
    expect(nounMare[0].meaning).toBeTruthy()
    expect(nounMare[0].lemma.features.declension.value).toEqual('3rd')
    expect(nounMare[0].lemma.features['part of speech'].value).toEqual('noun')
    expect(nounMare[0].provider.uri).toEqual('org.perseus:tools:morpheus.v1')
    expect(nounMare[0].provider.toString()).toMatch(/Morpheus/)
    let nounMarum = homonym.lexemes.filter(l => l.lemma.word === 'marum')
    expect(nounMarum.length).toEqual(1)
    let adjMas = homonym.lexemes.filter(l => l.lemma.word === 'mas')
    expect(adjMas.length).toEqual(1)
    expect(nounMare[0].inflections.length).toEqual(4)
    let vocative = 0
    for (let c of nounMare[0].inflections.map(i => i[Models.Feature.types.grmCase])) {
      if (c.values.includes('vocative')) { vocative++ }
    }
    expect(vocative).toEqual(1)
  })

  test('we adapted cupidinibus properly', () => {
    let adapter = new TuftsAdapter()
    let data = require('../../src/tufts/engine/data/latin_noun_cupidinibus.json')
    let homonym = adapter.transform(data)
    expect(homonym.lexemes.length).toEqual(2)
    let word = homonym.lexemes.filter(l => l.lemma.word === 'cupido')
    expect(word.length).toEqual(1)
    expect(word[0].lemma.features.frequency.value).toEqual('frequent')
    expect(word[0].lemma.features.frequency.items[0].sortOrder).toEqual(5)
    expect(word[0].lemma.features.source.value).toEqual('Ox.Lat.Dict.')
  })

  test('parses dialect stemtype derivtype morph', () => {
    let adapter = new TuftsAdapter()
    let word = require('../../src/tufts/engine/data/greek_elonu.json')
    let homonym = adapter.transform(word)
    expect(homonym.lexemes.length).toEqual(1)
    expect(homonym.lexemes[0].inflections.length).toEqual(2)
    expect(homonym.lexemes[0].inflections[0].dialect.value).toEqual('Attic')
    expect(homonym.lexemes[0].inflections[0].stemtype.value).toEqual('aw_fut')
    expect(homonym.lexemes[0].inflections[0].derivtype.value).toEqual('a_stem')
    expect(homonym.lexemes[0].inflections[0].morph.value).toEqual('contr')
  })

  test('multiple dict and mean entries', () => {
    let adapter = new TuftsAdapter()
    let data = require('../../src/tufts/engine/data/latin_conditum.json')
    let homonym = adapter.transform(data)
    expect(homonym.lexemes.length).toEqual(6)
    expect(homonym.lexemes[5].meaning.shortDefs.length).toEqual(1)
    expect(homonym.lexemes[5].lemma.principalParts).toEqual(['conditus', 'condita', 'conditior', 'conditissimus'])
    expect(homonym.lexemes[5].meaning.shortDefs[0].text).toEqual('seasoned, spiced up, flavored, savory; polished, ornamented (discourse/style);')
    expect(homonym.lexemes[5].provider).toBeTruthy()
    expect(homonym.lexemes[5].inflections.length).toEqual(4)
    expect(homonym.lexemes[4].meaning.shortDefs.length).toEqual(1)
    expect(homonym.lexemes[4].lemma.principalParts).toEqual(['conditus', 'condita', 'conditum'])
    expect(homonym.lexemes[4].meaning.shortDefs[0].text).toEqual('preserved, kept in store; hidden, concealed, secret; sunken (eyes);')
    expect(homonym.lexemes[4].meaning.shortDefs[0].lemmaText).toEqual('conditus')
    expect(homonym.lexemes[4].inflections.length).toEqual(4)
    expect(homonym.lexemes[0].meaning.shortDefs.length).toEqual(3)
  })

  test('lemma from infl', () => {
    let adapter = new TuftsAdapter()
    let data = require('../../src/tufts/engine/data/latin_sui.json')
    let homonym = adapter.transform(data)
    expect(homonym.lexemes.length).toEqual(6)
    expect(homonym.lexemes[5].lemma.word).toEqual('sui')
  })

  test('lemma filter', () => {
    let adapter = new TuftsAdapter()
    let data = require('../../src/tufts/engine/data/latin_comp.json')
    let homonym = adapter.transform(data)
    expect(homonym.lexemes.length).toEqual(2)
    expect(homonym.lexemes[0].lemma.word).toEqual('mellitus')
    expect(homonym.lexemes[1].lemma.word).toEqual('que')
    data = require('../../src/tufts/engine/data/hazm.json')
    homonym = adapter.transform(data)
    expect(homonym.lexemes.length).toEqual(1)
  })

  test('multivalued features', () => {
    let adapter = new TuftsAdapter()
    let data = require('../../src/tufts/engine/data/multival.json')
    let homonym = adapter.transform(data)
    expect(homonym.lexemes.length).toEqual(5)
    expect(homonym.lexemes[3].inflections[0].morph.values.length).toEqual(2)
  })
})
