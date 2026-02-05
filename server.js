const express = require('express')
const session = require('express-session')
const path = require('path');
const cors = require('cors');
const app = express()
const port = 3001

const db = require('./src/db');
const sessionOption = require('./src/sessionOptions');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cron = require('node-cron');
const axios = require('axios');

// CORS 설정 (같은 망 내 모든 origin 허용)
app.use(cors({
    origin: true, // 요청 origin 그대로 허용
    credentials: true
}));

app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// IP 주소를 가져오기 위한 설정 (프록시 환경 고려)
app.set('trust proxy', true);

var MySQLStore = require('express-mysql-session')(session);
var sessionStore = new MySQLStore(sessionOption);
app.use(session({  
	key: 'session_cookie_name',
    secret: '~',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}))

app.get('/', (req, res) => {    
    req.sendFile(path.join(__dirname, '/build/index.html'));
})

app.get('/authcheck', (req, res) => {      
    const sendData = { isLogin: "" };
    if (req.session.is_logined) {
        sendData.isLogin = "True"
    } else {
        sendData.isLogin = "False"
    }
    res.send(sendData);
})

app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

app.post("/login", (req, res) => { // 데이터 받아서 결과 전송
    const username = req.body.userId;
    const password = req.body.userPassword;
    const sendData = { isLogin: "" };

    if (username && password) {             // id와 pw가 입력되었는지 확인
        db.query('SELECT * FROM userTable WHERE username = ?', [username], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {       // db에서의 반환값이 있다 = 일치하는 아이디가 있다.      

                bcrypt.compare(password , results[0].password, (err, result) => {    // 입력된 비밀번호가 해시된 저장값과 같은 값인지 비교

                    if (result === true) {                  // 비밀번호가 일치하면
                        req.session.is_logined = true;      // 세션 정보 갱신
                        req.session.nickname = username;
                        req.session.save(function () {
                            sendData.isLogin = "True"
                            res.send(sendData);
                        });
                        db.query(`INSERT INTO logTable (created, username, action, command, actiondetail) VALUES (NOW(), ?, 'login' , ?, ?)`
                            , [req.session.nickname, '-', `React 로그인 테스트`], function (error, result) { });
                    }
                    else{                                   // 비밀번호가 다른 경우
                        sendData.isLogin = "로그인 정보가 일치하지 않습니다."
                        res.send(sendData);
                    }
                })                      
            } else {    // db에 해당 아이디가 없는 경우
                sendData.isLogin = "아이디 정보가 일치하지 않습니다."
                res.send(sendData);
            }
        });
    } else {            // 아이디, 비밀번호 중 입력되지 않은 값이 있는 경우
        sendData.isLogin = "아이디와 비밀번호를 입력하세요!"
        res.send(sendData);
    }
});

app.post("/signin", (req, res) => {  // 데이터 받아서 결과 전송
    const username = req.body.userId;
    const password = req.body.userPassword;
    const password2 = req.body.userPassword2;
    
    const sendData = { isSuccess: "" };

    if (username && password && password2) {
        db.query('SELECT * FROM userTable WHERE username = ?', [username], function(error, results, fields) { // DB에 같은 이름의 회원아이디가 있는지 확인
            if (error) throw error;
            if (results.length <= 0 && password == password2) {         // DB에 같은 이름의 회원아이디가 없고, 비밀번호가 올바르게 입력된 경우
                const hasedPassword = bcrypt.hashSync(password, 10);    // 입력된 비밀번호를 해시한 값
                db.query('INSERT INTO userTable (username, password) VALUES(?,?)', [username, hasedPassword], function (error, data) {
                    if (error) throw error;
                    req.session.save(function () {                        
                        sendData.isSuccess = "True"
                        res.send(sendData);
                    });
                });
            } else if (password != password2) {                     // 비밀번호가 올바르게 입력되지 않은 경우                  
                sendData.isSuccess = "입력된 비밀번호가 서로 다릅니다."
                res.send(sendData);
            }
            else {                                                  // DB에 같은 이름의 회원아이디가 있는 경우            
                sendData.isSuccess = "이미 존재하는 아이디 입니다!"
                res.send(sendData);  
            }            
        });        
    } else {
        sendData.isSuccess = "아이디와 비밀번호를 입력하세요!"
        res.send(sendData);  
    }
    
});


// 클라이언트 IP 주소를 가져오는 함수
function getClientIP(req) {
    // X-Forwarded-For 헤더 확인 (프록시/로드밸런서 환경)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        const ips = forwarded.split(',');
        return ips[0].trim();
    }
    // Express의 req.ip 사용
    if (req.ip) {
        return req.ip;
    }
    // 직접 연결인 경우
    return req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
}

// 상담 신청 API
app.post("/consultation", (req, res) => {
    const { name, phone, age, sex, address, remarks, device } = req.body;
    const sendData = { success: false };
    const clientIP = getClientIP(req);

    if (!name || !phone) {
        sendData.success = false;
        sendData.message = '이름과 연락처는 필수 입력 항목입니다.';
        return res.send(sendData);
    }

    db.query(
        'INSERT INTO info (name, phone, age, sex, address, remarks, regdt, ifflag, ip, device) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)',
        [name, phone, age || null, sex || null, address || null, remarks || null, 'N', clientIP, device || 'PC'],
        function (error, result) {
            if (error) {
                console.error('상담 신청 저장 오류:', error.code, error.message);
                sendData.success = false;
                if (error.code === 'ER_DUP_ENTRY') {
                    sendData.message = '이미 등록된 연락처입니다.';
                } else {
                    sendData.message = '저장 중 오류가 발생했습니다: ' + error.message;
                }
                return res.send(sendData);
            }
            sendData.success = true;
            sendData.message = '상담 신청이 완료되었습니다.';
            console.log('상담 신청 저장 성공:', name, phone);
            res.send(sendData);
        }
    );
});

