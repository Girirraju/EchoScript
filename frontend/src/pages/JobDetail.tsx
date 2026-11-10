import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CircleAlert, Copy, Download, FileAudio, FileText, LoaderCircle, Mic2, Search, Sparkles, WandSparkles } from 'lucide-react'
import { absoluteAsset, api } from '../api'
import StatusPill from '../components/StatusPill'
import Empty from '../components/Empty'
import Shell from '../components/Shell'

export default function JobDetail() {
  const { jobId = '' } = useParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const jobQuery = useQuery({ queryKey: ['job', jobId], queryFn: () => api.job(jobId), refetchInterval: query => query.state.data && (query.state.data.status === 'RUNNING' || ['PENDING', 'RENDERING'].includes(query.state.data.video_status)) ? 2500 : false })
  const videoMutation = useMutation({ mutationFn: () => api.video(jobId), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job', jobId] }) })
  const job = jobQuery.data
  if (jobQuery.isLoading) return <Shell><div className="page"><div className="detail-skeleton" /></div></Shell>
  if (!job) return <Shell><div className="page"><Empty title="Job not found" body="This job may have been removed or belongs to another user." /></div></Shell>
  const active = ['CREATED', 'UPLOADED', 'RUNNING'].includes(job.status)
  return <Shell><div className="page"><button className="back-link" onClick={() => navigate('/jobs')}><ArrowLeft />Back to my jobs</button><div className="detail-head"><div className="detail-file"><span><FileAudio /></span><div><h1>{job.filename}</h1><p>Uploaded {new Date(job.created_at).toLocaleString()} · {(job.size_bytes / 1_048_576).toFixed(2)} MB</p></div></div><StatusPill status={job.status} /></div>
    {active && <section className="processing-banner"><div className="processing-orb"><span /><Mic2 /></div><div><span>PROCESSING YOUR AUDIO</span><h2>{job.status === 'RUNNING' ? 'Transcribing spoken words…' : 'Preparing your recording…'}</h2><p>We’ll keep this page updated automatically. You can safely leave and come back later.</p><div className="indeterminate"><i /></div></div></section>}
    {job.status === 'FAILED' && <div className="error-banner"><CircleAlert /><div><b>Transcription could not be completed</b><p>{job.error_message || 'Review the audio file and try again.'}</p></div></div>}
    {job.status === 'TRANSCRIBED' && <div className="detail-grid"><section className="panel transcript-panel"><div className="panel-head"><div><span className="eyebrow">TRANSCRIPT</span><h2>Your audio, made searchable</h2></div><div><button className="button secondary small" onClick={() => navigator.clipboard.writeText(job.transcript_preview || '')}><Copy />Copy</button><a className="button primary small" href={absoluteAsset(job.outputs.transcript)} download><Download />Download TXT</a></div></div>{job.outputs.audio && <audio controls src={absoluteAsset(job.outputs.audio)} />}<label className="transcript-search"><Search /><input placeholder="Search transcript" /></label><div className="transcript-copy"><p>{job.transcript_preview}</p></div></section><aside className="result-aside"><section className="panel"><h3>Download results</h3><p>Use your transcript wherever knowledge needs to travel.</p>{[['TXT', 'Plain text transcript', job.outputs.transcript], ['SRT', 'Timed subtitle file', job.outputs.srt], ['VTT', 'Web-ready captions', job.outputs.vtt]].map(([format, label, path]) => <a className={`download-row ${!path ? 'disabled' : ''}`} href={absoluteAsset(path)} key={format}><span><FileText /></span><div><b>{format}</b><small>{label}</small></div><Download /></a>)}</section><section className="panel video-result"><span className="video-symbol"><WandSparkles /></span><h3>{job.video_status === 'DONE' ? 'Your recap is ready' : job.video_status === 'RENDERING' ? 'Rendering your recap' : 'Turn insight into a story'}</h3><p>Create a concise AI-presenter recap from this transcript.</p>{job.video_status === 'DONE' && job.outputs.video ? <><video controls src={absoluteAsset(job.outputs.video)} /><a className="button primary full" href={absoluteAsset(job.outputs.video)}><Download />Download MP4</a></> : job.video_status === 'RENDERING' || job.video_status === 'PENDING' ? <button className="button secondary full" disabled><LoaderCircle className="spin" />Video rendering</button> : <button className="button primary full" onClick={() => videoMutation.mutate()} disabled={videoMutation.isPending}><Sparkles />Generate recap video</button>}</section></aside></div>}
  </div></Shell>
}
