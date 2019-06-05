const FieldLocale = require('./field-locale')

const INFO_PROPS = ['id', 'locales', 'type', 'required', 'validations', 'items']

module.exports = class Field {
  constructor (channel, info, defaultLocale) {
    INFO_PROPS.forEach(prop => {
      const value = info[prop]
      if (typeof value !== 'undefined') {
        this[prop] = info[prop]
      }
    })

    this._defaultLocale = defaultLocale

    this._fieldLocales = info.locales.reduce((acc, locale) => {
      const fieldLocale = new FieldLocale(channel, {
        id: info.id,
        locale,
        value: info.values[locale]
      })

      return { ...acc, [locale]: fieldLocale }
    }, {})

    assertHasLocale(this, defaultLocale)
  }

  getValue (locale) {
    return this._getFieldLocale(locale).getValue()
  }

  setValue (value, locale) {
    return this._getFieldLocale(locale).setValue(value)
  }

  removeValue (locale) {
    return this.setValue(undefined, locale)
  }

  onValueChanged (locale, handler) {
    if (!handler) {
      handler = locale
      locale = undefined
    }
    return this._getFieldLocale(locale).onValueChanged(handler)
  }

  onIsDisabledChanged (locale, handler) {
    if (!handler) {
      handler = locale
      locale = undefined
    }

    return this._getFieldLocale(locale).onIsDisabledChanged(handler)
  }

  _getFieldLocale (locale) {
    locale = locale || this._defaultLocale
    assertHasLocale(this, locale)
    return this._fieldLocales[locale]
  }
}

function assertHasLocale (field, locale) {
  if (!field._fieldLocales[locale]) {
    throw new Error(`Unknown locale "${locale}" for field "${field.id}"`)
  }
}
