import { KINDS, KIND_ORDER, type RecordKind } from '../lib/types'

export default function QuickButtons({ onPick }: { onPick: (k: RecordKind) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {KIND_ORDER.map((k) => (
        <button key={k} onClick={() => onPick(k)}
          className={`flex h-24 flex-col items-center justify-center rounded-2xl text-lg font-bold shadow-sm active:scale-95 ${KINDS[k].color}`}>
          <span className="text-3xl">{KINDS[k].icon}</span>{KINDS[k].label}
        </button>
      ))}
    </div>
  )
}
