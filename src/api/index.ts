import axios from 'axios'
import store from '@/store'
import router from '@/router'
import routes from '@/router/routes'
import { APITypes } from 'types'

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
    login: (data: APITypes.Auth.Login.Data) => api.post<APITypes.Auth.Login.Response>('/auth/login', data),
    logout: () => api.get<APITypes.Auth.Logout.Response>('/auth/logout')
  },
  congregation: {
    members: () => api.get<APITypes.Congregation.GetMembers.Response>('/congregation/members'),
    addMember: (data: APITypes.Congregation.AddMember.Data) => api.post<APITypes.Congregation.AddMember.Response>('/congregation/addMember', data),
    updateMember: (data: APITypes.Congregation.UpdateMember.Data) => api.post<APITypes.Congregation.UpdateMember.Response>('/congregation/updateMember', data),
    deleteMember: ({ memberID }: APITypes.Congregation.DeleteMember.Data) => api.delete(`/congregation/deleteMember/${memberID}`)
  },
  schedule: {
    week: ({ date }: APITypes.Schedule.GetWeek.Data) => api.get<APITypes.Schedule.GetWeek.Response>(`/schedule/week/${date}`),
    month: ({ month }: APITypes.Schedule.GetMonth.Data) => api.get<APITypes.Schedule.GetMonth.Response>(`/schedule/month/${month}`),
    scrape: (data: APITypes.Schedule.ScrapeWeek.Data) => api.put<APITypes.Schedule.ScrapeWeek.Response>(`/schedule/scrape/`, data),
    updateAssignment: (data: APITypes.Schedule.UpdateAssignment.Data) => api.put<APITypes.Schedule.UpdateAssignment.Response>(`/schedule/updateAssignment`, data),
    deleteAssignment: (data: APITypes.Schedule.DeleteAssignment.Data) => api.put<APITypes.Schedule.DeleteAssignment.Response>(`/schedule/deleteAssignment`, data),
    updateWeekType: (data: APITypes.Schedule.UpdateWeekType.Data) => api.put<APITypes.Schedule.UpdateWeekType.Response>(`/schedule/updateWeekType`, data),
    updateCOName: (data: APITypes.Schedule.UpdateCOName.Data) => api.put<APITypes.Schedule.UpdateCOName.Response>(`/schedule/updateCOName`, data),
    updateCOTitle: (data: APITypes.Schedule.UpdateCOTitle.Data) => api.put<APITypes.Schedule.UpdateCOTitle.Response>(`/schedule/updateCOTitle`, data)
  }
}
