import './App.css';
import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from './supabase';

function useIsMobile(breakpointPx = 768) {
  const query = useMemo(() => `(max-width: ${breakpointPx}px)`, [breakpointPx]);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = (e) => setIsMobile(e.matches);
    onChange(mql);

    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return isMobile;
}

// 스크롤 애니메이션 훅
function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const element = ref.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return [ref, isVisible];
}

// 카운터 애니메이션 컴포넌트
function AnimatedCounter({ end, duration = 2000, suffix = '', isVisible }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, isVisible]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

function ConsultationForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    sex: '',
    address: '',
    remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 전화번호 포맷팅 (01099998888 -> 010-9999-8888)
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.startsWith('02')) {
      if (numbers.length <= 5) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
      return `${numbers.slice(0, 2)}-${numbers.slice(2, -4)}-${numbers.slice(-4)}`;
    }
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    const formatted = formatPhoneNumber(raw);
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }));
  };

  // 디바이스 타입 감지 함수 (PC 또는 Mobile)
  const detectDevice = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    // 모바일 기기 감지
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase()) || width <= 768;

    return isMobile ? 'Mobile' : 'PC';
  };

  // 카카오 우편번호 검색 팝업 열기
  const openPostcode = () => {
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function (data) {
          let addr = ''; // 주소 변수
          let extraAddr = ''; // 참고항목 변수

          // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
          if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
            addr = data.roadAddress;
          } else { // 사용자가 지번 주소를 선택했을 경우(J)
            addr = data.jibunAddress;
          }

          // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
          if (data.userSelectedType === 'R') {
            // 법정동명이 있을 경우 추가한다. (법정리는 제외)
            // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
            if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
              extraAddr += data.bname;
            }
            // 건물명이 있고, 공동주택일 경우 추가한다.
            if (data.buildingName !== '' && data.apartment === 'Y') {
              extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
            if (extraAddr !== '') {
              extraAddr = ' (' + extraAddr + ')';
            }
          }

          // 우편번호와 주소 정보를 해당 필드에 넣는다.
          const fullAddress = `[${data.zonecode}] ${addr}${extraAddr}`;
          setFormData(prev => ({
            ...prev,
            address: fullAddress
          }));
        },
        width: '100%',
        height: '100%',
        maxSuggestItems: 5
      }).open();
    } else {
      alert('주소 검색 서비스를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      alert('이름과 연락처는 필수 입력 항목입니다.');
      return;
    }

    setIsSubmitting(true);
    const device = detectDevice();
    const phoneClean = formData.phone.replace(/\D/g, '');

    if (!supabase) {
      setSubmitResult('error');
      alert('Supabase가 설정되지 않았습니다. .env 파일을 확인하세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.from('info').insert({
        phone: phoneClean,
        name: formData.name.trim(),
        age: formData.age || null,
        sex: formData.sex || null,
        address: formData.address || null,
        remarks: formData.remarks || null,
        device: device,
        ip: 'client',
        ifflag: 'N',
      });

      if (error) {
        if (error.code === '23505') {
          alert('이미 등록된 연락처입니다.');
        } else {
          alert('상담 신청에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
        setSubmitResult('error');
        console.error('상담 신청 오류:', error);
      } else {
        setSubmitResult('success');
        setFormData({ name: '', phone: '', age: '', sex: '', address: '', remarks: '' });
      }
    } catch (error) {
      setSubmitResult('error');
      alert('상담 신청에 실패했습니다. 잠시 후 다시 시도해주세요.');
      console.error('상담 신청 오류:', error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="consultation-form-container">
      <div className="form-header-icon">📞</div>
      <h2 className="form-title">
        <span className="title-accent">무료</span> 상담 신청
      </h2>
      <p className="form-subtitle">
        친절한 상담원이 <strong>직접 전화</strong>로 안내해 드립니다
      </p>

      <div className="form-trust-badges">
        <span>✓ 강압적 권유 없음</span>
        <span>✓ 부담 없는 상담</span>
      </div>

      {submitResult === 'success' ? (
        <div className="success-message">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3>상담 신청이 완료되었습니다!</h3>
          <p>영업일 기준 1~2일 내에<br />담당자가 연락드리겠습니다.</p>
          <button className="btn-reset" onClick={() => setSubmitResult(null)}>
            추가 신청하기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={`form-group ${focusedField === 'name' ? 'focused' : ''}`}>
            <label>성함 <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              placeholder="성함을 입력해 주세요"
              required
            />
          </div>

          <div className={`form-group ${focusedField === 'phone' ? 'focused' : ''}`}>
            <label>연락처 <span className="required">*</span></label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              placeholder="010-0000-0000"
              maxLength={13}
              required
            />
          </div>

          <div className="form-row">
            <div className={`form-group half ${focusedField === 'age' ? 'focused' : ''}`}>
              <label>연령대</label>
              <select
                name="age"
                value={formData.age}
                onChange={handleChange}
                onFocus={() => setFocusedField('age')}
                onBlur={() => setFocusedField(null)}
              >
                <option value="">선택해 주세요</option>
                <option value="20대">20대</option>
                <option value="30대">30대</option>
                <option value="40대">40대</option>
                <option value="50대">50대</option>
                <option value="60대">60대</option>
                <option value="70대 이상">70대 이상</option>
              </select>
            </div>

            <div className={`form-group half ${focusedField === 'sex' ? 'focused' : ''}`}>
              <label>성별</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                onFocus={() => setFocusedField('sex')}
                onBlur={() => setFocusedField(null)}
              >
                <option value="">선택해 주세요</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
              </select>
            </div>
          </div>

          <div className={`form-group ${focusedField === 'address' ? 'focused' : ''}`}>
            <label>주소</label>
            <div className="address-input-group">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onFocus={() => setFocusedField('address')}
                onBlur={() => setFocusedField(null)}
                placeholder="주소를 검색해주세요"
                readOnly
                className="address-input"
              />
              <button
                type="button"
                onClick={openPostcode}
                className="address-search-btn"
              >
                주소 검색
              </button>
            </div>
          </div>

          <div className={`form-group ${focusedField === 'remarks' ? 'focused' : ''}`}>
            <label>상담 내용 (선택)</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              onFocus={() => setFocusedField('remarks')}
              onBlur={() => setFocusedField(null)}
              placeholder="궁금하신 점을 자유롭게 적어주세요"
              rows="3"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            <span className="btn-text">{isSubmitting ? '신청 중...' : '무료 상담 신청하기'}</span>
            <span className="btn-icon">→</span>
          </button>

          <p className="privacy-notice">
            <span className="privacy-icon">🔒</span>
            입력하신 개인정보는 상담 목적으로만 사용되며,<br />
            제3자에게 절대 제공되지 않습니다.
          </p>
          <ul className="agree_wrap" style={{ listStyle: 'none', padding: '15px', margin: '20px 0', background: '#f9f9f9', border: '1px solid #ddd', fontSize: '13px', color: '#666' }}>
            <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" id="agree1-1" name="agree1-1" defaultChecked style={{ marginRight: '8px', width: '16px', height: '16px', accentColor: '#2C5530', cursor: 'pointer' }} />
                <label htmlFor="agree1-1" style={{ cursor: 'pointer', lineHeight: '1.2' }}>개인정보 수집이용 동의(필수)</label>
              </div>
              <a href="/policy/index1.html" target="_blank" rel="noopener noreferrer" className="btn-example" style={{ textDecoration: 'none', color: '#888', cursor: 'pointer', whiteSpace: 'nowrap' }}>[약관보기]</a>
            </li>
            <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" id="agree1-2" name="agree1-2" defaultChecked style={{ marginRight: '8px', width: '16px', height: '16px', accentColor: '#2C5530', cursor: 'pointer' }} />
                <label htmlFor="agree1-2" style={{ cursor: 'pointer', lineHeight: '1.2' }}>제 3자 정보 제공 동의(필수)</label>
              </div>
              <a href="/policy/index2.html" target="_blank" rel="noopener noreferrer" className="btn-example" style={{ textDecoration: 'none', color: '#888', cursor: 'pointer', whiteSpace: 'nowrap' }}>[약관보기]</a>
            </li>
            <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" id="agree1-3" name="agree1-3" defaultChecked style={{ marginRight: '8px', width: '16px', height: '16px', accentColor: '#2C5530', cursor: 'pointer' }} />
                <label htmlFor="agree1-3" style={{ cursor: 'pointer', lineHeight: '1.2' }}>마케팅 정보 수신동의(선택)</label>
              </div>
              <a href="/policy/index3.html" target="_blank" rel="noopener noreferrer" className="btn-example" style={{ textDecoration: 'none', color: '#888', cursor: 'pointer', whiteSpace: 'nowrap' }}>[약관보기]</a>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" id="agree1-4" name="agree1-4" defaultChecked style={{ marginRight: '8px', width: '16px', height: '16px', accentColor: '#2C5530', cursor: 'pointer' }} />
                <label htmlFor="agree1-4" style={{ cursor: 'pointer', lineHeight: '1.2' }}>개인정보 처리방침</label>
              </div>
              <a href="/policy/index4.html" target="_blank" rel="noopener noreferrer" className="btn-example" style={{ textDecoration: 'none', color: '#888', cursor: 'pointer', whiteSpace: 'nowrap' }}>[약관보기]</a>
            </li>
          </ul>
        </form>
      )}
    </div>
  );
}

function App() {
  const isMobileView = useIsMobile(768);
  const [scrollY, setScrollY] = useState(0);
  const [headerSolid, setHeaderSolid] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sec6Alt, setSec6Alt] = useState(false);
  const [sec12Index, setSec12Index] = useState(0);

  // 스크롤 애니메이션 refs
  const [trustRef, trustVisible] = useScrollAnimation();
  const [certRef, certVisible] = useScrollAnimation();
  const [benefitsRef, benefitsVisible] = useScrollAnimation();
  const [ingredientsRef, ingredientsVisible] = useScrollAnimation();
  const [giftRef, giftVisible] = useScrollAnimation();
  const [testimonialsRef, testimonialsVisible] = useScrollAnimation();
  const [guaranteeRef, guaranteeVisible] = useScrollAnimation();
  const [consultationRef, consultationVisible] = useScrollAnimation();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setHeaderSolid(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // sec6 아이콘 교체 타이머 (2초 간격)
  useEffect(() => {
    const timer = setInterval(() => {
      setSec6Alt((prev) => !prev);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // sec12 이미지 순환 타이머 (2초 간격, 1→2→3→1...)
  useEffect(() => {
    const timer = setInterval(() => {
      setSec12Index((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // 모바일 메뉴 토글
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  // 메뉴 아이템 클릭 시 메뉴 닫기
  const handleMenuClick = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className={`landing-page ${isMobileView ? 'hg-mobile-view' : 'hg-pc-view'}`}>
      {/* 언제든 상담 섹션으로 이동하는 고정 TOP 버튼 (원본 사이트 TOP.png 사용) */}
      <a href="#consultation" className="fixed-top-button">
        <img src="/hoguanwon.com/img/TOP.png" alt="무료 상담 바로가기" />
      </a>

      {/* 헤더 */}
      <header className={`header ${headerSolid ? 'solid' : ''} ${mobileMenuOpen ? 'menu-open' : ''}`}>
        <div className="container">
          {/* 상단 내비게이션/버튼 제거 (디자인 단순화) */}
        </div>
      </header>

      {/* 모바일 메뉴 오버레이 제거 */}

      {/* 히어로 섹션 – 원본 사이트처럼 비디오 배너 사용 */}
      <section className="hero-video-section">
        <video
          className="hero-video"
          src="/hoguanwon.com/img/banner_video.mp4"
          poster="/hoguanwon.com/img/poster.jpg"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="hero-video-overlay">
          <div className="hero-video-text">
            <p className="hero-line hero-line-large">관절건강 대표주자</p>
            <p className="hero-line hero-line-small">
              제조원 (주)동진제약<br />
              판매원 자연내림호관원(주)
            </p>
          </div>
        </div>
      </section>

      {/* sec2 ~ sec13 이미지 섹션들 (원본 PC 사이트 배치 기반) */}

      {/* sec2: 배경 + 좌측 타이틀 + 우측 모델 */}
      <section className="hg-section hg-sec2">
        <img
          src="/hoguanwon.com/img/sec2_bg.jpg"
          alt="호관원 배경화면"
          className="hg-sec-bg"
        />
        <div className="hg-sec2-inner">
          <div className="hg-sec2-left">
            <img
              src="/hoguanwon.com/img/sec2_left_info.png"
              alt="호관원 타이틀 이미지"
            />
          </div>
          <div className="hg-sec2-right">
            <img
              src="/hoguanwon.com/img/sec2_model.png"
              alt="호관원 모델 이미지"
            />
          </div>
        </div>
      </section>

      {/* sec3: 편지/손/시그 이미지 레이아웃 */}
      <section className="hg-section hg-sec3">
        <img
          src="/hoguanwon.com/img/sec3_letter_form.png"
          alt="호관원 편지 배경"
          className="hg-sec-bg"
        />
        <div className="hg-sec3-text">
          <p>당신이 환하게 웃을 수 있길</p>
          <p>하루하루 활력이 가득하길</p>
          <p>그리고</p>
          <p>관절이 편안하기를...</p>
        </div>
        <div className="hg-sec3-layer hg-sec3-hand">
          <img
            src="/hoguanwon.com/img/sec3_hand.png"
            alt="호관원 손 이미지"
          />
        </div>
        <div className="hg-sec3-layer hg-sec3-sig">
          <img
            src="/hoguanwon.com/img/sec3_sig.png"
            alt="호관원 서명 이미지"
          />
        </div>
      </section>

      {/* sec4: 배경 + 타이틀 + 내용 + 모델 + 제품 */}
      <section className="hg-section hg-sec4">
        <img
          src="/hoguanwon.com/img/sec4_bg.jpg"
          alt="호관원 배경화면"
          className="hg-sec-bg"
        />
        <div className="hg-sec4-layer hg-sec4-title">
          <img
            src="/hoguanwon.com/img/sec4_hoguanwon.png"
            alt="호관원 타이틀 이미지"
          />
        </div>
        <div className="hg-sec4-layer hg-sec4-subtitle">
          <img
            src="/hoguanwon.com/img/sec4_hoguanwon2.png"
            alt="호관원 내용 이미지"
          />
        </div>
        <div className="hg-sec4-layer hg-sec4-model">
          <img
            src="/hoguanwon.com/img/sec4_model.png"
            alt="호관원 모델 이미지"
          />
        </div>
        <div className="hg-sec4-layer hg-sec4-product">
          <img
            src="/hoguanwon.com/img/sec4_product.png"
            alt="호관원 제품 이미지"
          />
        </div>
      </section>

      {/* sec5: 효능 관련 섹션 */}
      <section className="hg-section hg-sec5">
        <img
          src="/hoguanwon.com/img/sec5_bg.jpg"
          alt="호관원 배경화면"
          className="hg-sec-bg"
        />
        <div className="hg-sec5-layer hg-sec5-title">
          <img
            src="/hoguanwon.com/img/sec5_title.png"
            alt="호관원 타이틀 이미지"
          />
        </div>
        <div className="hg-sec5-layer hg-sec5-info">
          <img
            src="/hoguanwon.com/img/sec5_info.png"
            alt="호관원 효과 인포 이미지"
          />
        </div>
        <div className="hg-sec5-layer hg-sec5-img">
          <img
            src="/hoguanwon.com/img/sec5_img.png"
            alt="호관원 효과 이미지"
          />
        </div>
        <div className="hg-sec5-layer hg-sec5-product">
          <img
            src="/hoguanwon.com/img/sec5_product.png"
            alt="호관원 제품 이미지"
          />
        </div>
      </section>

      {/* sec6: MSM/관절 설명 섹션 */}
      <section className="hg-section hg-sec6">
        <img
          src="/hoguanwon.com/img/sec6_bg.jpg"
          alt="호관원 MSM 배경"
          className="hg-sec-bg"
        />
        <div className="hg-sec6-layer hg-sec6-title">
          <img
            src="/hoguanwon.com/img/sec6_title.png"
            alt="호관원 MSM 타이틀"
          />
        </div>
        <div className="hg-sec6-layer hg-sec6-con">
          <img
            src="/hoguanwon.com/img/sec6_con.png"
            alt="호관원 MSM 내용"
          />
        </div>
        {/* 세부 아이콘/그래픽들 */}
        <div className="hg-sec6-layer hg-sec6-icon icon-1">
          <img
            src={sec6Alt ? "/hoguanwon.com/img/sec6_005.png" : "/hoguanwon.com/img/sec6_001.png"}
            alt="아이콘1"
          />
        </div>
        <div className="hg-sec6-layer hg-sec6-icon icon-2">
          <img
            src={sec6Alt ? "/hoguanwon.com/img/sec6_006.png" : "/hoguanwon.com/img/sec6_002.png"}
            alt="아이콘2"
          />
        </div>
        <div className="hg-sec6-layer hg-sec6-icon icon-3">
          <img
            src={sec6Alt ? "/hoguanwon.com/img/sec6_007.png" : "/hoguanwon.com/img/sec6_003.png"}
            alt="아이콘3"
          />
        </div>
        <div className="hg-sec6-layer hg-sec6-icon icon-4">
          <img
            src={sec6Alt ? "/hoguanwon.com/img/sec6_008.png" : "/hoguanwon.com/img/sec6_004.png"}
            alt="아이콘4"
          />
        </div>
      </section>

      {/* sec7: 이중케어/케어 이미지 섹션 */}
      <section className="hg-section hg-sec7">
        <img
          src="/hoguanwon.com/img/sec7_bg.jpg"
          alt="호관원 배경화면"
          className="hg-sec-bg"
        />
        <div className="hg-sec7-layer hg-sec7-title">
          <img
            src="/hoguanwon.com/img/sec7_title.png"
            alt="호관원 타이틀 이미지"
          />
        </div>
        <div className="hg-sec7-layer hg-sec7-img">
          <img
            src="/hoguanwon.com/img/sec7_img.png"
            alt="호관원 이미지"
          />
        </div>
        <div className="hg-sec7-layer hg-sec7-care">
          <img
            src="/hoguanwon.com/img/sec7_care.png"
            alt="호관원 이중케어 이미지"
          />
        </div>
      </section>

      {/* sec8: 인포/효과 섹션 */}
      <section className="hg-section hg-sec8">
        <img
          src="/hoguanwon.com/img/sec8_bg.jpg"
          alt="호관원 배경화면"
          className="hg-sec-bg"
        />
        <div className="hg-sec8-layer hg-sec8-title">
          <img
            src="/hoguanwon.com/img/sec8_title.png"
            alt="호관원 타이틀 이미지"
          />
        </div>
        <div className="hg-sec8-layer hg-sec8-img">
          <img
            src="/hoguanwon.com/img/sec8_img.png"
            alt="호관원 인포 이미지"
          />
        </div>
        <div className="hg-sec8-layer hg-sec8-right">
          <img
            src="/hoguanwon.com/img/sec8_right_info.png"
            alt="호관원 효과 이미지"
          />
        </div>
      </section>

      {/* sec9: 그래프/효과 섹션 */}
      <section className="hg-section hg-sec9">
        <img
          src="/hoguanwon.com/img/sec9_bg.jpg"
          alt="호관원 배경화면"
          className="hg-sec-bg"
        />
        <div className="hg-sec9-layer hg-sec9-title">
          <img
            src="/hoguanwon.com/img/sec9_title.png"
            alt="호관원 타이틀 이미지"
          />
        </div>
        <div className="hg-sec9-video video-shoulder">
          <video src="/hoguanwon.com/img/shoulder.webm" autoPlay muted loop playsInline style={{ width: '100%', display: 'block' }} />
        </div>
        <div className="hg-sec9-video video-elbow">
          <video src="/hoguanwon.com/img/elbow.webm" autoPlay muted loop playsInline style={{ width: '100%', display: 'block' }} />
        </div>
        <div className="hg-sec9-video video-wrist">
          <video src="/hoguanwon.com/img/wrist.webm" autoPlay muted loop playsInline style={{ width: '100%', display: 'block' }} />
        </div>
        <div className="hg-sec9-video video-knee">
          <video src="/hoguanwon.com/img/knee.webm" autoPlay muted loop playsInline style={{ width: '100%', display: 'block' }} />
        </div>
      </section>

      {/* sec10: MSM 이미지/비디오 섹션 */}
      <section className="hg-section hg-sec10">
        <img
          src="/hoguanwon.com/img/sec10_bg.jpg"
          alt="호관원 배경화면"
          className="hg-sec-bg"
        />
        <div className="hg-sec10-layer hg-sec10-msm">
          <div className="hg-sec10-msm-inner">
            <img
              src="/hoguanwon.com/img/sec10_msm.png"
              alt="호관원 MSM 이미지"
            />
            <div className="hg-sec10-graphs">
              <img
                src="/hoguanwon.com/img/grhap_01.gif"
                alt="호관원 그래프 이미지"
              />
              <img
                src="/hoguanwon.com/img/grhap_02.gif"
                alt="호관원 그래프 이미지2"
              />
            </div>
          </div>
        </div>
        <div className="hg-sec10-layer hg-sec10-bottom">
          <img
            src="/hoguanwon.com/img/sec10_bottom.png"
            alt="호관원 설명 이미지"
          />
        </div>
      </section>

      {/* sec11: 제품/타이틀 섹션 */}
      <section className="hg-section hg-sec11">
        <img
          src="/hoguanwon.com/img/sec11_bg.jpg"
          alt="호관원 배경화면"
          className="hg-sec-bg"
        />
        <div className="hg-sec11-layer hg-sec11-title">
          <img
            src="/hoguanwon.com/img/sec11_title.png"
            alt="호관원 타이틀 이미지"
          />
        </div>
      </section>

      {/* sec12: 인포/로고 섹션 */}
      <section className="hg-section hg-sec12">
        <img
          src="/hoguanwon.com/img/sec12_bg.jpg"
          alt="호관원 배경화면"
          className="hg-sec-bg"
        />
        <div className="hg-sec12-layer hg-sec12-title">
          <img
            src="/hoguanwon.com/img/sec12_title.png"
            alt="호관원 타이틀 이미지"
          />
        </div>
        <div className="hg-sec12-layer hg-sec12-info">
          <img
            src="/hoguanwon.com/img/sec12_info.png"
            alt="호관원 인포 이미지"
          />
        </div>
        <div className="hg-sec12-layer hg-sec12-logo">
          <img
            src="/hoguanwon.com/img/sec12_logo.png"
            alt="호관원 로고 이미지"
          />
        </div>
        <div className="hg-sec12-layer hg-sec12-img img-animated">
          <img
            src={
              sec12Index === 0
                ? "/hoguanwon.com/img/sec12_img01.png"
                : sec12Index === 1
                  ? "/hoguanwon.com/img/sec12_img02.png"
                  : "/hoguanwon.com/img/sec12_img03.png"
            }
            alt="호관원 이미지"
          />
        </div>
      </section>

      {/* sec13: 최하단 상담/전화 섹션 (비주얼만, 실제 폼은 React ConsultationForm 사용) */}
      <section className="hg-section hg-sec13">
        <img
          src="/hoguanwon.com/img/sec13_bg.jpg"
          alt="호관원 하단 배경"
          className="hg-sec-bg"
        />
        <div className="hg-sec13-layer hg-sec13-logo">
          <img
            src="/hoguanwon.com/img/sec13_logo.png"
            alt="호관원 로고"
          />
        </div>
        <div className="hg-sec13-layer hg-sec13-model">
          <img
            src="/hoguanwon.com/img/sec13_model.png"
            alt="호관원 모델"
          />
        </div>
        <div className="hg-sec13-layer hg-sec13-phone">
          <img
            src="/hoguanwon.com/img/sec13_phone.png"
            alt="호관원 상담 전화"
          />
        </div>
        <div className="hg-sec13-layer hg-sec13-writing">
          <img
            src="/hoguanwon.com/img/sec13_writing.png"
            alt="호관원 문구 이미지"
          />
        </div>
      </section>

      {/* trust-badges, 인증, 효능 섹션 제거 (원본 이미지 섹션만 사용) */}

      {/* 상담 신청 섹션 */}
      <section id="consultation" className="consultation" ref={consultationRef}>
        <div className="consultation-bg">
          <div className="bg-shape shape-1"></div>
          <div className="bg-shape shape-2"></div>
          <div className="bg-shape shape-3"></div>
        </div>
        <div className={`container ${consultationVisible ? 'animate-in' : ''}`}>
          <div className="consultation-wrapper">
            <div className="consultation-info">
              <h2 className="consultation-title">
                지금 바로<br />
                <span className="accent">무료 상담</span> 받아보세요
              </h2>
              <p className="consultation-desc">
                강압적인 권유 없이 친절하게 상담해 드립니다.<br />
                궁금한 점이 있으시면 부담 없이 문의해 주세요.
              </p>
              <div className="consultation-phone">
                <span className="phone-label">전화 상담</span>
                <a href="tel:1588-0000" className="phone-number-large">
                  1588-0000
                </a>
                <span className="phone-time">평일 09:00 - 18:00</span>
              </div>
            </div>
            <ConsultationForm />
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="logo-icon">H</span>
                <span className="logo-text">호관원</span>
              </div>
              <p className="footer-desc">
                30년 전통의 프리미엄 관절 건강 식품<br />
                가족의 건강을 생각하는 마음으로 만듭니다.
              </p>
              <div className="footer-cert">
                <span>식약처 인증</span>
                <span>GMP 인증</span>
                <span>HACCP</span>
              </div>
            </div>

            <div className="footer-contact">
              <h4>고객센터</h4>
              <p className="contact-number">1588-0000</p>
              <p>평일 09:00 - 18:00</p>
              <p>토·일·공휴일 휴무</p>
              <p className="contact-email">help@hogwanwon.com</p>
            </div>

            <div className="footer-links">
              <h4>바로가기</h4>
              <a href="#benefits">효능</a>
              <a href="#ingredients">성분</a>
              <a href="#testimonials">후기</a>
              <a href="#consultation">상담신청</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="company-info">
              (주)호관원 | 대표: 홍길동 | 사업자등록번호: 123-45-67890<br />
              서울특별시 강남구 테헤란로 123, 5층
            </p>
            <p className="footer-notice">
              본 제품은 질병의 예방 및 치료를 위한 의약품이 아닙니다.
            </p>
            <p className="copyright">© 2024 호관원. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 플로팅 CTA 버튼 */}
      <a href="#consultation" className={`floating-cta ${scrollY > 500 ? 'visible' : ''}`}>
        <span className="floating-cta-icon">📞</span>
        <span>무료 상담</span>
      </a>

      {/* 플로팅 전화 버튼 (모바일) */}
      <a href="tel:1588-0000" className={`floating-phone ${scrollY > 500 ? 'visible' : ''}`}>
        <span className="phone-icon-float">📞</span>
        <span className="phone-text-float">전화하기</span>
      </a>
    </div>
  );
}

export default App;
