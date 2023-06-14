import { Channel } from './channel'
import FieldLocale from './field-locale'
import { EntryFieldInfo, FieldType, Items, FieldAPI, FieldLinkType } from './types'
import { ExhaustiveEntryFieldAPI, FieldInfo } from './types/field.types'

export default class Field implements ExhaustiveEntryFieldAPI {
  private _defaultLocale: string
  private _fieldLocales: { [key: string]: FieldAPI }
  id: string
  name: string
  locales: string[]
  type: FieldType
  required: boolean
  validations: Object[]
  items?: Items
  linkType?: FieldLinkType

  constructor(channel: Channel, info: EntryFieldInfo, defaultLocale: string) {
    this.id = info.id
    this.name = info.name
    this.locales = info.locales
    this.type = info.type
    this.required = info.required
    this.validations = info.validations
    if (info.type === 'Array') {
      this.items = info.items
    }
    if (info.type === 'Link') {
      this.linkType = info.linkType
    }

    this._defaultLocale = defaultLocale

    this._fieldLocales = info.locales.reduce((acc: { [key: string]: FieldAPI }, locale: string) => {
      const fieldLocale = new FieldLocale(channel, {
        id: info.id,
        name: info.name,
        type: info.type,
        required: info.required,
        validations: info.validations,
        locale,
        items: info.type === 'Array' ? info.items : undefined,
        linkType: info.type === 'Link' ? info.linkType : undefined,
        value: info.values[locale],
        isDisabled: info.isDisabled[locale],
        schemaErrors: info.schemaErrors[locale],
      } as FieldInfo) as FieldAPI

      return { ...acc, [locale]: fieldLocale }
    }, {})

    this.assertHasLocale(defaultLocale)
  }

  getValue(locale?: string) {
    return this._getFieldLocale(locale).getValue()
  }

  async setValue(value: any, locale?: string) {
    return await this._getFieldLocale(locale).setValue(value)
  }

  async removeValue(locale?: string) {
    await this.setValue(undefined, locale)
  }

  onValueChanged(locale: string | ((value: any) => void), handler?: (value: any) => void) {
    const h = handler || locale
    if (!handler) {
      locale = ''
    }
    return this._getFieldLocale(locale as string).onValueChanged(h as any)
  }

  onIsDisabledChanged(
    locale: string | ((isDisabled: boolean) => void),
    handler?: (isDisabled: boolean) => void
  ) {
    const h = handler || locale
    if (!handler) {
      locale = ''
    }

    return this._getFieldLocale(locale as string).onIsDisabledChanged(h as any)
  }

  private _getFieldLocale(locale?: string) {
    locale = locale || this._defaultLocale
    this.assertHasLocale(locale)
    return this._fieldLocales[locale]
  }

  getForLocale(locale: string) {
    if (!locale) {
      throw new Error('getForLocale must be passed a locale')
    }

    return this._getFieldLocale(locale)
  }

  assertHasLocale(locale: string) {
    if (!this._fieldLocales[locale]) {
      throw new Error(`Unknown locale "${locale}" for field "${this.id}"`)
    }
  }
}
