import axios, { AxiosResponse } from 'axios'
import store from '@/store'
import router from '@/router'
import routes from '@/router/routes'
import { ICongregationMember } from '@/ts/interfaces'
import { ScheduleWeek } from '@/ts/types'

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

type APIResponse<T> = Promise<AxiosResponse<{ result: T }>>

export default {
  auth: {
    login: ({ password }): APIResponse<{ token: string }> => api.post('/auth/login', { password }),
    logout: (): APIResponse<void> => api.get('/auth/logout')
  },
  congregation: {
    members: (): APIResponse<ICongregationMember[]> => api.get('/congregation/members'),
    addMember: ({ name, appointment, gender, languageGroup, privileges, show }): APIResponse<ICongregationMember> => api.post('/congregation/addMember', { name, appointment, gender, languageGroup, privileges, show }),
    updateMember: ({ memberID, member }): APIResponse<ICongregationMember> => api.post('/congregation/updateMember', { memberID, member }),
    deleteMember: ({ memberID }): APIResponse<void> => api.delete(`/congregation/deleteMember/${memberID}`)
  },
  schedule: {
    week: ({ date }): APIResponse<ScheduleWeek> => api.get(`/schedule/week/${date}`),
    month: ({ month }): APIResponse<ScheduleWeek[]> => api.get(`/schedule/month/${month}`),
    scrape: ({ weekID, language }) => api.put(`/schedule/scrape/`, { weekID, language }),
    updateAssignment: ({ weekID, language, name, assignment }) => api.put(`/schedule/updateAssignment`, { weekID, language, name, assignment }),
    deleteAssignment: ({ weekID, language, name }) => api.put(`/schedule/deleteAssignment`, { weekID, language, name }),
    updateWeekType: ({ weekID, language, type }) => api.put(`/schedule/updateWeekType`, { weekID, language, type }),
    updateCOName: ({ weekID, language, name }) => api.put(`/schedule/updateCOName`, { weekID, language, name }),
    updateCOTitle: ({ weekID, language, title }) => api.put(`/schedule/updateCOTitle`, { weekID, language, title })
  }
}
