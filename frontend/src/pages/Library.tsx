import { useState } from 'react'
import { Download, FileText, Film, Grid2X2, List } from 'lucide-react'
import { absoluteAsset } from '../api'
import Empty from '../components/Empty'
import Shell from '../components/Shell'
import PageHead from '../components/PageHead'
import { useJobs } from '../hooks/useJobs'

export default function Library() {
  const { data: jobs = [] } = useJobs()
  const [tab, setTab] = useState('ALL')
  const [grid, setGrid] = useState(true)
  const files = jobs.flatMap(job => [{ type: 'TRANSCRIPT', ext: 'TXT', path: job.outputs.transcript, job }, { type: 'SUBTITLE', ext: 'SRT', path: job.outputs.srt, job }, { type: 'SUBTITLE', ext: 'VTT', path: job.outputs.vtt, job }, { type: 'VIDEO', ext: 'MP4', path: job.outputs.video, job }]).filter(item => item.path && (tab === 'ALL' || item.type === tab))
  return <Shell><div className="page"><PageHead title="My Library" subtitle="Every transcript, subtitle, and recap—organized around its source audio." /><section className="panel library-panel"><div className="job-toolbar"><div className="tabs">{[['ALL', 'All files'], ['TRANSCRIPT', 'Transcripts'], ['SUBTITLE', 'Subtitles'], ['VIDEO', 'AI recap videos']].map(([value, label]) => <button className={tab === value ? 'active' : ''} onClick={() => setTab(value)} key={value}>{label}</button>)}</div><div className="view-toggle"><button className={grid ? 'active' : ''} onClick={() => setGrid(true)}><Grid2X2 /></button><button className={!grid ? 'active' : ''} onClick={() => setGrid(false)}><List /></button></div></div>{files.length ? <div className={grid ? 'file-grid' : 'file-list'}>{files.map(file => <article className="file-card" key={`${file.job.id}-${file.ext}`}><div className={`file-preview ${file.ext === 'MP4' ? 'video' : ''}`}>{file.ext === 'MP4' ? <Film /> : <FileText />}<span>{file.ext}</span></div><div className="file-meta"><b>{file.job.filename.replace(/\.[^.]+$/, '')}</b><span>{file.type.toLowerCase()} · {new Date(file.job.updated_at).toLocaleDateString()}</span></div><a className="icon-button" href={absoluteAsset(file.path)} title="Download"><Download /></a></article>)}</div> : <Empty title="Your library is waiting" body="Completed jobs will place transcripts, subtitles, and videos here automatically." />}</section></div></Shell>
}
