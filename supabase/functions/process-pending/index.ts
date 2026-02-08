// Supabase Edge Function: 대기 중인 상담 신청을 외부 API로 전송
// 5분마다 pg_cron에서 호출

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const API_URL = "http://jn-plan.co.kr/landing_api.php";
const LANDING_ID = "hogwanwon_001";

interface InfoRow {
  phone: string;
  name: string;
  address?: string;
  remarks?: string;
  ip?: string;
}

async function sendToExternalAPI(data: InfoRow): Promise<{ success: boolean; resultCode: string }> {
  try {
    const params = new URLSearchParams();
    params.append("landing_id", LANDING_ID);
    params.append("wr_20", "호관원 테스트");
    params.append("wr_1", data.name || "");
    params.append("wr_2", data.address || "");
    params.append("wr_5", data.phone || "");
    params.append("wr_7", data.remarks || "");
    params.append("wr_ip", data.ip || "");

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const text = await res.text();
    let resultCode: string = "1100";
    try {
      const parsed = JSON.parse(text);
      resultCode = String(parsed.result ?? parsed ?? "1100");
    } catch {
      resultCode = text || "1100";
    }

    return {
      success: resultCode === "0000" || resultCode === "0",
      resultCode,
    };
  } catch (err) {
    console.error("외부 API 오류:", err);
    return { success: false, resultCode: "1100" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: rows, error } = await supabase
    .from("info")
    .select("phone, name, address, remarks, ip")
    .or("ifflag.eq.N,ifflag.is.null")
    .order("regdt", { ascending: true });

  if (error) {
    console.error("조회 오류:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!rows || rows.length === 0) {
    return new Response(JSON.stringify({ message: "전송할 데이터 없음", processed: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  let processed = 0;
  for (const row of rows) {
    const result = await sendToExternalAPI(row);

    if (result.success) {
      await supabase
        .from("info")
        .update({
          ifflag: "Y",
          ifdt: new Date().toISOString(),
          iflog: result.resultCode,
        })
        .eq("phone", row.phone);
    } else {
      await supabase.from("info").update({ iflog: result.resultCode }).eq("phone", row.phone);
    }
    processed++;
    await new Promise((r) => setTimeout(r, 1000)); // 1초 대기
  }

  return new Response(
    JSON.stringify({ message: "처리 완료", processed }),
    { headers: { "Content-Type": "application/json" } }
  );
});
