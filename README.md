# 수유 기록지

모바일/태블릿 반응형 수유·배설·체온 기록 웹앱. 설계는 [PRD.md](PRD.md) 참고.

## 실행
```bash
npm install
cp .env.example .env   # Supabase URL / anon key 입력
npm run dev
npm test               # 기록일(07시 기준) 계산 테스트
npm run build
```

## Supabase 설정 (최초 1회)
1. Supabase 프로젝트 생성 → SQL Editor에서 `supabase/migrations/0001_init.sql`, 이어서 `0002_note_weight.sql` 실행 (파일마다 한 번씩)
2. Authentication → 이메일(매직링크) 사용, Site URL / Redirect URL에 배포 주소와 `http://localhost:5173` 추가
3. 가족 이메일로 각자 한 번씩 로그인(사용자 생성) 후, SQL Editor에서 **아이 등록**:

```sql
with b as (insert into babies (name, birth_date) values ('아이이름', '2026-01-01') returning id)
insert into family_members (user_id, baby_id)
select u.id, b.id from auth.users u, b where u.email in ('mom@example.com', 'dad@example.com');
```

## 배포
GitHub Pages + GitHub Actions(`.github/workflows/deploy.yml`). main에 push하면 테스트 → 빌드 → 배포가 자동으로 돈다.
1. 저장소 Settings → Pages → Source를 **GitHub Actions**로 설정
2. 환경변수는 공개용 값이라 `.env.production`에 커밋되어 있다 (Variables 등록 불필요). service_role 키는 절대 넣지 말 것
3. 주소: `https://<아이디>.github.io/<저장소>/` (해시 라우터라 새로고침해도 404가 나지 않는다)
