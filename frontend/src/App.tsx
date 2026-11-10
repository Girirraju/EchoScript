import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Transcribe from './pages/Transcribe'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import VideoStudio from './pages/VideoStudio'
import Library from './pages/Library'
import SettingsPage from './pages/SettingsPage'
import Unauthorized from './pages/Unauthorized'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth/callback" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/studio/transcribe" element={<Transcribe />} />
      <Route path="/studio/video" element={<VideoStudio />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:jobId" element={<JobDetail />} />
      <Route path="/library" element={<Library />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
