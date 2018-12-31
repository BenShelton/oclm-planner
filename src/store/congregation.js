import api from '@/api'

const state = {
  members: [],
  loading: true
}

const getters = {
  members: ({ members }) => members,
  loading: ({ loading }) => loading,
  activeMembers: ({ members }) => members.filter(m => m.show),
  idMap: ({ members }) => members.reduce((acc, { _id, name }) => Object.assign(acc, { [_id]: { name } }), {})
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
  },

  update ({ commit }, { memberID, member }) {
    commit('START_LOADING')
    return api.congregation.updateMember({ memberID, member })
      .then(res => commit('UPDATE_MEMBER', res.data.result))
  },

  delete ({ commit }, { memberID }) {
    commit('START_LOADING')
    return api.congregation.deleteMember({ memberID })
      .then(() => commit('DELETE_MEMBER', memberID))
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
  UPDATE_MEMBER (state, payload) {
    const existingMember = state.members.find(m => m._id === payload._id)
    Object.assign(existingMember, payload)
    state.loading = false
  },
  DELETE_MEMBER (state, payload) {
    const existingMemberIndex = state.members.findIndex(m => m._id === payload)
    state.members.splice(existingMemberIndex, 1)
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
