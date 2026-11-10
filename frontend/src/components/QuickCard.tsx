import { ChevronRight } from 'lucide-react'

export default function QuickCard({ tone, icon: Icon, title, body, action, onClick }: { tone: string; icon: React.ComponentType; title: string; body: string; action: string; onClick: () => void }) {
  return <button className={`quick-card ${tone}`} onClick={onClick}><span className="quick-art"><Icon /></span><div><span className="quick-icon"><Icon /></span><h3>{title}</h3><p>{body}</p><b>{action}<ChevronRight /></b></div></button>
}
