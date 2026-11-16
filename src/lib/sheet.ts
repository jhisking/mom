import { slotHour } from './careDay'
import type { BabyRecord, RecordKind } from './types'

/** 종이 기록지의 열 순서 */
export const COLS: { kind: RecordKind; label: string }[] = [
  { kind: 'feed_direct', label: '직수' },
  { kind: 'feed_breast_milk', label: '모유' },
  { kind: 'feed_formula', label: '분유' },
  { kind: 'pee', label: '소변' },
  { kind: 'poop', label: '대변' },
  { kind: 'temp', label: '체온' },
  { kind: 'vomit', label: '구토' },
  { kind: 'note', label: '비고' },
]
export const GROUPS = [
  { label: '먹는 양', span: 3 },
  { label: '배설', span: 2 },
  { label: '기타', span: 2 },
]

const r1 = (n: number) => Math.round(n * 10) / 10
const SUM: RecordKind[] = ['feed_direct', 'feed_breast_milk', 'feed_formula']

export const cellRecords = (records: BabyRecord[], hour: number, kind: RecordKind) =>
  records.filter((r) => r.kind === kind && slotHour(new Date(r.recorded_at)) === hour)

/** 칸에 보일 값: 양은 합, 배설/구토는 횟수, 체온은 마지막 값, 비고는 메모 */
export function cellText(kind: RecordKind, rs: BabyRecord[]): string {
  if (!rs.length) return ''
  if (SUM.includes(kind)) return String(r1(rs.reduce((a, r) => a + (r.amount ?? 0), 0)))
  if (kind === 'temp') return String(rs[rs.length - 1].amount ?? '')
  if (kind === 'note') return rs.map((r) => r.memo).filter(Boolean).join(' / ')
  return String(rs.length)
}

/** 합계 행: 양은 합, 배설/구토는 횟수, 체온은 최고값 */
export function colTotal(kind: RecordKind, records: BabyRecord[]): string {
  const rs = records.filter((r) => r.kind === kind)
  if (!rs.length || kind === 'note') return ''
  if (kind === 'temp') return String(Math.max(...rs.map((r) => r.amount ?? 0)))
  return cellText(kind, rs)
}
