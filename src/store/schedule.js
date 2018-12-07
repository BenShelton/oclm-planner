import api from '@/api'

const state = {
  weeks: []
}

const actions = {
  loadWeek ({ state, commit }, date) {
    const week = state.weeks.find(w => w.date === date)
    if (week) return Promise.resolve(week)
    return api.schedule.week({ date })
      .then(res => {
        const week = res.data.result
        commit('LOAD_WEEK', week)
        return week
      })
  },
  updateAssignment ({ state, commit }, { weekDate, name, assignment }) {
    console.log(assignment)
    const { date, assignments } = state.weeks.find(w => w.date === weekDate) || {}
    const newWeek = { date, assignments: { ...assignments } }
    newWeek.assignments[name] = assignment
    commit('UPDATE_WEEK', newWeek)
    return newWeek
  }
}

const mutations = {
  LOAD_WEEK (state, payload) {
    state.weeks.push(payload)
  },
  UPDATE_WEEK (state, payload) {
    const prevIndex = state.weeks.find(w => w.date === payload.date)
    if (prevIndex) state.weeks.splice(prevIndex, 1, payload)
    else state.weeks.push(payload)
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
