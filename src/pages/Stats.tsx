import { useEffect, useMemo, useState } from 'react'
import { listRange } from '../api/records'
import { careDate } from '../lib/careDay'
import { dailyStats, periodDates, shiftPeriod, summarize, type Period } from '../lib/stats'
import type { BabyRecord } from '../lib/types'
import FeedChart from '../components/charts/FeedChart'
import DiaperChart from '../components/charts/DiaperChart'
import TempChart from '../components/charts/TempChart'

const n1 = (v: number) => (Math.round(v * 10) / 10).toString()
const interval = (m: number | null) => (m == null ? '-' : `${Math.floor(m / 60)}시간 ${Math.round(m % 60)}분`)

export default function Stats({ babyId }: { babyId: string }) {
  const [period, setPeriod] = useState<Period>('week')
  const [anchor, setAnchor] = useState(() => careDate(new Date()))
  const [records, setRecords] = useState<BabyRecord[]>([])
  const [error, setError] = useState('')
  const dates = useMemo(() => periodDates(period, anchor), [period, anchor])
  const first = dates[0], last = dates[dates.length - 1]

  useEffect(() => {
    let stale = false
    listRange(babyId, first, last).then(
      (r) => { if (!stale) { setRecords(r); setError('') } },
      (e) => !stale && setError(e.message),
    )
    return () => { stale = true }
  }, [babyId, first, last])

  const days = useMemo(() => dailyStats(records, dates), [records, dates])
  const s = useMemo(() => summarize(days, records), [days, records])
  const title = period === 'week' ? `${first} ~ ${last}` : anchor.slice(0, 7)

  const cards: [string, string][] = [
    ['일평균 수유 횟수', `${n1(s.avgFeeds)}회`],
    ['일평균 수유량', `${Math.round(s.avgMl)}ml`],
    ['일평균 직수', `${Math.round(s.avgDirectMin)}분`],
    ['평균 수유 간격', interval(s.avgIntervalMin)],
    ['일평균 소변', `${n1(s.avgPee)}회`],
    ['일평균 대변', `${n1(s.avgPoop)}회`],
    ['구토 합계', `${s.vomitTotal}회`],
    ['기록한 날', `${s.activeDays}일`],
  ]
  const seg = (p: Period, l: string) => (
    <button onClick={() => setPeriod(p)}
      className={`h-11 flex-1 rounded-lg font-semibold ${period === p ? 'bg-pink-500 text-white' : 'bg-white'}`}>{l}</button>
  )
  const nav = 'h-12 w-12 rounded-full bg-white text-xl shadow-sm'

  return (
    <div className="space-y-4">
      <div className="flex gap-2">{seg('week', '주별')}{seg('month', '월별')}</div>
      <div className="flex items-center justify-between">
        <button className={nav} aria-label="이전" onClick={() => setAnchor(shiftPeriod(period, anchor, -1))}>‹</button>
        <div className="font-bold">{title}</div>
        <button className={nav} aria-label="다음" onClick={() => setAnchor(shiftPeriod(period, anchor, 1))}>›</button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cards.map(([l, v]) => (
          <div key={l} className="rounded-lg bg-white p-3 text-center shadow-sm">
            <div className="text-xs text-slate-500">{l}</div><div className="text-lg font-bold">{v}</div>
          </div>
        ))}
      </div>
      <div className="space-y-6 rounded-xl bg-white p-3 shadow-sm">
        <FeedChart days={days} />
        <DiaperChart days={days} />
        <TempChart days={days} />
      </div>
    </div>
  )
}
