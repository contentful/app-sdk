import { SerializedJSONValue, FieldType, Items } from './utils'
import { FieldAPI } from './field-locale.types'
import { ContentTypeFieldValidation } from './entities'
import { ValidationError } from './validation-error'

interface FieldInfoBase {
  id: string
  locale: string
  required: boolean
  validations: ContentTypeFieldValidation[]
  value: any
  isDisabled: boolean
  schemaErrors: ValidationError[]
}

interface BasicFieldInfo extends FieldInfoBase {
  type: Exclude<FieldType, 'Array' | 'Link'>
}

interface ArrayFieldInfo extends FieldInfoBase {
  type: 'Array'
  items: Items
}

interface LinkFieldInfo extends FieldInfoBase {
  type: 'Link'
  linkType: 'Entry' | 'Asset'
}

export type FieldInfo = BasicFieldInfo | ArrayFieldInfo | LinkFieldInfo

interface EntryFieldInfoBase {
  id: string
  locales: string[]
  required: boolean
  validations: ContentTypeFieldValidation[]
  values: { [locale: string]: any }
  isDisabled: { [locale: string]: boolean }
  schemaErrors: { [locale: string]: ValidationError[] }
}

interface BasicEntryFieldInfo extends EntryFieldInfoBase {
  type: Exclude<FieldType, 'Array' | 'Link'>
}

interface ArrayEntryFieldInfo extends EntryFieldInfoBase {
  type: 'Array'
  items: Items
}

interface LinkEntryFieldInfo extends EntryFieldInfoBase {
  type: 'Link'
  linkType: 'Entry' | 'Asset'
}

export type EntryFieldInfo = BasicEntryFieldInfo | ArrayEntryFieldInfo | LinkEntryFieldInfo

export interface EntryFieldAPIBase {
  /** The ID of a field is defined in an entry's content type. */
  id: string
  /** The list of locales for the field. */
  locales: string[]
  /** Indicates if a value for this field is required */
  required: boolean
  /** A list of validations for this field that are defined in the content type. */
  validations: ContentTypeFieldValidation[]
  /** Gets the current value of the field and locale. */
  getValue: (locale?: string) => any
  /** Sets the value for the field and locale.  */
  setValue: <Value = any>(value: Value, locale?: string) => Promise<SerializedJSONValue | undefined>
  /** Removes the value for the field and locale. */
  removeValue: (locale?: string) => Promise<void>
  /** Calls the callback every time the value of the field is changed by an external event or when setValue() is called.
   *  the returned function can be called to remove the handler function
   **/
  onValueChanged: {
    (callback: (value: any) => void): () => void
    (locale: string, callback: (value: any) => void): () => void
  }
  /** Calls the callback when the disabled status of the field changes.
   *  the returned function can be called to remove the handler function
   **/
  onIsDisabledChanged: {
    (callback: (isDisabled: boolean) => void): () => void
    (locale: string, callback: (isDisabled: boolean) => void): () => void
  }

  /** Get an instance of FieldAPI for this field, specific to the locale that is
   * passed as an argument
   **/
  getForLocale: (locale: string) => FieldAPI
}

interface BasicEntryFieldAPI extends EntryFieldAPIBase {
  /** Holds the type of the field. */
  type: Exclude<FieldType, 'Array'>
}

interface ArrayEntryFieldAPI extends EntryFieldAPIBase {
  /** Holds the type of the field. */
  type: 'Array'
  /** Defines the shape of array items */
  items: Items
}

export interface ExhaustiveEntryFieldAPI extends EntryFieldAPIBase {
  type: FieldType
  items?: Items
}

export type EntryFieldAPI = BasicEntryFieldAPI | ArrayEntryFieldAPI
