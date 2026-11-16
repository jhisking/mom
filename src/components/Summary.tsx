import type { BabyRecord } from '../lib/types'

export default function Summary({ records }: { records: BabyRecord[] }) {
  const sum = (k: string) => records.filter((r) => r.kind === k).reduce((a, r) => a + (r.amount ?? 0), 0)
  const cnt = (k: string) => records.filter((r) => r.kind === k).length
  const temps = records.filter((r) => r.kind === 'temp').map((r) => r.amount ?? 0)
  const feeds = cnt('feed_direct') + cnt('feed_breast_milk') + cnt('feed_formula')
  const items = [
    ['수유', `${feeds}회`],
    ['직수', `${sum('feed_direct')}분`],
    ['모유', `${sum('feed_breast_milk')}ml`],
    ['분유', `${sum('feed_formula')}ml`],
    ['소변', `${cnt('pee')}회`],
    ['대변', `${cnt('poop')}회`],
    ['구토', `${cnt('vomit')}회`],
    ['최고체온', temps.length ? `${Math.max(...temps)}℃` : '-'],
  ]
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map(([l, v]) => (
        <div key={l} className="rounded-lg bg-white p-2 text-center shadow-sm">
          <div className="text-xs text-slate-500">{l}</div><div className="font-bold">{v}</div>
        </div>
      ))}
    </div>
  )
}
