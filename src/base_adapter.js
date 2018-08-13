import * as Models from 'alpheios-data-models'
import axios from 'axios'
/**
 * Base Adapter Class for a Morphology Service Client
 */
class BaseAdapter {
  /**
   * Method which is used to prepare a lookup request according
   * to the adapter specific logic
   * @param {string} lang - the language code
   * @param {string} word - the word to lookup
   * @returns {string} the url for the request
   */
  prepareRequestUrl (lang, word) {
    /** must be overridden in the adapter implementation class **/
    return null
  }

  /**
   * Lookup the supplied word using the preconfigured engines and
   * and return a Homonym
   * @param {symbol} languageID - A language ID as defined in Constants.LANG_XXX in data models
   * @param {string} word - the word to lookup
   * @return {Homonym} homonym object
   */
  async getHomonym (languageID, word) {
    // implement in the derived adapter class
    return undefined
  }

  fetchWindow (url, languageID) {
    return new Promise((resolve, reject) => {
      if (url) {
        window.fetch(url).then(
          function (response) {
            try {
              if (response.ok) {
                let json = response.json()
                resolve(json)
              } else {
                reject(response.statusText)
              }
            } catch (error) {
              reject(error)
            }
          }
        ).catch((error) => {
          reject(error)
        }
        )
      } else {
        reject(new Error(`Unable to prepare parser request url for ${languageID.toString()}`))
      }
    })
  }

  async fetchAxios (url, languageID) {
    try {
      let res = await axios.get(url)
      return res.data
    } catch (error) {
      console.error(`Unable to prepare parser request url for ${languageID.toString()}`)
    }
  }
  /**
   * Fetch response from a remote URL
   * @param {symbol} languageID - A language ID
   * @param {string} word - the word to lookup
   * @returns {Promise} a promse which if successful resolves to json response object
   *                    with the results of the analysis
   */
  fetch (languageID, word) {
    const langCode = Models.LanguageModelFactory.getLanguageCodeFromId(languageID)
    let url = this.prepareRequestUrl(langCode, word)

    if (typeof window !== 'undefined') {
      console.info('************************fetch window', url)
      return this.fetchWindow(url, languageID)
    } else {
      console.info('************************fetch axios', url)
      return this.fetchAxios(url, languageID)
    }
  }

  /**
   * Fetch test data to test the adapter
   * @param {string} lang - the language code
   * @param {string} word - the word to lookup
   * @returns {Promise} a promse which if successful resolves to json response object
   *                    with the test data
   */
  fetchTestData (lang, word) {
    return new Promise((resolve, reject) => {
      try {
        let data = {}
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * A function that maps a morphological service's specific data types and values into an inflection library standard.
   * @param {object} jsonObj - A JSON data from the fetch request
   * @param {object} targetWord - the original target word of the analysis
   * @returns {Homonym} A library standard Homonym object.
   */
  transform (jsonObj, targetWord) {
    return {}
  }
}

export default BaseAdapter
