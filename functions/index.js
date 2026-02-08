const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const db = admin.firestore();

// CORS 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 클라이언트 IP 추출
function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

// 상담 신청 API (POST)
exports.consultation = functions.https.onRequest(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.set(corsHeaders);
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.set(corsHeaders);
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  const { name, phone, age, sex, address, remarks, device } = req.body || {};
  const clientIP = getClientIP(req);

  if (!name || !phone) {
    res.set(corsHeaders);
    res.status(400).json({
      success: false,
      message: '이름과 연락처는 필수 입력 항목입니다.',
    });
    return;
  }

  const phoneClean = String(phone).replace(/\D/g, ''); // 숫자만 (중복 체크용)
  const docData = {
    name: String(name).trim(),
    phone: String(phone).trim(), // 원본 형식 유지
    age: age || null,
    sex: sex || null,
    address: address || null,
    remarks: remarks || null,
    device: device || 'PC',
    ip: clientIP,
    regdt: admin.firestore.FieldValue.serverTimestamp(),
    ifflag: 'N',
    ifdt: null,
    iflog: null,
  };

  try {
    // phone 숫자만을 document ID로 사용 (중복 방지)
    const docId = phoneClean;
    const docRef = db.collection('info').doc(docId);

    const existDoc = await docRef.get();
    if (existDoc.exists) {
      res.set(corsHeaders);
      res.status(400).json({
        success: false,
        message: '이미 등록된 연락처입니다.',
      });
      return;
    }

    await docRef.set(docData);

    res.set(corsHeaders);
    res.json({
      success: true,
      message: '상담 신청이 완료되었습니다.',
    });
  } catch (error) {
    console.error('상담 신청 저장 오류:', error);
    res.set(corsHeaders);
    res.status(500).json({
      success: false,
      message: '저장 중 오류가 발생했습니다: ' + error.message,
    });
  }
});

// 상담 목록 조회 API (GET)
exports.consultations = functions.https.onRequest(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.set(corsHeaders);
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.set(corsHeaders);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const snapshot = await db.collection('info')
      .orderBy('regdt', 'desc')
      .get();

    const results = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        regdt: data.regdt?.toDate?.()?.toISOString?.() || data.regdt,
        ifdt: data.ifdt?.toDate?.()?.toISOString?.() || data.ifdt,
      };
    });

    res.set(corsHeaders);
    res.json(results);
  } catch (error) {
    console.error('상담 목록 조회 오류:', error);
    res.set(corsHeaders);
    res.status(500).json({ error: '조회 중 오류가 발생했습니다.' });
  }
});

// 외부 API 전송 함수
async function sendDataToExternalAPI(data) {
  const API_URL = 'http://jn-plan.co.kr/landing_api.php';
  const LANDING_ID = 'hogwanwon_001';

  try {
    const params = new URLSearchParams();
    params.append('landing_id', LANDING_ID);
    params.append('wr_20', '호관원 테스트');
    params.append('wr_1', data.name || '');
    params.append('wr_2', data.address || '');
    params.append('wr_5', data.phone || '');
    params.append('wr_7', data.remarks || '');
    params.append('wr_ip', data.ip || '');

    const response = await axios.post(API_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000,
    });

    let resultCode = response.data;
    if (typeof resultCode === 'string') {
      try {
        const parsed = JSON.parse(resultCode);
        resultCode = parsed.result ?? parsed;
      } catch (_) {}
    } else {
      resultCode = resultCode?.result ?? resultCode;
    }

    return {
      success: resultCode === '0000' || resultCode === 0000,
      resultCode: String(resultCode || '1100'),
    };
  } catch (error) {
    console.error('외부 API 전송 오류:', error.message);
    return { success: false, resultCode: '1100' };
  }
}

// 5분마다 대기 중인 상담 신청을 외부 API로 전송
exports.processPendingConsultations = functions
  .runWith({ timeoutSeconds: 540, memory: '256MB' })
  .pubsub.schedule('*/5 * * * *') // 5분마다
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const snapshot = await db.collection('info')
      .where('ifflag', '==', 'N')
      .orderBy('regdt', 'asc')
      .get();

    if (snapshot.empty) {
      console.log('전송할 데이터가 없습니다.');
      return null;
    }

    console.log(`전송할 데이터 ${snapshot.size}건 발견`);

    for (let i = 0; i < snapshot.docs.length; i++) {
      const doc = snapshot.docs[i];
      const data = doc.data();
      const phone = doc.id;

      try {
        const sendResult = await sendDataToExternalAPI(data);

        if (sendResult.success) {
          await doc.ref.update({
            ifflag: 'Y',
            ifdt: admin.firestore.FieldValue.serverTimestamp(),
            iflog: sendResult.resultCode,
          });
          console.log(`✓ 전송 성공: ${data.name} (${phone})`);
        } else {
          await doc.ref.update({ iflog: sendResult.resultCode });
          console.log(`✗ 전송 실패: ${data.name} (${phone}) - ${sendResult.resultCode}`);
        }

        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        console.error(`전송 오류 (${data.name}):`, err.message);
      }
    }

    return null;
  });
