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
        const { week } = res.data
        commit('LOAD_WEEK', week)
        return week
    })
  }
}

const mutations = {
  LOAD_WEEK (state, payload) {
    state.weeks.push(payload)
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}

const defaultWeek = {
  date: '2018-11-19',
  assignments: {
    chairman: { type: 'CHAIRMAN', assignee: 'John Smith' },
    openingPrayer: { type: 'PRAYER', assignee: 'John Smith' },
    talk: { type: 'TALK', assignee: 'John Smith', title: 'Paul Appeals to Caesar and Then Witnesses to King Herod Agrippa', time: '10 min.' },
    gems: { type: 'GEMS', time: '8 min.' },
    bibleReading: { type: 'BIBLE_READING', assignee: 'John Smith', title: 'Ac 25:1-12', studyPoint: 5, time: '4 min. or less' },
    studentTalk1: { type: 'MINISTRY_VIDEO', assignee: 'John Smith', title: 'First Return Visit Video: (5 min.) Play and discuss the video.', time: '5 min.' },
    studentTalk2: { type: 'RETURN_VISIT', assignee: 'John Smith', title: 'First Return Visit: (3 min. or less) Use the sample conversation. (th study 2)', studyPoint: 2, time: '3 min. or less' },
    studentTalk3: { type: 'RETURN_VISIT', assignee: 'John Smith', title: 'First Return Visit: (4 min. or less) Begin with the sample conversation. Then introduce the Teach Us book. (th study 3)', assistant: 'Ben Jones', studyPoint: 3, time: '4 min. or less' },
    serviceTalk1: { type: 'SERVICE_TALK', assignee: 'John Smith', title: '"The Legalisation of the Work in Quebec": (15 min.) Discussion. Play the video.', time: '15 min.' },
    congregationBibleStudy: { type: 'CONGREGATION_BIBLE_STUDY', assignee: 'John Smith', title: 'Jesus The Way chap. 50', time: '30 min.' },
    reader: { type: 'READER', assignee: 'Ben Jones' },
    closingPrayer: { type: 'PRAYER', assignee: 'Ben Jones' }
  }
}
