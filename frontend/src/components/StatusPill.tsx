

export default function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase()
  const label: Record<string, string> = { transcribed: 'Completed', running: 'Processing', uploaded: 'Ready', created: 'Created', failed: 'Failed', none: 'Not requested', done: 'Ready', pending: 'Pending', rendering: 'Rendering' }
  return <span className={`status ${key}`}><span />{label[key] || status}</span>
}
