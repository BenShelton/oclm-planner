const state = {
  open: false
}

const mutations = {
  SET_OPEN (state, payload) {
    state.open = payload
  },
  TOGGLE_OPEN (state) {
    state.open = !state.open
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
