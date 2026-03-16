-- ============================================
-- pg_cron 스케줄러 설정
-- Edge Function 배포 후 실행
-- Supabase Dashboard > SQL Editor에서 실행
-- ============================================
-- 교체 필수: YOUR_PROJECT_REF, YOUR_ANON_KEY
--
-- 스케줄 변경 시: 먼저 SELECT cron.unschedule('process-pending-consultations'); 실행 후
-- 이 스크립트를 다시 실행하세요.

-- pg_cron, pg_net 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;


-- 2분마다 process-pending Edge Function 호출
SELECT cron.schedule(
  'process-pending-consultations',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://qijlxobfucgnzewwrohy.supabase.co/functions/v1/process-pending',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpamx4b2JmdWNnbnpld3dyb2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzYwODgsImV4cCI6MjA4NjExMjA4OH0.QGEAGkPjt029id2836mlat20PweDj5V1dbzXDugFs_U'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  ) AS request_id;
  $$
);

-- 등록 확인: SELECT * FROM cron.job;
