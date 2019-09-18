import drawer from '@/store/modules/drawer'

describe('Store: Drawer', () => {
  it('should have the correct starting state', () => {
    expect(drawer.state).toEqual({
      open: false
    })
  })

  describe('Mutations', () => {
    describe('SET_OPEN', () => {
      it('should set the open state to the payload', () => {
        const mutation = drawer.mutations!.SET_OPEN
        const state = { open: false }
        mutation(state, true)
        expect(state.open).toBe(true)
        mutation(state, true)
        expect(state.open).toBe(true)
        mutation(state, false)
        expect(state.open).toBe(false)
      })
    })

    describe('SET_OPEN', () => {
      it('should toggle the open state', () => {
        const mutation = drawer.mutations!.TOGGLE_OPEN
        const state = { open: false }
        mutation(state)
        expect(state.open).toBe(true)
        mutation(state)
        expect(state.open).toBe(false)
        mutation(state)
        expect(state.open).toBe(true)
      })
    })
  })
})
