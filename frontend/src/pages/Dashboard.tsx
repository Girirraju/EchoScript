import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, CheckCircle2, ChevronRight, FileAudio, Film, FolderOpen, LoaderCircle, Mic2, MoreHorizontal, Plus, UploadCloud, WandSparkles } from 'lucide-react'
import Empty from '../components/Empty'
import Shell from '../components/Shell'
import PageHead from '../components/PageHead'
import QuickCard from '../components/QuickCard'
import JobRow from '../components/JobRow'
import { useJobs } from '../hooks/useJobs'

export default function Dashboard() {
  const { data: jobs = [], isLoading } = useJobs()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('ALL')
  const completed = jobs.filter(job => job.status === 'TRANSCRIBED').length
  const running = jobs.filter(job => ['CREATED', 'UPLOADED', 'RUNNING'].includes(job.status)).length
  const videos = jobs.filter(job => job.video_status === 'DONE').length
  const visible = jobs.filter(job => filter === 'ALL' || (filter === 'COMPLETED' ? job.status === 'TRANSCRIBED' : job.status === filter)).slice(0, 5)
  const metrics = [{ icon: FileAudio, label: 'Total audio jobs', value: jobs.length, tone: 'orange' }, { icon: CheckCircle2, label: 'Completed transcripts', value: completed, tone: 'green' }, { icon: LoaderCircle, label: 'Currently processing', value: running, tone: 'blue' }, { icon: Film, label: 'Generated recap videos', value: videos, tone: 'purple' }]
  return <Shell><div className="page"><PageHead eyebrow={new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()} title="Welcome back, Alex" subtitle="Manage your audio, track transcription progress, and create AI-powered recaps." actions={<><button className="button secondary" onClick={() => navigate('/studio/video')}><WandSparkles />Open AI Studio</button><button className="button primary" onClick={() => navigate('/studio/transcribe')}><Plus />New transcription</button></>} />
    <div className="metrics">{metrics.map(({ icon: Icon, label, value, tone }) => <article className="metric-card" key={label}><div className={`metric-icon ${tone}`}><Icon /></div><div><strong>{isLoading ? '—' : value}</strong><span>{label}</span></div><MoreHorizontal /></article>)}</div>
    <section className="panel activity-panel"><div className="panel-head"><div><h2>Recent activity</h2><p>Your latest audio processing jobs</p></div><button className="text-button" onClick={() => navigate('/jobs')}>View all jobs <ChevronRight /></button></div><div className="tabs">{['ALL', 'RUNNING', 'COMPLETED', 'FAILED'].map(tab => <button className={filter === tab ? 'active' : ''} onClick={() => setFilter(tab)} key={tab}>{tab === 'ALL' ? 'All' : tab[0] + tab.slice(1).toLowerCase()}</button>)}</div>
      <div className="activity-list">{visible.length ? visible.map(job => <JobRow job={job} key={job.id} />) : <Empty title="Your studio is ready" body="Upload your first recording to generate a transcript and subtitles." action={<button className="button primary" onClick={() => navigate('/studio/transcribe')}><UploadCloud />Upload audio</button>} />}</div></section>
    <section className="section"><div className="section-title"><div><h2>Start creating</h2><p>Move from raw audio to useful content in a few clicks.</p></div></div><div className="quick-grid"><QuickCard tone="coral" icon={Mic2} title="Transcribe audio" body="Upload recordings and generate accurate transcripts and subtitles." action="Start transcription" onClick={() => navigate('/studio/transcribe')} /><QuickCard tone="violet" icon={Bot} title="Create AI recap" body="Turn a completed transcript into a concise presenter-led video." action="Open AI studio" onClick={() => navigate('/studio/video')} /><QuickCard tone="sage" icon={FolderOpen} title="Explore your library" body="Find every transcript, subtitle file, and generated recap." action="Browse files" onClick={() => navigate('/library')} /></div></section>
  </div></Shell>
}
