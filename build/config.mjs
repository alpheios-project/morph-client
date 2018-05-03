const webpack = {
  common: {
    entry: './driver.js',
    externals: {
      'alpheios-morph-client': 'alpheios-morph-client'
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