// 상담 신청 목록 조회 API (관리자용)
app.get("/consultations", (req, res) => {
    db.query('SELECT * FROM info ORDER BY name DESC', function (error, results) {
        if (error) {
            console.error('상담 목록 조회 오류:', error);
            res.status(500).send({ error: '조회 중 오류가 발생했습니다.' });
        } else {
            res.send(results);
        }
    });
});

// 외부 API로 데이터 전송하는 함수
async function sendDataToExternalAPI(data) {
    const API_URL = 'http://jn-plan.co.kr/landing_api.php';
    const LANDING_ID = 'hogwanwon_001'; // 랜딩페이지 ID (필요시 변경)
    
    try {
        // form-urlencoded 형식으로 데이터 변환
        const params = new URLSearchParams();
        params.append('landing_id', LANDING_ID);
        params.append('wr_20', '호관원 테스트');
        params.append('wr_1', data.name || '');
        params.append('wr_2', data.address || '');
        params.append('wr_5', data.phone || '');
        params.append('wr_7', data.remarks || '');
        params.append('wr_ip', data.ip || '');
        
        const response = await axios.post(API_URL, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 10000 // 10초 타임아웃
        });

        // 응답 데이터 확인
        const result = response.data;
        
        // JSON 문자열인 경우 파싱
        let resultCode;
        if (typeof result === 'string') {
            try {
                const parsed = JSON.parse(result);
                resultCode = parsed.result || parsed;
            } catch (e) {
                resultCode = result;
            }
        } else {
            resultCode = result.result || result;
        }

        return {
            success: resultCode === '0000' || resultCode === 0000,
            resultCode: resultCode,
            message: getErrorMessage(resultCode)
        };
    } catch (error) {
        console.error('외부 API 전송 오류:', error.message);
        return {
            success: false,
            resultCode: '1100',
            message: '기타 오류: ' + error.message
        };
    }
}

// 에러 코드에 따른 메시지 반환
function getErrorMessage(resultCode) {
    const errorMessages = {
        '1001': '랜딩페이지명 없음',
        '1002': '이름 없음',
        '1003': '전화번호 없음',
        '1004': '접속 IP 없음',
        '1100': '기타 오류',
        '0000': '성공'
    };
    return errorMessages[resultCode] || '알 수 없는 오류';
}

// ifflag='N'인 데이터를 조회하고 전송하는 함수
async function processPendingConsultations() {
    console.log(`[${new Date().toLocaleString('ko-KR')}] 대기 중인 상담 신청 처리 시작...`);
    
    db.query(
        "SELECT * FROM info WHERE ifflag = 'N' OR ifflag IS NULL ORDER BY regdt ASC",
        async function (error, results) {
            if (error) {
                console.error('대기 중인 상담 신청 조회 오류:', error);
                return;
            }

            if (results.length === 0) {
                console.log('전송할 데이터가 없습니다.');
                return;
            }

            console.log(`전송할 데이터 ${results.length}건 발견`);

            // 순차적으로 전송
            for (let i = 0; i < results.length; i++) {
                const data = results[i];
                
                try {
                    console.log(`[${i + 1}/${results.length}] 전송 중: ${data.name} (${data.phone})`);
                    
                    const sendResult = await sendDataToExternalAPI(data);
                    
                    if (sendResult.success) {
                        // 전송 성공 시 ifflag='Y', ifdt 업데이트, iflog에 성공 코드 저장 (phone이 primary key)
                        const successCode = sendResult.resultCode || '0000';
                        db.query(
                            "UPDATE info SET ifflag = 'Y', ifdt = NOW(), iflog = ? WHERE phone = ?",
                            [successCode, data.phone],
                            function (updateError) {
                                if (updateError) {
                                    console.error(`데이터 업데이트 오류 (${data.phone}):`, updateError);
                                } else {
                                    console.log(`✓ 전송 성공 및 업데이트 완료: ${data.name} (${data.phone}) - iflog: ${successCode}`);
                                }
                            }
                        );
                    } else {
                        // 전송 실패 시 iflog에 에러 코드 저장 (ifflag는 그대로 'N' 유지)
                        const errorCode = sendResult.resultCode || '1100';
                        db.query(
                            "UPDATE info SET iflog = ? WHERE phone = ?",
                            [errorCode, data.phone],
                            function (updateError) {
                                if (updateError) {
                                    console.error(`iflog 업데이트 오류 (${data.phone}):`, updateError);
                                } else {
                                    console.error(`✗ 전송 실패 (${data.name}, ${data.phone}): ${sendResult.message} (코드: ${errorCode}) - iflog에 저장됨`);
                                }
                            }
                        );
                    }
                    
                    // API 부하 방지를 위한 딜레이 (1초)
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (err) {
                    console.error(`데이터 전송 중 오류 발생 (${data.name}):`, err.message);
                }
            }

            console.log(`[${new Date().toLocaleString('ko-KR')}] 처리 완료`);
        }
    );
}

// 5분마다 실행되는 스케줄러 설정
// cron 표현식: '*/5 * * * *' = 매 5분마다 실행
cron.schedule('*/5 * * * *', () => {
    processPendingConsultations();
}, {
    scheduled: true,
    timezone: "Asia/Seoul"
});

// 서버 시작 시 즉시 한 번 실행 (선택사항)
// processPendingConsultations();

app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening at http://0.0.0.0:${port}`)
    console.log(`같은 망 내 접속: http://<본인IP>:${port}`)
    console.log('외부 API 전송 스케줄러가 시작되었습니다. (5분마다 실행)')
})