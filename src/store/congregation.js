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
    const payload = testMembers
    return new Promise(resolve => {
      setTimeout(() => {
        commit('LOAD_MEMBERS', payload)
        this.loading = false
        resolve()
      }, 2000)
    })
  }
}

const mutations = {
  LOAD_MEMBERS (state, payload) {
    state.members = payload
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

const testMembers = [
  {
    id: 0,
    name: 'John Smith',
    abbreviation: 'J. Smith',
    appointment: 'Elder',
    gender: 'Male',
    show: true,
    privileges: {
      chairman: true,
      highlights: true,
      gems: true,
      items: true,
      bookStudy: true,
      reader: true,
      prayer: true,
      initialCall: true,
      initialCallAssist: true,
      returnVisit: true,
      returnVisitAssist: true,
      bibleStudy: true,
      bibleStudyAssist: true,
      studentTalk: true
    }
  },
  {
    id: 1,
    name: 'Ben Jones',
    abbreviation: 'B. Jones',
    gender: 'Male',
    show: true,
    privileges: {}
  },
  {
    id: 2,
    name: 'Portuguese Sister',
    abbreviation: 'P. Sister',
    gender: 'Female',
    languageGroup: 'Portuguese',
    show: true,
    privileges: {}
  }
]
