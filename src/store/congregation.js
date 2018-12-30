import api from '@/api'

const state = {
  members: [],
  loading: true
}

const getters = {
  members: ({ members }) => members,
  loading: ({ loading }) => loading,
  activeMembers: ({ members }) => members.filter(m => m.show)
}

const actions = {
  load ({ commit }) {
    commit('START_LOADING')
    return api.congregation.members()
      .then(res => commit('LOAD_MEMBERS', res.data.result))
  },

  add ({ commit }, payload) {
    commit('START_LOADING')
    return api.congregation.addMember(payload)
      .then(res => commit('ADD_MEMBER', res.data.result))
  }
}

const mutations = {
  LOAD_MEMBERS (state, payload) {
    state.members = payload
    state.loading = false
  },
  ADD_MEMBER (state, payload) {
    state.members.push(payload)
    state.loading = false
  },
  START_LOADING (state) {
    state.loading = true
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
