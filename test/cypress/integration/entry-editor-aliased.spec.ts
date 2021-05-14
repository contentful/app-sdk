import { entryAliased } from '../utils/paths'
import { role } from '../utils/role'

const post = {
  id: Cypress.env('entries').onValueChanged,
  title: 'My post to test onValueChanged',
  body: 'body value',
}

const iframeSelector = '[data-test-id="cf-ui-workbench-content"] iframe'
const entryExtensionSelector = 'cf-ui-card'

context(`Aliased Entry editor extension (${role})`, () => {
  beforeEach(() => {
    cy.setupBrowserStorage()
    cy.visit(entryAliased(post.id))
    cy.findByTestId('workbench-title').should(($title) => {
      expect($title).to.exist
    })

    cy.waitForIframeWithTestId(entryExtensionSelector)
    cy.get('[data-test-id="cf-ui-workbench-content"]').within(() => {
      cy.get('iframe').captureIFrameAs('extension')
    })
  })

  it('verifies that API calls use the active Alias', () => {
    const aliasId = Cypress.env('activeAliasId')
    const spaceId = Cypress.env('activeSpaceId')
    cy.intercept({
      method: 'GET',
      url: `/spaces/${spaceId}/environments/*/content_types`,
    }).as('contentTypesRequest')
    cy.intercept({
      method: 'GET',
      url: `spaces/${spaceId}/environments/*/entries/${post.id}/tasks`,
    }).as('tasksRequest')

    cy.getSdk(iframeSelector).then(async (sdk) => {
      sdk.space.getContentTypes()
      cy.wait('@contentTypesRequest').its('request.url').should('include', aliasId)
      sdk.entry.getTasks()
      cy.wait('@tasksRequest').its('request.url').should('include', aliasId)
    })
  })
})
