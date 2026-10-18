export type JobStatus = 'CREATED' | 'UPLOADED' | 'RUNNING' | 'TRANSCRIBED' | 'FAILED'
export type VideoStatus = 'NONE' | 'PENDING' | 'RENDERING' | 'DONE' | 'FAILED'

export interface Job {
  id: string
  filename: string
  content_type: string
  size_bytes: number
  language: string
  generate_video: boolean
  status: JobStatus
  video_status: VideoStatus
  created_at: string
  updated_at: string
  started_at?: string
  completed_at?: string
  duration_seconds?: number
  error_message?: string
  transcript_preview?: string
  outputs: { transcript?: string; srt?: string; vtt?: string; audio?: string; video?: string }
}

export interface Capabilities {
  audio_types: string[]
  extensions: string[]
  max_upload_bytes: number
  languages: { value: string; label: string }[]
  video: { enabled: boolean; mock: boolean; max_script_characters: number; avatars: { id: string; name: string; role: string }[]; voices: { id: string; name: string }[] }
}

