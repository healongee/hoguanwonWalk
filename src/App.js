import './App.css';
import { useState, useEffect, useRef } from 'react';

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

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
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
        oncomplete: function(data) {
          let addr = ''; // 주소 변수
          let extraAddr = ''; // 참고항목 변수

          // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
          if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
            addr = data.roadAddress;
          } else { // 사용자가 지번 주소를 선택했을 경우(J)
            addr = data.jibunAddress;
          }

          // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
          if(data.userSelectedType === 'R'){
            // 법정동명이 있을 경우 추가한다. (법정리는 제외)
            // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
            if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
              extraAddr += data.bname;
            }
            // 건물명이 있고, 공동주택일 경우 추가한다.
            if(data.buildingName !== '' && data.apartment === 'Y'){
              extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
            if(extraAddr !== ''){
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
    
    // 디바이스 타입 감지
    const device = detectDevice();
    
    // API URL: 같은 망 내 접속 시 현재 호스트 사용
    const apiUrl = `${window.location.protocol}//${window.location.hostname}:3001/consultation`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          device: device
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmitResult('success');
        setFormData({ name: '', phone: '', age: '', sex: '', address: '', remarks: '' });
      } else {
        setSubmitResult('error');
        alert(result.message || '상담 신청에 실패했습니다.');
      }
    } catch (error) {
      setSubmitResult('error');
      alert('네트워크 오류가 발생했습니다. 서버 연결을 확인해주세요.');
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
        </form>
      )}
    </div>
  );
}

