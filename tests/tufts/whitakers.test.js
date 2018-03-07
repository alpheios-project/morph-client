/* eslint-env jest */
import Whitakers from '../../src/tufts/engine/whitakers'

describe('Whitakers', () => {
  test('parses multiple lemmas', () => {
    let parse = 'sumo, sumere, sumsi, sumtus'
    let lemma = Whitakers.parseLemma(parse)
    expect(lemma.word).toEqual('sumo')
    expect(lemma.language).toEqual('lat')
    expect(lemma.principalParts).toEqual(['sumo', 'sumere', 'sumsi', 'sumtus'])
  })

  test('parses space-separated lemma', () => {
    let parse = 'cap io'
    let lemma = Whitakers.parseLemma(parse)
    expect(lemma.word).toEqual('cap')
  })
})
