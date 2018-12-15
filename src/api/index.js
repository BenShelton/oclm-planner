import axios from 'axios'

const api = axios.create({
  baseURL: '/.netlify/functions/api'
})

export const updateHeaders = ({ token }) => {
  api.defaults.headers.common.Authorization = token
}

export default {
  auth: {
    requestToken: ({ password }) => api.post('/auth/requestToken', { password })
  },
  schedule: {
    week: ({ date }) => api.get(`/schedule/week/${date}`),
    updateAssignment: ({ weekID, name, assignment }) => api.put(`/schedule/updateAssignment`, { weekID, name, assignment })
  }
}
