const initialState = {
  text: '',
  color: '',
  visible: false
}

const state = Object.assign({}, initialState)

const mutations = {
  UPDATE_ALERT (state, { text, color = 'primary', visible = true }) {
    Object.assign(state, { text, color, visible })
  },
  UPDATE_VISIBILITY (state, payload) {
    state.visible = payload
  },
  CLEAR_ALERT (state) {
    Object.assign(state, initialState)
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
