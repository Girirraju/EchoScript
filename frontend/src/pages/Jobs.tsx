import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RefreshCw, Search } from 'lucide-react'
import Empty from '../components/Empty'
import Shell from '../components/Shell'
import PageHead from '../components/PageHead'
import JobRow from '../components/JobRow'
import { useJobs } from '../hooks/useJobs'

export default function Jobs() {
  const navigate = useNavigate()
  const { data: jobs = [], isLoading, refetch } = useJobs()
  const [tab, setTab] = useState('ALL')
  const [search, setSearch] = useState('')
  const filtered = jobs.filter(job => job.filename.toLowerCase().includes(search.toLowerCase()) && (tab === 'ALL' || (tab === 'COMPLETED' ? job.status === 'TRANSCRIBED' : tab === 'PROCESSING' ? ['CREATED', 'UPLOADED', 'RUNNING'].includes(job.status) : job.status === tab)))
  return <Shell><div className="page"><PageHead title="My Jobs" subtitle="All your audio processing activities in one place." actions={<button className="button primary" onClick={() => navigate('/studio/transcribe')}><Plus />New transcription</button>} /><section className="panel jobs-panel"><div className="job-toolbar"><div className="tabs">{['ALL', 'PROCESSING', 'COMPLETED', 'FAILED'].map(item => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item === 'ALL' ? 'All jobs' : item[0] + item.slice(1).toLowerCase()}</button>)}</div><div className="toolbar-actions"><label className="search"><Search /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search filename" /></label><button className="icon-button" onClick={() => refetch()}><RefreshCw /></button></div></div><div className="jobs-list">{isLoading ? Array.from({ length: 4 }, (_, i) => <div className="skeleton-row" key={i} />) : filtered.length ? filtered.map(job => <JobRow key={job.id} job={job} />) : <Empty title="No jobs match this view" body="Try another filter or upload a new recording." />}</div></section></div></Shell>
}
