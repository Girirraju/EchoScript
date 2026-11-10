import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { BookOpen, Check, CheckCircle2, ChevronRight, FileAudio, FileText, LoaderCircle, Play, RefreshCw, User, Video, WandSparkles } from 'lucide-react'
import { api } from '../api'
import Empty from '../components/Empty'
import Shell from '../components/Shell'
import PageHead from '../components/PageHead'
import { useJobs } from '../hooks/useJobs'

export default function VideoStudio() {
  const { data: jobs = [] } = useJobs()
  const capabilities = useQuery({ queryKey: ['capabilities'], queryFn: api.capabilities })
  const completed = jobs.filter(job => job.status === 'TRANSCRIBED')
  const [selectedId, setSelectedId] = useState('')
  const selected = completed.find(job => job.id === selectedId)
  const [script, setScript] = useState('')
  const [avatar, setAvatar] = useState('demo-nova')
  const [voice, setVoice] = useState('demo-clear')
  const [step, setStep] = useState(1)
  const videoMutation = useMutation({ mutationFn: () => api.video(selectedId), onSuccess: () => setStep(4) })
  const proceed = () => { if (step === 1 && selected) setScript(selected.transcript_preview || ''); setStep(Math.min(4, step + 1)) }
  return <Shell><div className="page"><PageHead eyebrow="ECHOSCRIPT CREATIVE" title="AI Recap Studio" subtitle="Transform your transcripts into engaging AI-presenter videos." /><div className="workflow"><div className="workflow-steps">{['Choose transcript', 'Prepare script', 'Avatar & voice', 'Generate recap'].map((label, index) => <button key={label} className={step === index + 1 ? 'active' : step > index + 1 ? 'done' : ''} onClick={() => index + 1 <= step && setStep(index + 1)}><span>{step > index + 1 ? <Check /> : index + 1}</span><div><small>STEP {index + 1}</small><b>{label}</b></div></button>)}</div><section className="panel creator-panel">
      {step === 1 && <><div className="creator-head"><span><BookOpen /></span><div><h2>Choose a completed transcript</h2><p>Select the knowledge you want to turn into a visual recap.</p></div></div><div className="select-list">{completed.length ? completed.map(job => <button className={selectedId === job.id ? 'selected' : ''} key={job.id} onClick={() => setSelectedId(job.id)}><span><FileAudio /></span><div><b>{job.filename}</b><small>{new Date(job.created_at).toLocaleDateString()} · Transcript ready</small></div>{selectedId === job.id ? <CheckCircle2 /> : <span className="radio" />}</button>) : <Empty title="No completed transcripts yet" body="Finish a transcription first, then return to create a recap." />}</div></>}
      {step === 2 && <><div className="creator-head"><span><FileText /></span><div><h2>Shape the recap script</h2><p>Review the generated summary and make it sound like you.</p></div></div><label className="script-editor"><textarea value={script} onChange={event => setScript(event.target.value.slice(0, capabilities.data?.video.max_script_characters || 1500))} /><span>{script.length} / {capabilities.data?.video.max_script_characters || 1500} characters</span></label><button className="text-button" onClick={() => setScript(selected?.transcript_preview || '')}><RefreshCw />Restore generated summary</button></>}
      {step === 3 && <><div className="creator-head"><span><User /></span><div><h2>Choose a presenter</h2><p>Demo personas are replaced by backend-provided HeyGen IDs in production.</p></div></div><div className="avatar-grid">{(capabilities.data?.video.avatars || []).map((item, index) => <button key={item.id} onClick={() => setAvatar(item.id)} className={avatar === item.id ? 'selected' : ''}><span className={`avatar-art avatar-${index + 1}`}><User /></span><b>{item.name}</b><small>{item.role}</small>{avatar === item.id && <CheckCircle2 />}</button>)}</div><label className="voice-select"><span>Presenter voice</span><select value={voice} onChange={event => setVoice(event.target.value)}>{(capabilities.data?.video.voices || []).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button><Play />Preview</button></label></>}
      {step === 4 && <div className="review-card"><div className="review-visual"><span><Video /></span><div className="review-wave">{Array.from({ length: 20 }, (_, i) => <i key={i} style={{ height: `${10 + ((i * 11) % 38)}px` }} />)}</div></div><span className="eyebrow">READY TO CREATE</span><h2>Your recap is composed</h2><p>EchoScript will render the selected transcript with your presenter and voice. This may take several minutes with the production provider.</p><div className="review-summary"><div><FileAudio /><span><small>Transcript</small><b>{selected?.filename}</b></span></div><div><User /><span><small>Presenter</small><b>{avatar.replace('demo-', '')} · {voice.replace('demo-', '')}</b></span></div></div><button className="button primary large" onClick={() => videoMutation.mutate()} disabled={!selected || videoMutation.isPending}>{videoMutation.isPending ? <LoaderCircle className="spin" /> : <WandSparkles />}Generate recap video</button></div>}
      {step < 4 && <div className="creator-footer"><button className="button ghost" disabled={step === 1} onClick={() => setStep(step - 1)}>Back</button><button className="button primary" disabled={(step === 1 && !selectedId) || (step === 2 && !script.trim())} onClick={proceed}>Continue<ChevronRight /></button></div>}
    </section></div></div></Shell>
}
