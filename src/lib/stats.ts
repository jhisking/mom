import { careDate, shiftDate } from './careDay'
import type { BabyRecord } from './types'

export type Period = 'week' | 'month'

const FEEDS = ['feed_direct', 'feed_breast_milk', 'feed_formula']

/** 기준일이 속한 주(월~일) 또는 월의 기록일 목록 */
export const periodDates = (period: Period, anchor: string): string[] => {
  if (period === 'week') {
    const dow = new Date(`${anchor}T00:00:00Z`).getUTCDay() // 0=일
    const monday = shiftDate(anchor, -((dow + 6) % 7))
    return Array.from({ length: 7 }, (_, i) => shiftDate(monday, i))
  }
  const first = `${anchor.slice(0, 7)}-01`
  const out: string[] = []
  for (let d = first; d.slice(0, 7) === first.slice(0, 7); d = shiftDate(d, 1)) out.push(d)
  return out
}

export const shiftPeriod = (period: Period, anchor: string, dir: 1 | -1) =>
  period === 'week'
    ? shiftDate(anchor, 7 * dir)
    : shiftDate(`${anchor.slice(0, 7)}-01`, dir === 1 ? 32 : -1).slice(0, 7) + '-01'

export interface DayStat {
  date: string
  direct: number
  milk: number
  formula: number
  feeds: number
  pee: number
  poop: number
  vomit: number
  maxTemp: number | null
}

export function dailyStats(records: BabyRecord[], dates: string[]): DayStat[] {
  const days = new Map<string, DayStat>(dates.map((date) => [date, {
    date, direct: 0, milk: 0, formula: 0, feeds: 0, pee: 0, poop: 0, vomit: 0, maxTemp: null,
  }]))
  for (const r of records) {
    const d = days.get(careDate(new Date(r.recorded_at)))
    if (!d) continue
    const a = r.amount ?? 0
    if (r.kind === 'feed_direct') d.direct += a
    else if (r.kind === 'feed_breast_milk') d.milk += a
    else if (r.kind === 'feed_formula') d.formula += a
    else if (r.kind === 'temp') d.maxTemp = Math.max(d.maxTemp ?? 0, a)
    else if (r.kind === 'pee' || r.kind === 'poop' || r.kind === 'vomit') d[r.kind] += 1
    if (FEEDS.includes(r.kind)) d.feeds += 1
  }
  return dates.map((x) => days.get(x)!)
}

export function summarize(days: DayStat[], records: BabyRecord[]) {
  // shortcut: 기록이 하나라도 있는 날만 평균에 포함(오늘 등 미완성 날 포함), 필요시 완료된 날만으로 변경
  const active = days.filter((d) => d.feeds + d.pee + d.poop + d.vomit > 0)
  const avg = (f: (d: DayStat) => number) => (active.length ? active.reduce((a, d) => a + f(d), 0) / active.length : 0)
  const feedTimes = records.filter((r) => FEEDS.includes(r.kind)).map((r) => Date.parse(r.recorded_at)).sort((a, b) => a - b)
  const gaps = feedTimes.slice(1).map((t, i) => (t - feedTimes[i]) / 60000)
  return {
    activeDays: active.length,
    avgFeeds: avg((d) => d.feeds),
    avgMl: avg((d) => d.milk + d.formula),
    avgDirectMin: avg((d) => d.direct),
    avgPee: avg((d) => d.pee),
    avgPoop: avg((d) => d.poop),
    vomitTotal: days.reduce((a, d) => a + d.vomit, 0),
    avgIntervalMin: gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null,
  }
}
