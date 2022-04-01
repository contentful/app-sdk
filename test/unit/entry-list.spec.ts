import { sinon, expect } from '../helpers'

import createEntryList from '../../lib/entryList'
import {
  EntryListAPI,
  OnEntryListUpdatedHandler,
  OnEntryListUpdatedHandlerReturn,
} from '../../lib/types'

const DATA_STUB: OnEntryListUpdatedHandlerReturn = {
  data: {
    values: {
      entryId: 'value',
    },
  },
}

describe('createEntryList()', () => {
  describe('returned "entryList" object', () => {
    let channelStub: any
    let entryList: EntryListAPI

    beforeEach(() => {
      channelStub = { addHandler: sinon.spy(), send: sinon.spy() }
      entryList = createEntryList(channelStub)
    })

    describe('.onEntryListUpdated()', () => {
      const test = async (
        handler: OnEntryListUpdatedHandler | undefined,
        result: OnEntryListUpdatedHandlerReturn
      ) => {
        expect(channelStub.addHandler).to.have.been.calledOnce // eslint-disable-line no-unused-expressions
        const [channelMethod, sendMessage] = channelStub.addHandler.args[0]
        expect(channelMethod).to.eql('entryList')

        if (handler) {
          entryList.onEntryListUpdated(handler)
        }
        const msgId = 'testId'
        const msg = { msgId, props: {} }
        const expected = { msgId, result }

        await sendMessage(msg)

        expect(channelStub.send).to.have.been.calledWithExactly('entryListResult', expected)
      }

      it('requires the handler to be a function', () => {
        expect(() => {
          entryList.onEntryListUpdated('wrong handler' as any)
        }).to.throw(/OnEntryListUpdated handler must be a function/)
      })

      it('will only call the last added handler', () => {
        const first = sinon.spy()
        const second = sinon.spy()

        entryList.onEntryListUpdated(first)
        entryList.onEntryListUpdated(second)

        const [, sendMessage] = channelStub.addHandler.args[0]
        sendMessage({ msgId: 'testId', props: {} })

        sinon.assert.notCalled(first)
        sinon.assert.calledOnce(second)
      })

      it('returns false when handler is not defined', () => test(undefined, false))

      it('returns result when handler is sync function', () => test(() => DATA_STUB, DATA_STUB))

      it('returns result when handler is async function', () =>
        test(async () => DATA_STUB, DATA_STUB))

      it('returns false when an error is thrown', () =>
        test(async () => {
          throw new Error()
        }, false))

      it('returns false when a promise rejects', () =>
        test(() => Promise.reject(new Error()), false))
    })
  })
})
