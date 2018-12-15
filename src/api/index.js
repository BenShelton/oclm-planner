import axios from 'axios'
import store from '@/store'

const api = axios.create({
  baseURL: '/.netlify/functions/api'
})

api.interceptors.request.use(config => {
  config.headers.authorization = store.state.auth.token
  return config
})

export default {
  auth: {
    requestToken: ({ password }) => api.post('/auth/requestToken', { password })
  },
  schedule: {
    week: ({ date }) => api.get(`/schedule/week/${date}`),
    updateAssignment: ({ weekID, name, assignment }) => api.put(`/schedule/updateAssignment`, { weekID, name, assignment })
  }
}
