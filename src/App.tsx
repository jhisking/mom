import { Suspense, lazy, useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { configured, supabase } from './lib/supabase'
import { getBaby } from './api/records'
import Login from './pages/Login'
import Home from './pages/Home'
import DaySheet from './pages/DaySheet'
const Stats = lazy(() => import('./pages/Stats')) // recharts가 커서 통계 탭에서만 로드

const Msg = ({ children }: { children: React.ReactNode }) => (
  <p className="mx-auto mt-24 max-w-sm px-4 text-center text-slate-600">{children}</p>
)

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [baby, setBaby] = useState<{ id: string; name: string; birth_date: string | null } | null | undefined>(undefined)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) getBaby().then(setBaby, (e) => setError(e.message))
  }, [session])

  if (!configured) return <Msg>.env에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를 설정해주세요.</Msg>
  if (session === undefined) return <Msg>불러오는 중…</Msg>
  if (!session) return <Login />
  if (error) return <Msg>{error}</Msg>
  if (baby === undefined) return <Msg>불러오는 중…</Msg>
  if (!baby) return <Msg>등록된 아이가 없습니다. README의 "아이 등록" SQL을 실행해주세요.</Msg>

  const tab = ({ isActive }: { isActive: boolean }) =>
    `flex h-14 flex-1 items-center justify-center font-semibold ${isActive ? 'text-pink-600' : 'text-slate-500'}`
  return (
    <div className="mx-auto max-w-3xl px-3 pb-20 pt-3">
      <Suspense fallback={<Msg>불러오는 중…</Msg>}>
        <Routes>
          <Route path="/" element={<Home babyId={baby.id} name={baby.name} />} />
          <Route path="/day/:date?" element={<DaySheet babyId={baby.id} birthDate={baby.birth_date} />} />
          <Route path="/stats" element={<Stats babyId={baby.id} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t bg-white">
        <NavLink to="/" end className={tab}>홈</NavLink>
        <NavLink to="/day" className={tab}>기록지</NavLink>
        <NavLink to="/stats" className={tab}>통계</NavLink>
      </nav>
    </div>
  )
}
