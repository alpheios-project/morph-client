/* eslint-env jest */
'use strict'
import BaseAdapter from '../src/base_adapter.js'

describe('BaseAdapter object', () => {
  let adapter

  beforeAll(() => {
    window.fetch = require('jest-fetch-mock')
    adapter = new BaseAdapter({})
  })

  test('fetch call', () => {
    let dummyResponse = {'foo': 'bar'}
    window.fetch.mockResponse(JSON.stringify(dummyResponse))
    adapter.fetch('lat', 'mare').then((response) => {
      expect(response).toEqual(dummyResponse)
    })
  })
})
