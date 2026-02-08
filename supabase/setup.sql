-- ============================================
-- 1. info 테이블 생성 (Supabase SQL Editor에서 실행)
-- ============================================

CREATE TABLE IF NOT EXISTS info (
  phone VARCHAR(50) PRIMARY KEY,
  name VARCHAR(250) NOT NULL,
  age VARCHAR(10),
  sex VARCHAR(20),
  address TEXT,
  remarks TEXT,
  device VARCHAR(45),
  ip VARCHAR(50) NOT NULL DEFAULT 'client',
  regdt TIMESTAMPTZ DEFAULT NOW(),
  ifdt TIMESTAMPTZ,
  ifflag VARCHAR(1) DEFAULT 'N',
  iflog TEXT
);

COMMENT ON TABLE info IS '상담 신청 정보';

-- ============================================
-- 2. RLS (Row Level Security) 설정
-- ============================================

ALTER TABLE info ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (재실행 시)
DROP POLICY IF EXISTS "Allow insert for consultation" ON info;
DROP POLICY IF EXISTS "Block read from client" ON info;
DROP POLICY IF EXISTS "Block update from client" ON info;
DROP POLICY IF EXISTS "Block delete from client" ON info;

-- 상담 신청: 익명 사용자 INSERT만 허용
CREATE POLICY "Allow insert for consultation" ON info
  FOR INSERT WITH CHECK (true);

-- 읽기/수정/삭제: 클라이언트 차단 (Edge Function에서 service_role로 처리)
CREATE POLICY "Block read from client" ON info
  FOR SELECT USING (false);

CREATE POLICY "Block update from client" ON info
  FOR UPDATE USING (false);

CREATE POLICY "Block delete from client" ON info
  FOR DELETE USING (false);
