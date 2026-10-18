import axios from 'axios'
import type { Capabilities, Job } from './types'

export const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const client = axios.create({ baseURL: apiBase, timeout: 20000 })

export const api = {
  jobs: async () => (await client.get<Job[]>('/api/jobs')).data,
  job: async (id: string) => (await client.get<Job>(`/api/jobs/${id}`)).data,
  capabilities: async () => (await client.get<Capabilities>('/api/capabilities')).data,
  start: async (id: string) => (await client.post<Job>(`/api/jobs/${id}/start`)).data,
  video: async (id: string) => (await client.post<Job>(`/api/jobs/${id}/video`)).data,
  create: async (file: File, language: string, generateVideo: boolean) => (await client.post('/api/jobs', { filename: file.name, content_type: file.type || mimeFromName(file.name), size_bytes: file.size, language, generate_video: generateVideo })).data as { job: Job; upload_url: string; upload_method: string; upload_headers: Record<string, string> },
}

function mimeFromName(name: string) {
  const extension = name.split('.').pop()?.toLowerCase()
  return extension === 'wav' ? 'audio/wav' : extension === 'm4a' ? 'audio/mp4' : 'audio/mpeg'
}

export function absoluteAsset(path?: string) {
  return path ? `${apiBase}${path}` : undefined
}

export function uploadFile(url: string, file: File, headers: Record<string, string>, onProgress: (value: number) => void, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('PUT', url)
    Object.entries(headers).forEach(([key, value]) => request.setRequestHeader(key, value))
    request.upload.onprogress = event => event.lengthComputable && onProgress(Math.round((event.loaded / event.total) * 100))
    request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error('Upload failed'))
    request.onerror = () => reject(new Error('Network error while uploading'))
    signal.addEventListener('abort', () => { request.abort(); reject(new DOMException('Upload cancelled', 'AbortError')) })
    request.send(file)
  })
}

