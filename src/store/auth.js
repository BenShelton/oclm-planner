import api from '@/api'

const state = {
  token: ''
}

const getters = {
  hasToken: state => !!state.token
}

const actions = {
  login ({ commit }, { password }) {
    commit('CLEAR_TOKEN')
    return api.auth.login({ password })
      .then(res => commit('UPDATE_TOKEN', res.data.result))
  },
  logout ({ commit }) {
    return api.auth.logout()
      .then(() => commit('CLEAR_TOKEN'))
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
