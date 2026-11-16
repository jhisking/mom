// 기록일 = 07:00 ~ 익일 06:59 (KST). 한국 시간 고정이라 UTC+9 오프셋으로 계산한다.
const KST = 9 * 3600_000
const DAY_START_HOUR = 7
const HOUR = 3600_000

const ymd = (ms: number) => new Date(ms).toISOString().slice(0, 10)

export const careDate = (d: Date) => ymd(d.getTime() + KST - DAY_START_HOUR * HOUR)

export const slotHour = (d: Date) => new Date(d.getTime() + KST).getUTCHours()

/** 기록일의 시작(07:00 KST)과 끝(익일 07:00 KST) */
export const careDayRange = (date: string): [Date, Date] => {
  const start = Date.parse(`${date}T00:00:00Z`) + DAY_START_HOUR * HOUR - KST
  return [new Date(start), new Date(start + 24 * HOUR)]
}

/** 기록일 + 시간 칸(0~23시) → 그 칸의 정각 시각. 00~06시는 다음 날 */
export const slotToDate = (date: string, hour: number) => {
  const [start] = careDayRange(date)
  return new Date(start.getTime() + ((hour - DAY_START_HOUR + 24) % 24) * HOUR)
}

/** 기록지 칸 순서: 7,8,…,23,0,…,6 */
export const SLOT_HOURS = Array.from({ length: 24 }, (_, i) => (i + DAY_START_HOUR) % 24)

export const shiftDate = (date: string, days: number) =>
  ymd(Date.parse(`${date}T00:00:00Z`) + days * 24 * HOUR)
