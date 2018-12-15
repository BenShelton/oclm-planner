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
    login: ({ password }) => api.post('/auth/login', { password }),
    logout: () => api.get('/auth/logout')
  },
  schedule: {
    week: ({ date }) => api.get(`/schedule/week/${date}`),
    updateAssignment: ({ weekID, name, assignment }) => api.put(`/schedule/updateAssignment`, { weekID, name, assignment })
  }
}
