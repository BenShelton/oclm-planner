import axios from 'axios'
import store from '@/store'
import router from '@/router'
import routes from '@/router/routes'

const api = axios.create({
  baseURL: '/.netlify/functions/api'
})

api.interceptors.request.use(config => {
  config.headers.authorization = store.state.auth.token
  return config
})

api.interceptors.response.use(r => r, err => {
  if (err.response.status === 403) {
    store.commit('auth/CLEAR_TOKEN')
    store.commit('alert/UPDATE_ALERT', { text: 'Login has expired, please login again', color: 'error' })
    router.push({ name: routes.LOGIN })
  }
  return Promise.reject(err)
})

export default {
  auth: {
    login: ({ password }) => api.post('/auth/login', { password }),
    logout: () => api.get('/auth/logout')
  },
  congregation: {
    members: () => api.get('/congregation/members'),
    addMember: ({ name, abbreviation, appointment, gender, languageGroup, privileges, show }) => api.post('/congregation/addMember', { name, abbreviation, appointment, gender, languageGroup, privileges, show }),
    updateMember: ({ memberID, member }) => api.post('/congregation/updateMember', { memberID, member }),
    deleteMember: ({ memberID }) => api.delete(`/congregation/deleteMember/${memberID}`)
  },
  schedule: {
    week: ({ date }) => api.get(`/schedule/week/${date}`),
    month: ({ month }) => api.get(`/schedule/month/${month}`),
    scrape: ({ weekID, language }) => api.put(`/schedule/scrape/`, { weekID, language }),
    updateAssignment: ({ weekID, language, name, assignment }) => api.put(`/schedule/updateAssignment`, { weekID, language, name, assignment }),
    updateWeekType: ({ weekID, language, type }) => api.put(`/schedule/updateWeekType`, { weekID, language, type }),
    updateCOName: ({ weekID, language, name }) => api.put(`/schedule/updateCOName`, { weekID, language, name }),
    updateCOTitle: ({ weekID, language, title }) => api.put(`/schedule/updateCOTitle`, { weekID, language, title })
  }
}
