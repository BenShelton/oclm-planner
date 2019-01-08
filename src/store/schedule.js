import api from '@/api'

const state = {
  weeks: []
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
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
