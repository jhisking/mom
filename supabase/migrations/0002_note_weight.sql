-- 종이 기록지의 비고 칸(시간별 메모)과 일별 체중을 기록 종류로 추가
alter type record_kind add value if not exists 'note';
alter type record_kind add value if not exists 'weight';
