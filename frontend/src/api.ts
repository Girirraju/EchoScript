import axios from 'axios'
import { bearerToken } from './auth/session'
import type { Capabilities, Job } from './types'
import { audioContentType } from './lib/audio'

export const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const client = axios.create({ baseURL: apiBase, timeout: 20000 })
client.interceptors.request.use(config => {
  const token = bearerToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const api = {
  jobs: async () => (await client.get<Job[]>('/api/jobs')).data,
  job: async (id: string) => (await client.get<Job>(`/api/jobs/${id}`)).data,
  capabilities: async () => (await client.get<Capabilities>('/api/capabilities')).data,
  start: async (id: string) => (await client.post<Job>(`/api/jobs/${id}/start`)).data,
  video: async (id: string) => (await client.post<Job>(`/api/jobs/${id}/video`)).data,
  create: async (file: File, language: string) => (await client.post('/api/jobs', { filename: file.name, content_type: audioContentType(file), size_bytes: file.size, language, generate_video: false })).data as { job: Job; upload_url: string; upload_method: string; upload_headers: Record<string, string> },
}
export function absoluteAsset(path?: string) { return path ? `${apiBase}${path}` : undefined }
