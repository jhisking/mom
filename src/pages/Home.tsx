import { useState } from 'react'
import { useDay } from '../api/useDay'
import { addRecord, deleteRecord } from '../api/records'
import { careDate } from '../lib/careDay'
import { KINDS, fmt, type RecordKind } from '../lib/types'
import QuickButtons from '../components/QuickButtons'
import RecordSheet from '../components/RecordSheet'
import Summary from '../components/Summary'

export default function Home({ babyId, name }: { babyId: string; name: string }) {
  const today = careDate(new Date())
  const { records, error, reload } = useDay(babyId, today)
  const [sheet, setSheet] = useState<RecordKind | null>(null)
  const [undo, setUndo] = useState<{ id: string; label: string } | null>(null)
  const [msg, setMsg] = useState('')

  // 양이 없는 항목(소변/대변/구토)은 탭 한 번으로 저장, 5초간 취소 가능
  const pick = async (k: RecordKind) => {
    if (KINDS[k].unit) return setSheet(k)
    try {
      const r = await addRecord({ baby_id: babyId, recorded_at: new Date().toISOString(), kind: k, amount: null, memo: null })
      setUndo({ id: r.id, label: fmt(r) })
      setTimeout(() => setUndo((u) => (u?.id === r.id ? null : u)), 5000)
      reload()
    } catch (e) { setMsg((e as Error).message) }
  }
  const cancel = async () => {
    if (!undo) return
    try { await deleteRecord(undo.id) } catch (e) { setMsg((e as Error).message) }
    setUndo(null); reload()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{name} · 오늘</h1>
      <QuickButtons onPick={pick} />
      <Summary records={records} />
      {(error || msg) && <p className="text-sm text-red-600">{error || msg}</p>}
      <ul className="space-y-1.5">
        {[...records].reverse().slice(0, 5).map((r) => (
          <li key={r.id} className="flex justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
            <span>{fmt(r)}{r.memo ? ` · ${r.memo}` : ''}</span>
            <span className="text-slate-500">{new Date(r.recorded_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
          </li>
        ))}
      </ul>
      {undo && (
        <div className="fixed inset-x-3 bottom-20 z-10 mx-auto flex max-w-md items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
          <span>{undo.label} 저장됨</span>
          <button onClick={cancel} className="h-10 px-3 font-bold text-pink-300">취소</button>
        </div>
      )}
      {sheet && <RecordSheet babyId={babyId} kind={sheet} time={new Date()} onClose={() => setSheet(null)} onSaved={reload} />}
    </div>
  )
}
