import axios from 'axios'

const api = axios.create({
  baseURL: '/.netlify/functions/api'
})

export default {
  schedule: {
    week: ({ date }) => api.get(`/schedule/week/${date}`),
    updateAssignment: ({ weekID, name, assignment }) => api.put(`/schedule/updateAssignment`, { weekID, name, assignment })
  }
}
