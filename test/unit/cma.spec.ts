import { expect } from 'chai'
import { createCMAClient } from '../../lib/cma'
import { IdsAPI } from '../../lib/types'

describe('createCMAClient()', function () {
  it('Creates a CMA client', function () {
    const ids: IdsAPI = {
      space: 'space',
      environment: 'environment',
      environmentAlias: 'environmentAlias',
      organization: 'organization',
      extension: 'extension',
      user: 'user',
      field: 'field',
      entry: 'entry',
      contentType: 'contentType',
    }

    const client = createCMAClient(ids, { addHandler: () => {} } as any)
    expect(client).to.be.an('object')
  })
})
