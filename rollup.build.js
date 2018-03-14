const rollup = require('rollup')
const string = require('rollup-plugin-string')
const resolve = require('rollup-plugin-node-resolve')

const defaultPlugins = [
  string({
    include: ['src/tufts/engine/data/**/*.json', 'src/**/*.json']
  }),
  resolve({
    // use "module" field for ES6 module if possible
    module: true, // Default: true
    jsnext: true, // Default: false
    main: true, // Default: true
    browser: true // Default: false
  })
]

// Standalone bundle
rollup.rollup({
  entry: 'src/driver.js',
  moduleName: 'BaseAdapter',
  plugins: defaultPlugins
}).then(bundle => {
  bundle.write({
    format: 'es',
    dest: 'dist/alpheios-morph-client.standalone.js',
    sourceMap: true
  })
}).catch(reason => {
  'use strict'
  console.error(reason)
})

// Module bundle
rollup.rollup({
  entry: 'src/driver.js',
  external: ['alpheios-data-models'],
  moduleName: 'BaseAdapter',
  plugins: defaultPlugins
}).then(bundle => {
  bundle.write({
    format: 'es',
    dest: 'dist/alpheios-morph-client.module-external.js',
    sourceMap: false
  })
}).catch(reason => {
  'use strict'
  console.error(reason)
})
