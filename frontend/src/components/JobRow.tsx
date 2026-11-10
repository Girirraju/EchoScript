import { useNavigate } from 'react-router-dom'
import { ChevronRight, FileAudio } from 'lucide-react'
import type { Job } from '../types'
import StatusPill from '../components/StatusPill'

export default function JobRow({ job }: { job: Job }) {
  const navigate = useNavigate()
  return <button className="job-row" onClick={() => navigate(`/jobs/${job.id}`)}><span className="file-icon"><FileAudio /></span><div className="job-main"><b>{job.filename}</b><span>{new Date(job.created_at).toLocaleString()} · {(job.size_bytes / 1_048_576).toFixed(1)} MB</span></div><StatusPill status={job.status} /><span className="job-action">{job.status === 'TRANSCRIBED' ? 'View results' : job.status === 'FAILED' ? 'Review error' : 'View progress'}<ChevronRight /></span></button>
}