function App() {
  const [scrollY, setScrollY] = useState(0);
  const [headerSolid, setHeaderSolid] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
    <div className="landing-page">
      {/* 상단 띠 배너 */}
      <div className="top-banner">
        <div className="container">
          <span className="banner-text">
            🎁 <strong>지금 상담 신청하시면</strong> 특별 할인 혜택을 드립니다
          </span>
          <a href="#consultation" className="banner-cta">혜택 받기 →</a>
        </div>
      </div>

      {/* 헤더 */}
      <header className={`header ${headerSolid ? 'solid' : ''} ${mobileMenuOpen ? 'menu-open' : ''}`}>
        <div className="container">
          <div className="logo">
            <span className="logo-icon">H</span>
            <span className="logo-text">호관원</span>
          </div>
          <nav className="nav">
            <a href="#benefits">효능</a>
            <a href="#ingredients">성분</a>
            <a href="#testimonials">후기</a>
            <a href="#consultation" className="nav-cta">상담신청</a>
          </nav>
          <button 
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="메뉴 열기"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* 모바일 메뉴 오버레이 */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={handleMenuClick}>
        <nav className="mobile-nav" onClick={(e) => e.stopPropagation()}>
          <a href="#benefits" onClick={handleMenuClick}>
            <span className="mobile-nav-icon">🦴</span>
            <span className="mobile-nav-text">효능</span>
          </a>
          <a href="#ingredients" onClick={handleMenuClick}>
            <span className="mobile-nav-icon">🌿</span>
            <span className="mobile-nav-text">성분</span>
          </a>
          <a href="#testimonials" onClick={handleMenuClick}>
            <span className="mobile-nav-icon">💬</span>
            <span className="mobile-nav-text">후기</span>
          </a>
          <a href="#consultation" onClick={handleMenuClick} className="mobile-nav-cta">
            <span className="mobile-nav-icon">📞</span>
            <span className="mobile-nav-text">무료 상담 신청</span>
          </a>
        </nav>
      </div>

      {/* 히어로 섹션 */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-particles">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}></div>
            ))}
          </div>
        </div>
        
        <div className="hero-content">
          <div className="container">
            <div className="hero-inner">
              <div className="hero-text">
                <div className="hero-badge animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <span className="badge-dot"></span>
                  식약처 인증 건강기능식품
                </div>
                
                <h1 className="hero-title animate-slide-up" style={{ animationDelay: '0.4s' }}>
                  <span className="title-small">부모님께 드리는 건강 선물</span>
                  <span className="title-main">아프지 마세요,</span>
                  <span className="title-main accent">오래오래 함께해요</span>
                </h1>
                
                <p className="hero-description animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  30년 전통의 <strong>호관원 프리미엄</strong><br />
                  <span className="highlight-text">관절 건강을 원하는 분들을 위해</span><br />
                  특별히 개발된 엄선된 한방 원료로 만들었습니다.
                </p>

                <div className="hero-phone animate-fade-in" style={{ animationDelay: '0.7s' }}>
                  <span className="phone-label">지금 바로 전화 상담</span>
                  <a href="tel:1588-0000" className="phone-number">
                    <span className="phone-icon">📞</span>
                    1588-0000
                  </a>
                </div>
                
                <div className="hero-cta-group animate-fade-in" style={{ animationDelay: '0.8s' }}>
                  <a href="#consultation" className="btn-primary">
                    <span>무료 상담 신청</span>
                    <span className="btn-arrow">→</span>
                  </a>
                  <a href="#benefits" className="btn-secondary">
                    자세히 알아보기
                  </a>
                </div>
              </div>
              
              <div className="hero-visual animate-scale-in" style={{ animationDelay: '0.5s' }}>
                <div className="hero-image-container">
                  <div className="hero-image-bg"></div>
                  <div className="hero-product-badge">
                    <span className="product-badge-text">효도 선물<br />1위</span>
                  </div>
                  <div className="hero-stats">
                    <div className="stat-item">
                      <div className="stat-icon">👨‍👩‍👧‍👦</div>
                      <div className="stat-number">500만+</div>
                      <div className="stat-label">가족이 선택</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">⭐</div>
                      <div className="stat-number">98%</div>
                      <div className="stat-label">만족도</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">🏆</div>
                      <div className="stat-number">30년</div>
                      <div className="stat-label">전통 비법</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="scroll-indicator">
          <span>아래로 스크롤</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* 신뢰 배지 */}
      <section className="trust-badges" ref={trustRef}>
        <div className="container">
          <div className={`badges-grid ${trustVisible ? 'animate-in' : ''}`}>
            <div className="badge-item" style={{ animationDelay: '0s' }}>
              <div className="badge-icon">👨‍👩‍👧‍👦</div>
              <div className="badge-number">
                <AnimatedCounter end={500} suffix="만+" isVisible={trustVisible} />
              </div>
              <div className="badge-text">가족이 선택한</div>
            </div>
            <div className="badge-item" style={{ animationDelay: '0.1s' }}>
              <div className="badge-icon">💝</div>
              <div className="badge-number">
                <AnimatedCounter end={98} suffix="%" isVisible={trustVisible} />
              </div>
              <div className="badge-text">고객 만족도</div>
            </div>
            <div className="badge-item" style={{ animationDelay: '0.2s' }}>
              <div className="badge-icon">📜</div>
              <div className="badge-number">
                <AnimatedCounter end={30} suffix="년" isVisible={trustVisible} />
              </div>
              <div className="badge-text">전통 비법</div>
            </div>
            <div className="badge-item" style={{ animationDelay: '0.3s' }}>
              <div className="badge-icon">🏅</div>
              <div className="badge-number">1위</div>
              <div className="badge-text">관절 건강식품</div>
            </div>
          </div>
        </div>
      </section>

      {/* 인증 섹션 */}
      <section className="certification-section" ref={certRef}>
        <div className="container">
          <div className={`cert-content ${certVisible ? 'animate-in' : ''}`}>
            <div className="cert-text">
              <h3>믿을 수 있는 <span className="accent">식약처 인증</span> 제품</h3>
              <p>호관원은 식품의약품안전처로부터 기능성을 인정받은<br />건강기능식품입니다.</p>
            </div>
            <div className="cert-badges">
              <div className="cert-badge">
                <span className="cert-icon">✓</span>
                <span className="cert-label">식약처 인증</span>
              </div>
              <div className="cert-badge">
                <span className="cert-icon">✓</span>
                <span className="cert-label">GMP 인증</span>
              </div>
              <div className="cert-badge">
                <span className="cert-icon">✓</span>
                <span className="cert-label">HACCP 인증</span>
              </div>
              <div className="cert-badge">
                <span className="cert-icon">✓</span>
                <span className="cert-label">특허 성분</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 효능 섹션 */}
      <section id="benefits" className="section benefits" ref={benefitsRef}>
        <div className="container">
          <div className={`section-header ${benefitsVisible ? 'animate-in' : ''}`}>
            <span className="section-tag">효능</span>
            <h2 className="section-title">
              이런 분들께<br />
              <span className="title-accent">호관원을 추천</span>합니다
            </h2>
            <p className="section-subtitle">
              관절 건강이 걱정되시는 분들을 위한<br />
              맞춤형 건강 솔루션
            </p>
          </div>
          
          <div className={`benefits-grid ${benefitsVisible ? 'animate-in' : ''}`}>
            <div className="benefit-card" style={{ animationDelay: '0.1s' }}>
              <div className="benefit-icon">🚶</div>
              <h3>계단 오르내리기가<br />힘드신 분</h3>
              <p>무릎 관절의 연골 건강을 도와 계단 이용이 한결 편안해집니다.</p>
            </div>
            <div className="benefit-card" style={{ animationDelay: '0.2s' }}>
              <div className="benefit-icon">🌅</div>
              <h3>아침에 관절이<br />뻣뻣하신 분</h3>
              <p>기상 시 느껴지는 관절 불편함을 줄여 상쾌한 아침을 맞이하세요.</p>
            </div>
            <div className="benefit-card" style={{ animationDelay: '0.3s' }}>
              <div className="benefit-icon">⛰️</div>
              <h3>등산이나 운동을<br />즐기시는 분</h3>
              <p>활동적인 생활을 위한 관절 건강 관리에 도움이 됩니다.</p>
            </div>
            <div className="benefit-card" style={{ animationDelay: '0.4s' }}>
              <div className="benefit-icon">💝</div>
              <h3>부모님 건강이<br />걱정되시는 분</h3>
              <p>사랑하는 부모님께 드리는 효도 선물로 최고의 선택입니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 성분 섹션 */}
      <section id="ingredients" className="section ingredients" ref={ingredientsRef}>
        <div className="container">
          <div className={`section-header ${ingredientsVisible ? 'animate-in' : ''}`}>
            <span className="section-tag">엄선된 성분</span>
            <h2 className="section-title">
              자연에서 찾은<br />
              <span className="title-accent">프리미엄 원료</span>
            </h2>
            <p className="section-subtitle">
              한의학 전통 비법과 현대 과학이 만나<br />
              최적의 배합을 완성했습니다
            </p>
          </div>
          
          <div className={`ingredients-showcase ${ingredientsVisible ? 'animate-in' : ''}`}>
            <div className="ingredient-card" style={{ animationDelay: '0.1s' }}>
              <div className="ingredient-visual">
                <div className="visual-circle">
                  <span className="ingredient-emoji">🦌</span>
                </div>
              </div>
              <div className="ingredient-info">
                <h3>녹용</h3>
                <p>관절 건강과<br />원기 회복에 탁월</p>
              </div>
            </div>
            <div className="ingredient-card" style={{ animationDelay: '0.2s' }}>
              <div className="ingredient-visual">
                <div className="visual-circle">
                  <span className="ingredient-emoji">🌱</span>
                </div>
              </div>
              <div className="ingredient-info">
                <h3>홍삼</h3>
                <p>면역력 강화 및<br />피로 회복</p>
              </div>
            </div>
            <div className="ingredient-card" style={{ animationDelay: '0.3s' }}>
              <div className="ingredient-visual">
                <div className="visual-circle">
                  <span className="ingredient-emoji">🌾</span>
                </div>
              </div>
              <div className="ingredient-info">
                <h3>우슬</h3>
                <p>활기찬<br />일상을 위한</p>
              </div>
            </div>
            <div className="ingredient-card" style={{ animationDelay: '0.4s' }}>
              <div className="ingredient-visual">
                <div className="visual-circle">
                  <span className="ingredient-emoji">🍃</span>
                </div>
              </div>
              <div className="ingredient-info">
                <h3>당귀</h3>
                <p>건강한 순환을<br />돕는 식품</p>
              </div>
            </div>
          </div>
          
          <div className={`ingredients-notice ${ingredientsVisible ? 'animate-in' : ''}`}>
            <p>
              <strong>🔬 과학적 배합</strong><br />
              각 성분의 효능을 극대화하는 황금 비율로 배합하였습니다
            </p>
          </div>
        </div>
      </section>

      {/* 효도 선물 섹션 */}
      <section className="gift-section" ref={giftRef}>
        <div className="container">
          <div className={`gift-content ${giftVisible ? 'animate-in' : ''}`}>
            <div className="gift-text">
              <span className="gift-tag">🎁 효도 선물</span>
              <h2 className="gift-title">
                사랑하는 부모님께<br />
                <span className="accent">건강을 선물</span>하세요
              </h2>
              <p className="gift-description">
                "엄마, 아빠 오래오래 건강하세요"<br />
                그 마음을 호관원에 담아 전해드립니다.
              </p>
              <ul className="gift-benefits">
                <li>✓ 정성스러운 선물 포장 무료</li>
                <li>✓ 감사 카드 동봉 가능</li>
                <li>✓ 부모님 댁 직접 배송</li>
              </ul>
              <a href="#consultation" className="btn-gift">
                효도 선물 상담받기
              </a>
            </div>
            <div className="gift-visual">
              <div className="gift-card">
                <div className="gift-emoji">💝</div>
                <p className="gift-message">
                  "건강이 최고의 선물입니다"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 후기 섹션 */}
      <section id="testimonials" className="section testimonials" ref={testimonialsRef}>
        <div className="container">
          <div className={`section-header ${testimonialsVisible ? 'animate-in' : ''}`}>
            <span className="section-tag">생생한 후기</span>
            <h2 className="section-title">
              호관원과 함께<br />
              <span className="title-accent">건강을 되찾으신 분들</span>
            </h2>
            <p className="section-subtitle">
              실제 고객님들의 진솔한 경험담입니다
            </p>
          </div>
          
          <div className={`testimonials-grid ${testimonialsVisible ? 'animate-in' : ''}`}>
            <div className="testimonial-card" style={{ animationDelay: '0.1s' }}>
              <div className="testimonial-header">
                <div className="testimonial-avatar">김</div>
                <div className="testimonial-meta">
                  <div className="testimonial-author">김○순 님</div>
                  <div className="testimonial-info">62세, 주부</div>
                </div>
                <div className="testimonial-rating">★★★★★</div>
              </div>
              <p className="testimonial-text">
                3개월째 복용 중인데 계단 오르내리기가 정말 편해졌어요. 
                <strong>아침에 일어날 때 뻣뻣했던 무릎</strong>이 많이 좋아졌습니다.
                이제 손녀랑 산책도 다닐 수 있어요.
              </p>
              <div className="testimonial-verified">✓ 구매 인증 후기</div>
            </div>
            
            <div className="testimonial-card" style={{ animationDelay: '0.2s' }}>
              <div className="testimonial-header">
                <div className="testimonial-avatar">박</div>
                <div className="testimonial-meta">
                  <div className="testimonial-author">박○철 님</div>
                  <div className="testimonial-info">67세, 은퇴자</div>
                </div>
                <div className="testimonial-rating">★★★★★</div>
              </div>
              <p className="testimonial-text">
                등산을 좋아하는데 무릎 때문에 포기했었어요. 
                아들이 효도 선물로 보내줬는데, <strong>덕분에 다시 산에 다닐 수 있게</strong> 되었습니다!
              </p>
              <div className="testimonial-verified">✓ 구매 인증 후기</div>
            </div>
            
            <div className="testimonial-card" style={{ animationDelay: '0.3s' }}>
              <div className="testimonial-header">
                <div className="testimonial-avatar">이</div>
                <div className="testimonial-meta">
                  <div className="testimonial-author">이○영 님</div>
                  <div className="testimonial-info">45세, 직장인</div>
                </div>
                <div className="testimonial-rating">★★★★★</div>
              </div>
              <p className="testimonial-text">
                <strong>부모님께 효도 선물</strong>로 드렸더니 정말 좋아하세요. 
                어머니께서 "이게 뭐길래 이렇게 좋으냐"고 하시면서 
                매일 꼬박꼬박 드시고 계세요.
              </p>
              <div className="testimonial-verified">✓ 구매 인증 후기</div>
            </div>
          </div>
          
          <div className={`testimonials-more ${testimonialsVisible ? 'animate-in' : ''}`}>
            <p>외 <strong>12,847</strong>건의 만족 후기가 있습니다</p>
          </div>
        </div>
      </section>

      {/* 안심 보장 섹션 */}
      <section className="guarantee-section" ref={guaranteeRef}>
        <div className="container">
          <div className={`guarantee-content ${guaranteeVisible ? 'animate-in' : ''}`}>
            <h3 className="guarantee-title">
              <span className="guarantee-icon">🛡️</span>
              호관원의 <span className="accent">안심 보장</span>
            </h3>
            <div className="guarantee-grid">
              <div className="guarantee-item">
                <div className="guarantee-item-icon">📦</div>
                <h4>무료 배송</h4>
                <p>전국 어디서나<br />무료 배송</p>
              </div>
              <div className="guarantee-item">
                <div className="guarantee-item-icon">🔄</div>
                <h4>100% 환불</h4>
                <p>불만족 시<br />전액 환불 보장</p>
              </div>
              <div className="guarantee-item">
                <div className="guarantee-item-icon">📞</div>
                <h4>평생 상담</h4>
                <p>전문 상담원의<br />친절한 안내</p>
              </div>
              <div className="guarantee-item">
                <div className="guarantee-item-icon">🎁</div>
                <h4>사은품 증정</h4>
                <p>구매 고객<br />특별 사은품</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
