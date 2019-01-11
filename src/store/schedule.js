import api from '@/api'

const state = {
  weeks: [],
  selectedAssignee: ''
}

const getters = {
  selectedAssignee: state => state.selectedAssignee
}

const actions = {
  loadWeek ({ state, commit }, { date }) {
    const week = state.weeks.find(w => w.date === date)
    if (week) return Promise.resolve(week)
    return api.schedule.week({ date })
      .then(res => {
        const week = res.data.result
        commit('LOAD_WEEK', week)
        return week
      })
  },
  loadMonth (store, { month }) {
    return api.schedule.month({ month })
      .then(res => res.data.result)
  },
  scrapeWeek ({ commit }, { weekID }) {
    return api.schedule.scrape({ weekID })
      .then(res => {
        const scrapedWeek = res.data.result
        commit('UPDATE_WEEK', scrapedWeek)
        return scrapedWeek
      })
  },
  updateAssignment ({ commit }, { weekID, name, assignment }) {
    return api.schedule.updateAssignment({ weekID, name, assignment })
      .then(res => {
        const { week, members } = res.data.result
        commit('UPDATE_WEEK', week)
        for (const member of members) {
          commit('congregation/UPDATE_MEMBER', member, { root: true })
        }
        return week
      })
  }
}

const mutations = {
  LOAD_WEEK (state, payload) {
    state.weeks.push(payload)
  },
  UPDATE_WEEK (state, payload) {
    const prevIndex = state.weeks.find(w => w._id === payload._id)
    state.weeks.splice(prevIndex, 1, payload)
  },
  CLEAR_WEEKS (state) {
    Object.assign(state, { weeks: [] })
  },
  UPDATE_SELECTED_ASSIGNEE (state, payload) {
    Object.assign(state, { selectedAssignee: payload })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
