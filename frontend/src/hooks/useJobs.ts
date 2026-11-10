import { useQuery } from '@tanstack/react-query'
import { api } from '../api'

export function useJobs() {
  return useQuery({ queryKey: ['jobs'], queryFn: api.jobs, refetchInterval: query => query.state.data?.some(item => item.status === 'RUNNING' || ['PENDING', 'RENDERING'].includes(item.video_status)) ? 3000 : false })
}
