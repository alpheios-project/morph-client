const webpack = {
  common: {
    entry: './driver.js',
    externals: {
      'alpheios-data-models-node': 'alpheios-data-models-node'
    },
    target: "node"
  },

  production: {
    output: {filename: 'alpheios-morph-client-node.min.js'}
  },
  development: {
    output: {filename: 'alpheios-morph-client-node.js'}
  }
}

export { webpack }
