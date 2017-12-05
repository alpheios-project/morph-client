/* eslint-env jest */
'use strict'
import BaseAdapter from '../src/base_adapter.js'

describe('BaseAdapter object', () => {
  let adapter

  beforeAll(() => {
    window.fetch = require('jest-fetch-mock')
    adapter = new BaseAdapter({})
  })

  test('failure upon fetch without url', async () => {
    try {
      adapter.fetch('lat', 'mare')
    } catch (e) {
      expect(e).toMatch('error')
    }
  })

  test('fetch call', async () => {
    let dummyResponse = {'foo': 'bar'}
    adapter.prepareRequestUrl = jest.fn(() => 'dummy')
    window.fetch.mockResponse(JSON.stringify(dummyResponse))
    let response = await adapter.fetch('lat', 'mare')
    expect(response).toEqual(dummyResponse)
  })
})
