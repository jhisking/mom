export type RecordKind =
  | 'feed_direct' | 'feed_breast_milk' | 'feed_formula'
  | 'pee' | 'poop' | 'temp' | 'vomit' | 'note' | 'weight'

export interface BabyRecord {
  id: string
  baby_id: string
  recorded_at: string
  kind: RecordKind
  amount: number | null
  memo: string | null
}

interface KindMeta {
  label: string
  icon: string
  unit?: string // 있으면 양 입력(스텝 버튼)
  def?: number
  step?: number
  color: string
}

export const KINDS: Record<RecordKind, KindMeta> = {
  feed_direct: { label: '직수', icon: '🤱', unit: '분', def: 10, step: 5, color: 'bg-pink-100 text-pink-900' },
  feed_breast_milk: { label: '모유', icon: '🍼', unit: 'ml', def: 60, step: 10, color: 'bg-rose-100 text-rose-900' },
  feed_formula: { label: '분유', icon: '🥛', unit: 'ml', def: 60, step: 10, color: 'bg-amber-100 text-amber-900' },
  pee: { label: '소변', icon: '💧', color: 'bg-sky-100 text-sky-900' },
  poop: { label: '대변', icon: '💩', color: 'bg-yellow-100 text-yellow-900' },
  temp: { label: '체온', icon: '🌡️', unit: '℃', def: 36.5, step: 0.1, color: 'bg-red-100 text-red-900' },
  vomit: { label: '구토', icon: '🤮', color: 'bg-green-100 text-green-900' },
  note: { label: '비고', icon: '📝', color: 'bg-slate-100 text-slate-900' },
  weight: { label: '체중', icon: '⚖️', unit: 'kg', def: 3.5, step: 0.05, color: 'bg-violet-100 text-violet-900' },
}

/** 홈 빠른 입력 버튼·시트 종류 선택에 쓰는 항목 (비고/체중은 기록지에서만) */
export const KIND_ORDER: RecordKind[] = ['feed_direct', 'feed_breast_milk', 'feed_formula', 'pee', 'poop', 'temp', 'vomit']

export const fmt = (r: Pick<BabyRecord, 'kind' | 'amount'>) => {
  const u = KINDS[r.kind].unit
  return `${KINDS[r.kind].icon} ${KINDS[r.kind].label}${u && r.amount != null ? ` ${r.amount}${u}` : ''}`
}
