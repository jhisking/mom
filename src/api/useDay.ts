import { useCallback, useEffect, useState } from 'react'
import { listDay } from './records'
import type { BabyRecord } from '../lib/types'

export function useDay(babyId: string, date: string) {
  const [records, setRecords] = useState<BabyRecord[]>([])
  const [error, setError] = useState('')
  const reload = useCallback(
    () => listDay(babyId, date).then((r) => { setRecords(r); setError('') }, (e) => setError(e.message)),
    [babyId, date],
  )
  useEffect(() => {
    reload()
    const onVis = () => document.visibilityState === 'visible' && reload() // 다른 기기 입력 반영
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [reload])
  return { records, error, reload }
}
