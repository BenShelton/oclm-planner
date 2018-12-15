import api, { updateHeaders } from '@/api'

const state = {
  token: ''
}

const getters = {
  hasToken: state => !!state.token
}

const actions = {
  requestToken ({ dispatch }, { password }) {
    dispatch('setToken', '')
    return api.auth.requestToken({ password })
      .then(res => dispatch('setToken', { token: res.data.result }))
  },
  setToken ({ commit }, { token }) {
    commit('UPDATE_TOKEN', token)
    updateHeaders({ token })
  }
}

const mutations = {
  UPDATE_TOKEN (state, payload) {
    state.token = payload
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
