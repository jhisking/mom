import { useState } from 'react'
import { supabase } from '../lib/supabase'

// 계정은 Supabase 대시보드(Authentication → Users)에서 가족 수만큼 직접 만든다. 회원가입 화면은 없다.
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [show, setShow] = useState(false)

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setMsg(`로그인 실패: ${error.message}`) // 원인 구분용 (Invalid login credentials / Email not confirmed 등)
  }
  const input = 'h-12 rounded-lg border px-3 text-base'
  // 폰 키보드가 첫 글자를 대문자로 바꾸거나 자동 교정하지 않게 한다
  const keys = { autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false } as const
  return (
    <form onSubmit={login} className="mx-auto mt-24 flex max-w-sm flex-col gap-3 px-4">
      <h1 className="text-2xl font-bold">🍼 수유 기록지</h1>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        autoComplete="username" placeholder="이메일" className={input} {...keys} />
      <input type={show ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password" placeholder="비밀번호" className={input} {...keys} />
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> 비밀번호 보기
      </label>
      <button className="h-12 rounded-lg bg-pink-500 font-semibold text-white">로그인</button>
      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </form>
  )
}
