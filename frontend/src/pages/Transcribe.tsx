import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Check, CircleAlert, CloudUpload, FileAudio, Headphones, Languages, LoaderCircle, Sparkles, WandSparkles, Zap } from 'lucide-react'
import { api } from '../api'
import { uploadFile } from '../lib/upload'
import Shell from '../components/Shell'
import PageHead from '../components/PageHead'

export default function Transcribe() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [language, setLanguage] = useState('auto')
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const controller = useRef<AbortController | null>(null)
  const capabilities = useQuery({ queryKey: ['capabilities'], queryFn: api.capabilities })
  const submit = async () => {
    if (!file) return
    setError(''); setProgress(0); setStage('Creating job')
    controller.current = new AbortController()
    try {
      const created = await api.create(file, language)
      setStage('Uploading audio')
      await uploadFile(created.upload_url, file, created.upload_headers, setProgress, controller.current.signal)
      setStage('Starting transcription'); await api.start(created.job.id)
      navigate(`/jobs/${created.job.id}`)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to start transcription'); setStage('') }
  }
  const choose = (candidate?: File) => {
    if (!candidate) return
    const extension = candidate.name.split('.').pop()?.toLowerCase()
    if (!['mp3', 'wav', 'm4a'].includes(extension || '')) return setError('Choose an MP3, WAV, or M4A audio file.')
    if (candidate.size > (capabilities.data?.max_upload_bytes || 262_144_000)) return setError('This file exceeds the configured upload limit.')
    setFile(candidate); setError(''); setProgress(0)
  }
  return <Shell><div className="page narrow"><PageHead eyebrow="AUDIO WORKSPACE" title="New transcription" subtitle="Upload your audio and let EchoScript handle the rest." />
    <div className="studio-layout"><section className="panel upload-panel"><div className="step-label"><span>1</span><div><h2>Add your audio</h2><p>Start with a recording, lecture, meeting, or podcast.</p></div></div>
      <div className={`dropzone ${file ? 'has-file' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); choose(event.dataTransfer.files[0]) }}><input ref={inputRef} type="file" accept=".mp3,.wav,.m4a,audio/*" hidden onChange={event => choose(event.target.files?.[0])} />{file ? <><span className="selected-file"><FileAudio /></span><h3>{file.name}</h3><p>{(file.size / 1_048_576).toFixed(2)} MB · Ready to upload</p><div><button className="text-button">Replace file</button><button className="text-button danger" onClick={event => { event.stopPropagation(); setFile(null) }}>Remove</button></div></> : <><span className="upload-icon"><CloudUpload /></span><h3>Drag and drop your audio here</h3><p>or <b>browse files</b> from your device</p><small>MP3, WAV or M4A · Up to {Math.round((capabilities.data?.max_upload_bytes || 262_144_000) / 1_048_576)} MB</small></>}</div>
      {error && <div className="inline-error"><CircleAlert />{error}</div>}
      <div className="step-label options-step"><span>2</span><div><h2>Choose transcription language</h2><p>Your audio will produce a transcript and subtitle files only.</p></div></div><div className="option-grid"><label><span><Languages />Transcription language</span><select value={language} onChange={event => setLanguage(event.target.value)}>{(capabilities.data?.languages || [{ value: 'auto', label: 'Auto-detect' }, { value: 'en', label: 'English' }]).map(item => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label><label className="toggle-option"><span><WandSparkles />AI video is a separate feature<small>After transcription, open AI Recap Studio whenever you want to create a HeyGen video.</small></span></label></div>
      {stage && <div className="upload-progress"><div><span>{stage}</span><b>{progress}%</b></div><span><i style={{ width: `${Math.max(progress, 8)}%` }} /></span><button onClick={() => controller.current?.abort()}>Cancel upload</button></div>}
      <div className="form-footer"><span><Zap /> Direct encrypted upload. No browser credentials are stored.</span><button className="button primary large" disabled={!file || !!stage} onClick={submit}>{stage ? <LoaderCircle className="spin" /> : <Sparkles />}{stage || 'Start transcription'}</button></div></section>
      <aside className="tip-card"><div className="tip-visual"><div className="mini-wave">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ height: `${12 + ((i * 13) % 34)}px` }} />)}</div><Headphones /></div><span>FOR BEST RESULTS</span><h3>Clear audio creates clearer knowledge.</h3><ul><li><Check />Use a quiet recording</li><li><Check />Keep speakers close to the mic</li><li><Check />Avoid overlapping conversations</li></ul></aside>
    </div></div></Shell>
}
