

export default function PageHead({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle: string; actions?: React.ReactNode }) {
  return <div className="page-head"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{subtitle}</p></div>{actions && <div className="head-actions">{actions}</div>}</div>
}
