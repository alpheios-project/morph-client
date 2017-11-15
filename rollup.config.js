import resolve from 'rollup-plugin-node-resolve'
export default {
  entry: 'src/base_adapter.js',
  plugins: [
    resolve({
      module: true, // Default: true
      jsnext: true,  // Default: false
      main: true,  // Default: true
      browser: true,  // Default: false
      namedExports: {
      }
    })
  ],
  moduleName: 'AlpheiosTuftsAdapter',
  targets: [
    {
      dest: 'dist/alpheios-morph-client.js',
      format: 'es',
      sourceMap: true
    }
  ]
}
