# Supabase 설정 가이드

## 1단계: Supabase 프로젝트 생성

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. **New project** 클릭 후 생성
3. **Project Settings** > **API**에서 **Project URL**과 **anon public** 키 복사

## 2단계: 테이블 및 RLS 생성

1. **SQL Editor** 클릭 → **New query**
2. `setup.sql` 파일 내용 전체 복사 후 실행

## 3단계: Edge Function 배포 (외부 API 전송)

### Supabase CLI 설치

```bash
npm install -g supabase
```

### 로그인 및 연결

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### 함수 배포

```bash
supabase functions deploy process-pending
```

## 4단계: pg_cron 스케줄러 설정

1. `pg_cron_setup.sql` 파일 열기
2. `YOUR_PROJECT_REF`를 실제 프로젝트 ref로 교체 (예: `abcdefgh`)
3. `YOUR_ANON_KEY`를 anon 키로 교체
4. **SQL Editor**에서 실행

## 5단계: React 앱 환경 변수

프로젝트 루트에 `.env` 또는 `.env.production` 파일 생성:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## 6단계: 배포

```bash
npm run deploy
```

Firebase Hosting에 배포되며, 상담 신청은 Supabase에 저장됩니다.
