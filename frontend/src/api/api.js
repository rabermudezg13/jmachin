import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL: `${BASE_URL}/api` })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accountant_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Auth ────────────────────────────────────────────────────────────────────
export const registerAccountant = (data) => api.post('/auth/register', data)
export const loginAccountant = (data) => api.post('/auth/login', data)
export const getMe = () => api.get('/auth/me')

// ─── Submissions ─────────────────────────────────────────────────────────────
export const createSubmission = (data) => api.post('/submissions/', data)
export const updateSubmission = (token, data) => api.put(`/submissions/${token}`, data)
export const getSubmissionByToken = (token) => api.get(`/submissions/by-token/${token}`)

// ─── Accountant-only ─────────────────────────────────────────────────────────
export const listSubmissions = () => api.get('/submissions/')
export const getSubmission = (id) => api.get(`/submissions/${id}`)
export const deleteSubmission = (id) => api.delete(`/submissions/${id}`)

// ─── Exports ─────────────────────────────────────────────────────────────────
export const downloadPDF = (id) =>
  api.get(`/export/${id}/pdf`, { responseType: 'blob' })

export const downloadExcel = (id) =>
  api.get(`/export/${id}/excel`, { responseType: 'blob' })

export const downloadPDFByToken = (token) =>
  api.get(`/export/by-token/${token}/pdf`, { responseType: 'blob' })

export const downloadExcelByToken = (token) =>
  api.get(`/export/by-token/${token}/excel`, { responseType: 'blob' })

// ─── Helper: trigger browser download ────────────────────────────────────────
export const triggerDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
