const webpack = {
  common: {
    entry: './driver.js',
    externals: {
      'alpheios-data-models': 'alpheios-data-models'
    }
  },

  production: {
    output: {filename: 'alpheios-morph-client.min.js'}
  },
  development: {
    output: {filename: 'alpheios-morph-client.js'}
  }
}

export { webpack }
