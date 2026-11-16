import { useState } from 'react'
import Stepper from './Stepper'
import { addRecord, deleteRecord, updateRecord } from '../api/records'
import { KINDS, KIND_ORDER, type BabyRecord, type RecordKind } from '../lib/types'

// datetime-local은 브라우저 로컬(한국) 시각 문자열을 쓴다
const toLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

interface Props {
  babyId: string
  kind?: RecordKind
  time: Date
  initial?: BabyRecord
  lock?: boolean // 기록지 칸에서 열면 종류를 바꾸지 못하게 한다
  onClose: () => void
  onSaved: () => void
}

export default function RecordSheet({ babyId, kind: k0, time, initial, lock, onClose, onSaved }: Props) {
  const [kind, setKind] = useState<RecordKind>(initial?.kind ?? k0 ?? 'feed_direct')
  const [amount, setAmount] = useState<number>(initial?.amount ?? KINDS[k0 ?? 'feed_direct'].def ?? 0)
  const [at, setAt] = useState(toLocal(initial ? new Date(initial.recorded_at) : time))
  const [memo, setMemo] = useState(initial?.memo ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const meta = KINDS[kind]

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    try { await fn(); onSaved(); onClose() } catch (e) { setErr((e as Error).message); setBusy(false) }
  }
  const save = () => run(() => {
    const row = {
      recorded_at: new Date(at).toISOString(), kind,
      amount: meta.unit ? amount : null, memo: memo.trim() || null,
    }
    return initial ? updateRecord(initial.id, row) : addRecord({ baby_id: babyId, ...row })
  })
  const remove = () => confirm('이 기록을 삭제할까요?') && run(() => deleteRecord(initial!.id))
  const pick = (x: RecordKind) => { setKind(x); setAmount(KINDS[x].def ?? 0) }

  return (
    <div className="fixed inset-0 z-20 flex items-end bg-black/40 sm:items-center sm:justify-center" onClick={onClose}>
      <div className="max-h-[90vh] w-full overflow-auto rounded-t-2xl bg-white p-4 sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}>
        {lock ? (
          <h2 className="mb-3 text-lg font-bold">{meta.icon} {meta.label}</h2>
        ) : (
          <div className="mb-3 flex flex-wrap gap-2">
            {KIND_ORDER.map((x) => (
              <button key={x} onClick={() => pick(x)}
                className={`h-11 rounded-full px-3 text-sm font-semibold ${x === kind ? 'ring-2 ring-slate-900 ' : 'opacity-60 '}${KINDS[x].color}`}>
                {KINDS[x].icon} {KINDS[x].label}
              </button>
            ))}
          </div>
        )}
        {meta.unit && <div className="my-5"><Stepper value={amount} step={meta.step!} unit={meta.unit} onChange={setAmount} /></div>}
        <label className="mt-3 block text-sm text-slate-600">시각
          <input type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)}
            className="mt-1 h-12 w-full rounded-lg border px-3 text-base" />
        </label>
        <label className="mt-3 block text-sm text-slate-600">{kind === 'note' ? '내용' : '비고'}
          <input value={memo} onChange={(e) => setMemo(e.target.value)} autoFocus={kind === 'note'}
            placeholder={kind === 'note' ? '예: 보챔, 트림 오래 함' : '메모 (선택)'}
            className="mt-1 h-12 w-full rounded-lg border px-3 text-base" />
        </label>
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
        <div className="mt-4 flex gap-2">
          {initial && <button disabled={busy} onClick={remove} className="h-12 rounded-lg bg-red-100 px-4 font-semibold text-red-700">삭제</button>}
          <button disabled={busy} onClick={onClose} className="h-12 flex-1 rounded-lg bg-slate-200 font-semibold">취소</button>
          <button disabled={busy || !at || (kind === 'note' && !memo.trim())} onClick={save} className="h-12 flex-[2] rounded-lg bg-pink-500 font-semibold text-white">저장</button>
        </div>
      </div>
    </div>
  )
}
