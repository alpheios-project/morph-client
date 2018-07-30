/* eslint-env jest */
'use strict'
import AlpheiosTreebankAdapter from '../../src/alpheiostb/adapter.js'
import fs from 'fs'
import path from 'path'

describe('AlpheiosTreebankAdapter object', () => {
  beforeAll(() => {
  })

  test('default config', () => {
    let adapter = new AlpheiosTreebankAdapter()
    expect(adapter.config).toBeTruthy()
    expect(adapter.config.texts).toBeTruthy()
  })

  test('we adapted a word properly', async () => {
    let adapter = new AlpheiosTreebankAdapter()
    adapter.fetch = () => {
      return new Promise((resolve, reject) => {
        resolve(fs.readFileSync(path.join(__dirname, 'fixtures', 'data.xml'), 'utf8'))
      })
    }
    let homonym = await adapter.getHomonym('lat', 'file#word')
    expect(homonym.lexemes.length).toEqual(1)
    expect(homonym.lexemes[0].lemma.word).toEqual('suus')
    expect(homonym.lexemes[0].lemma.features['part of speech'].value).toEqual('adjective')
    expect(homonym.lexemes[0].inflections[0]['part of speech'].value).toEqual('adjective')
    expect(homonym.lexemes[0].inflections[0]['case'].value).toEqual('ablative')
    expect(homonym.lexemes[0].inflections[0].gender.value).toEqual('masculine')
    expect(homonym.lexemes[0].inflections[0].number.value).toEqual('plural')
  })

  test('we prepared the url properly', () => {
    let adapter = new AlpheiosTreebankAdapter()
    let url = adapter.prepareRequestUrl('lat', '1999.02.0066#1-2')
    expect(url).toEqual('http://tools.alpheios.net/exist/rest/db/xq/treebank-getmorph.xq?f=1999.02.0066&w=1-2')
  })
})
