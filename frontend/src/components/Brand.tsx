

export default function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="brand"><span className="brand-mark"><i /><i /><i /><i /></span>{!compact && <span><b>EchoScript</b><small>STUDIO</small></span>}</div>
}
