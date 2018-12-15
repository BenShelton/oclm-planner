import api from '@/api'

const state = {
  token: ''
}

const getters = {
  hasToken: state => !!state.token
}

const actions = {
  requestToken ({ commit }, { password }) {
    commit('CLEAR_TOKEN')
    return api.auth.requestToken({ password })
      .then(res => commit('UPDATE_TOKEN', res.data.result))
  }
}

const mutations = {
  UPDATE_TOKEN (state, payload) {
    state.token = payload
  },
  CLEAR_TOKEN (state) {
    state.token = ''
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
