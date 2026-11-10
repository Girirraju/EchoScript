import { FileAudio } from 'lucide-react'

export default function Empty({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return <div className="empty"><div className="empty-icon"><FileAudio /></div><h3>{title}</h3><p>{body}</p>{action}</div>
}
