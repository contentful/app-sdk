import { entry } from '../utils/paths'

import {
  openPageExtensionTest,
  openPageExtensionWithSubRoute
} from './reusable/open-page-extension-test'
import { openDialogExtensionTest } from './reusable/open-dialog-extension-test'
import { openEntryTest, openEntrySlideInTest } from './reusable/open-entry-test'
import { openAssetSlideInTest, openAssetTest } from './reusable/open-asset-test'
import { openSdkUserDataTest } from './reusable/open-sdk-user-data-test'
import { openSdkLocalesDataTest } from './reusable/open-sdk-locales-data-test'
import { openSdkEntryDataTest } from './reusable/open-sdk-entry-data-test'
import {
  openSuccessNotificationTest,
  openErrorNotificationTest
} from './reusable/open-notifications-test'
import { verifyLocation } from '../utils/verify-location'
import {
  verifySdkInstallationParameters,
  verifySdkInstanceParameters
} from '../utils/verify-parameters'

const post = {
  id: '1MDrvtuLDk0PcxS5nCkugC',
  title: 'My first post'
}

const iframeSelector = '[data-field-api-name="title"] iframe'
const iframePageSelector = '[data-test-id="page-extension"] iframe'
const idsData = require('./fixtures/ids-data.json')
const contentTypeData = require('./fixtures/content-type-data/field-ext.json')
const parameters = require('./fixtures/parameters.json')

context('Field extension', () => {
  beforeEach(() => {
    cy.setAuthTokenToLocalStorage()
    cy.visit(entry(post.id))
    cy.getByText(post.title).should('exist')
    cy.waitForIFrame()
    cy.get(iframeSelector).captureIFrameAs('extension')
  })

  it('verifies field extension is rendered', () => {
    cy.get('@extension').within(() => {
      cy.getByTestId('cf-ui-text-input').should('exist')
    })
  })

  it('verifies sdk.ids static methods have expected values', () => {
    cy.getSdk(iframeSelector).then(sdk => {
      expect(sdk.ids.contentType).to.equal(idsData.fieldExtension.contentType)
      expect(sdk.ids.entry).to.equal(idsData.fieldExtension.entry)
      expect(sdk.ids.field).to.equal(idsData.fieldExtension.field)
      expect(sdk.ids.environment).to.equal(Cypress.env('activeEnvironmentId'))
      expect(sdk.ids.extension).to.equal(idsData.extension)
      expect(sdk.ids.space).to.equal(idsData.space)
      expect(sdk.ids.user).to.equal(idsData.user)
    })
  })

  it('verifies sdk.contentType static methods have expected values', () => {
    cy.getSdk(iframeSelector).then(sdk => {
      contentTypeData.sys.environment.sys.id = Cypress.env('activeEnvironmentId')
      expect(sdk.contentType).to.deep.equal(contentTypeData)
    })
  })

  it('verifies sdk.location.is entry-field', () => {
    cy.getSdk(iframeSelector).then(sdk => {
      verifyLocation(sdk, 'entry-field')
    })
  })

  it('verifies sdk.parameters have expected values', () => {
    cy.getSdk(iframeSelector).then(sdk => {
      verifySdkInstallationParameters(iframeSelector)
      // for field extension custom instance parameter is set in UI.
      parameters.instance.instanceParameterEnumId = 'option2'
      verifySdkInstanceParameters(iframeSelector)
    })
  })

  it('verifies opened page extension contains path in sdk.parameteres.invocation)', () => {
    openPageExtensionWithSubRoute(iframeSelector)
    cy.waitForIFrame()
    cy.getSdk(iframePageSelector).then(sdk => {
      expect(sdk.parameters.invocation).to.deep.equal({ path: location.pathname })
    })
  })

  /* Reusable tests */

  openPageExtensionTest(iframeSelector)
  openDialogExtensionTest(iframeSelector)
  openEntryTest(iframeSelector)
  openEntrySlideInTest(iframeSelector, post.id)
  openAssetTest(iframeSelector)
  openAssetSlideInTest(iframeSelector, post.id)
  openSdkUserDataTest(iframeSelector)
  openSdkLocalesDataTest(iframeSelector)
  openSdkEntryDataTest(iframeSelector)
  openSuccessNotificationTest(iframeSelector)
  openErrorNotificationTest(iframeSelector)
})
