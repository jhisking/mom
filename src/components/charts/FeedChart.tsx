import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DayStat } from '../../lib/stats'

const label = (d: string) => d.slice(5).replace('-', '/')

export default function FeedChart({ days }: { days: DayStat[] }) {
  const data = days.map((d) => ({ ...d, label: label(d.date) }))
  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="label" fontSize={11} interval="preserveStartEnd" />
      <YAxis fontSize={11} width={36} />
      <Tooltip />
      <Legend />
    </>
  )
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-1 text-sm font-semibold">일별 수유량 (ml)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            {axes}
            <Bar dataKey="milk" name="모유" stackId="a" fill="#fb7185" />
            <Bar dataKey="formula" name="분유" stackId="a" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-semibold">일별 직수 (분)와 수유 횟수</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            {axes}
            <Bar dataKey="direct" name="직수(분)" fill="#ec4899" />
            <Bar dataKey="feeds" name="수유 횟수" fill="#94a3b8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
