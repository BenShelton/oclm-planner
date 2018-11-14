import { expect } from 'chai'

import drawer from '@/store/drawer'

describe('Store: Drawer', () => {
  it('has the correct starting state', () => {
    expect(drawer.state).to.deep.equal({
      open: false
    })
  })

  describe('Mutations', () => {
    describe('SET_OPEN', () => {
      it('sets the open state to the payload', () => {
        const mutation = drawer.mutations.SET_OPEN
        const state = { open: false }
        mutation(state, true)
        expect(state.open).to.be.true
        mutation(state, true)
        expect(state.open).to.be.true
        mutation(state, false)
        expect(state.open).to.be.false
      })
    })

    describe('SET_OPEN', () => {
      it('toggles the open state', () => {
        const mutation = drawer.mutations.TOGGLE_OPEN
        const state = { open: false }
        mutation(state)
        expect(state.open).to.be.true
        mutation(state)
        expect(state.open).to.be.false
        mutation(state)
        expect(state.open).to.be.true
      })
    })
  })
})
