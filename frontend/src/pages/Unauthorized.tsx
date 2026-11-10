import { CircleAlert } from 'lucide-react'
import Brand from '../components/Brand'

export default function Unauthorized() { return <div className="center-page"><Brand /><CircleAlert /><h1>Access denied</h1><p>Your account cannot access this workspace.</p><a className="button primary" href="/">Return home</a></div> }
