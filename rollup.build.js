const rollup = require('rollup')
const resolve = require('rollup-plugin-node-resolve')

const defaultPlugins = [
  resolve({
    // use "module" field for ES6 module if possible
    module: true, // Default: true
    jsnext: true,  // Default: false
    main: true,  // Default: true
    browser: true  // Default: false
  })
]

// Standalone bundle
rollup.rollup({
  entry: 'src/base_adapter.js',
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
  entry: 'src/base_adapter.js',
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
