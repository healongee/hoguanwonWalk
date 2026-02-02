import './App.css';
import { useState } from 'react';

function ConsultationForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    sex: '',
    remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      alert('이름과 연락처는 필수 입력 항목입니다.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:3001/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmitResult('success');
        setFormData({ name: '', phone: '', age: '', sex: '', remarks: '' });
      } else {
        setSubmitResult('error');
      }
    } catch (error) {
      setSubmitResult('error');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="consultation-form-container">
      <h2>무료 상담 신청</h2>
      <p className="form-subtitle">전문 상담사가 친절하게 안내해 드립니다</p>
      
      {submitResult === 'success' ? (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h3>상담 신청이 완료되었습니다!</h3>
          <p>빠른 시일 내에 연락드리겠습니다.</p>
          <button className="btn-reset" onClick={() => setSubmitResult(null)}>
            추가 신청하기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>이름 <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름을 입력하세요"
              required
            />
          </div>
          
          <div className="form-group">
            <label>연락처 <span className="required">*</span></label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label>나이</label>
              <select name="age" value={formData.age} onChange={handleChange}>
                <option value="">선택</option>
                <option value="20대">20대</option>
                <option value="30대">30대</option>
                <option value="40대">40대</option>
                <option value="50대">50대</option>
                <option value="60대">60대</option>
                <option value="70대 이상">70대 이상</option>
              </select>
            </div>
            
            <div className="form-group half">
              <label>성별</label>
              <select name="sex" value={formData.sex} onChange={handleChange}>
                <option value="">선택</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>상담 내용</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="궁금하신 점이나 상담받고 싶은 내용을 적어주세요"
              rows="4"
            />
          </div>
          
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? '신청 중...' : '무료 상담 신청하기'}
          </button>
          
          <p className="privacy-notice">
            * 개인정보는 상담 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
          </p>
        </form>
      )}
    </div>
  );
}

function App() {
  return (
    <div className="landing-page">
      {/* 헤더 */}
      <header className="header">
        <div className="container">
          <div className="logo">호관원</div>
          <nav className="nav">
            <a href="#benefits">효능</a>
            <a href="#ingredients">성분</a>
            <a href="#consultation">상담신청</a>
          </nav>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">관절 건강의 새로운 시작</span>
          <h1>호관원 프리미엄</h1>
          <p className="hero-subtitle">
            30년 전통의 비법으로 만든<br />
            <strong>프리미엄 관절 건강 식품</strong>
          </p>
          <div className="hero-features">
            <span>✓ 식약처 인증</span>
            <span>✓ 100% 국내산 원료</span>
            <span>✓ GMP 인증 시설</span>
          </div>
          <a href="#consultation" className="btn-cta">무료 상담 받기</a>
        </div>
      </section>

      {/* 신뢰 배지 */}
      <section className="trust-badges">
        <div className="container">
          <div className="badge-item">
            <div className="badge-number">500만+</div>
            <div className="badge-text">누적 판매</div>
          </div>
          <div className="badge-item">
            <div className="badge-number">98%</div>
            <div className="badge-text">고객 만족도</div>
          </div>
          <div className="badge-item">
            <div className="badge-number">30년</div>
            <div className="badge-text">전통 비법</div>
          </div>
          <div className="badge-item">
            <div className="badge-number">1위</div>
            <div className="badge-text">관절 건강식품</div>
          </div>
        </div>
      </section>

      {/* 효능 섹션 */}
      <section id="benefits" className="benefits">
        <div className="container">
          <h2 className="section-title">호관원의 효능</h2>
          <p className="section-subtitle">과학적으로 입증된 관절 건강 솔루션</p>
          
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🦴</div>
              <h3>연골 보호</h3>
              <p>관절 연골의 손상을 예방하고 건강한 연골 유지에 도움을 줍니다.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💪</div>
              <h3>관절 유연성</h3>
              <p>굳어진 관절을 부드럽게 하여 일상 활동이 편안해집니다.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🏃</div>
              <h3>활동성 증가</h3>
              <p>관절 불편함을 줄여 더 활기찬 일상을 누릴 수 있습니다.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🌿</div>
              <h3>천연 성분</h3>
              <p>부작용 없는 천연 원료로 안심하고 섭취할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 성분 섹션 */}
      <section id="ingredients" className="ingredients">
        <div className="container">
          <h2 className="section-title">엄선된 프리미엄 성분</h2>
          <p className="section-subtitle">최고 품질의 원료만을 사용합니다</p>
          
          <div className="ingredients-list">
            <div className="ingredient-item">
              <div className="ingredient-name">녹용</div>
              <div className="ingredient-desc">관절 건강과 원기 회복에 탁월</div>
            </div>
            <div className="ingredient-item">
              <div className="ingredient-name">홍삼</div>
              <div className="ingredient-desc">면역력 강화 및 피로 회복</div>
            </div>
            <div className="ingredient-item">
              <div className="ingredient-name">우슬</div>
              <div className="ingredient-desc">뼈와 관절 건강 증진</div>
            </div>
            <div className="ingredient-item">
              <div className="ingredient-name">당귀</div>
              <div className="ingredient-desc">혈액 순환 개선</div>
            </div>
          </div>
        </div>
      </section>

      {/* 후기 섹션 */}
      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">고객 후기</h2>
          <p className="section-subtitle">실제 고객님들의 생생한 경험담</p>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">
                "3개월째 복용 중인데 계단 오르내리기가 정말 편해졌어요. 
                아침에 일어날 때 뻣뻣했던 무릎이 많이 좋아졌습니다."
              </p>
              <div className="testimonial-author">김○순 (62세, 여성)</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">
                "등산을 좋아하는데 무릎 때문에 포기했었어요. 
                호관원 덕분에 다시 산에 다닐 수 있게 되었습니다!"
              </p>
              <div className="testimonial-author">박○철 (58세, 남성)</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">
                "여러 제품 써봤는데 호관원이 제일 효과가 좋았어요. 
                부모님께도 선물했더니 정말 좋아하세요."
              </p>
              <div className="testimonial-author">이○영 (45세, 여성)</div>
            </div>
          </div>
        </div>
      </section>

      {/* 상담 신청 섹션 */}
      <section id="consultation" className="consultation">
        <div className="container">
          <ConsultationForm />
        </div>
      </section>

      {/* 푸터 */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">호관원</div>
            <div className="footer-info">
              <p>상담 전화: 1588-0000</p>
              <p>운영 시간: 평일 09:00 - 18:00</p>
              <p>주소: 서울특별시 강남구 테헤란로 123</p>
            </div>
            <div className="footer-links">
              <a href="#benefits">이용약관</a>
              <a href="#benefits">개인정보처리방침</a>
            </div>
          </div>
          <div className="footer-copyright">
            © 2024 호관원. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
