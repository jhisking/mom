import { supabase } from '../lib/supabase'
import { careDayRange } from '../lib/careDay'
import type { BabyRecord, RecordKind } from '../lib/types'

const must = <T>(r: { data: T; error: { message: string } | null }) => {
  if (r.error) throw new Error(r.error.message)
  return r.data
}

export const getBaby = async () =>
  must(await supabase.from('babies').select('id,name,birth_date').limit(1).maybeSingle())

export const listDay = async (babyId: string, date: string) => {
  const [s, e] = careDayRange(date)
  return must(
    await supabase.from('records').select('*').eq('baby_id', babyId)
      .gte('recorded_at', s.toISOString()).lt('recorded_at', e.toISOString())
      .order('recorded_at'),
  ) as BabyRecord[]
}

/** 기록일 from ~ to(포함) 범위 */
export const listRange = async (babyId: string, from: string, to: string) =>
  must(
    await supabase.from('records').select('*').eq('baby_id', babyId)
      .gte('recorded_at', careDayRange(from)[0].toISOString())
      .lt('recorded_at', careDayRange(to)[1].toISOString())
      .order('recorded_at'),
  ) as BabyRecord[]

export interface RecordInput {
  baby_id: string
  recorded_at: string
  kind: RecordKind
  amount: number | null
  memo: string | null
}

export const addRecord = async (r: RecordInput) =>
  must(await supabase.from('records').insert(r).select().single()) as BabyRecord

export const updateRecord = async (id: string, r: Partial<RecordInput>) =>
  must(await supabase.from('records').update(r).eq('id', id).select().single()) as BabyRecord

export const deleteRecord = async (id: string) =>
  must(await supabase.from('records').delete().eq('id', id).select())
