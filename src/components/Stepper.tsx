export default function Stepper({ value, step, unit, onChange }: {
  value: number; step: number; unit: string; onChange: (v: number) => void
}) {
  const set = (v: number) => onChange(Math.max(0, Math.round(v * 100) / 100))
  const btn = 'h-14 w-14 rounded-full bg-slate-200 text-3xl font-bold active:bg-slate-300'
  return (
    <div className="flex items-center justify-center gap-5">
      <button type="button" className={btn} aria-label="감소" onClick={() => set(value - step)}>−</button>
      <div className="min-w-24 text-center text-3xl font-bold">{value}<span className="ml-1 text-base font-normal">{unit}</span></div>
      <button type="button" className={btn} aria-label="증가" onClick={() => set(value + step)}>+</button>
    </div>
  )
}
