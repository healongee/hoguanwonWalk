import './App.css';

const marketCards = [
  { label: 'KOSPI', value: '2,684.42', change: '+0.84%', tone: 'up' },
  { label: 'KOSDAQ', value: '861.09', change: '-0.21%', tone: 'down' },
  { label: 'NASDAQ', value: '17,981.36', change: '+1.12%', tone: 'up' },
  { label: 'USD/KRW', value: '1,365.20', change: '+3.40', tone: 'neutral' },
];

const news = [
  { tag: '속보', source: 'Market Wire', time: '1분 전', title: '반도체 대형주, 장중 외국인 순매수 확대' },
  { tag: '국내', source: '증권가', time: '8분 전', title: '2차전지 소재주, 수주 기대감에 거래대금 증가' },
  { tag: '외신', source: 'Global Desk', time: '14분 전', title: '미국 장기금리 하락, 성장주 밸류에이션 부담 완화' },
  { tag: '공시', source: 'DART', time: '22분 전', title: '주요 상장사 자사주 취득 결정 공시 잇따라' },
  { tag: '환율', source: 'FX Monitor', time: '31분 전', title: '원달러 환율, 위험선호 회복에도 제한적 상승' },
];

const insights = [
  { category: '수급분석', title: '외국인 순매수 전환 구간에서 강한 업종 찾기', date: '5.30' },
  { category: '리서치', title: 'AI 인프라 투자 사이클과 국내 밸류체인 점검', date: '5.30' },
  { category: '전략', title: '월말 리밸런싱 전후 체크해야 할 지수 레벨', date: '5.29' },
  { category: '종목노트', title: '실적 개선주와 낙폭과대주의 다른 접근법', date: '5.29' },
];

const calendar = [
  { time: '09:00', event: '한국 산업생산 발표', region: 'KR' },
  { time: '11:00', event: '중국 제조업 PMI', region: 'CN' },
  { time: '21:30', event: '미국 PCE 물가지수', region: 'US' },
  { time: '23:00', event: '미시간대 소비심리', region: 'US' },
];

const sectors = [
  { name: '반도체', value: '+2.4', size: 'large', tone: 'hot' },
  { name: '바이오', value: '+1.1', size: 'medium', tone: 'warm' },
  { name: '은행', value: '-0.4', size: 'small', tone: 'cool' },
  { name: '자동차', value: '+0.7', size: 'medium', tone: 'warm' },
  { name: '게임', value: '-1.3', size: 'small', tone: 'cold' },
  { name: '조선', value: '+1.8', size: 'medium', tone: 'hot' },
];

const smartMoney = [
  { label: '외국인', value: '+3,482억', trend: '순매수' },
  { label: '기관', value: '+1,126억', trend: '순매수' },
  { label: '개인', value: '-4,238억', trend: '순매도' },
];

function MiniChart() {
  const points = '0,118 42,104 84,110 126,82 168,88 210,62 252,70 294,38 336,46 378,24 420,30';

  return (
    <div className="chart-panel" aria-label="시장 추세 차트">
      <svg viewBox="0 0 420 140" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f8a6f" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#2f8a6f" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M ${points} L 420,140 L 0,140 Z`} fill="url(#area)" />
        <polyline points={points} fill="none" stroke="#1f7a5f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {[0, 1, 2, 3].map((line) => (
          <line key={line} x1="0" x2="420" y1={24 + line * 30} y2={24 + line * 30} />
        ))}
      </svg>
    </div>
  );
}

function App() {
  return (
    <div className="stock-app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">S</span>
          <span>StockPulse</span>
        </div>
        <nav className="nav-links" aria-label="주요 메뉴">
          <a href="#market">시장</a>
          <a href="#news">뉴스</a>
          <a href="#calendar">일정</a>
          <a href="#insight">인사이트</a>
          <a href="#flow">수급</a>
        </nav>
        <button className="ghost-button" type="button">텔레그램</button>
      </header>

      <main>
        <section className="ticker-strip" aria-label="주요 시세">
          {marketCards.map((item) => (
            <article className="ticker-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <em className={item.tone}>{item.change}</em>
            </article>
          ))}
        </section>

        <section className="dashboard-grid" id="market">
          <article className="market-hero">
            <div className="section-heading">
              <p>시장 한눈에</p>
              <h1>오늘의 흐름은 반도체와 AI 인프라가 주도합니다</h1>
            </div>
            <MiniChart />
            <div className="hero-stats">
              <div>
                <span>시장 온도</span>
                <strong>68</strong>
              </div>
              <div>
                <span>상승 종목</span>
                <strong>1,324</strong>
              </div>
              <div>
                <span>하락 종목</span>
                <strong>892</strong>
              </div>
            </div>
          </article>

          <aside className="context-panel">
            <div className="section-title">
              <h2>시장 컨텍스트</h2>
              <span>장중 업데이트</span>
            </div>
            <ul className="context-list">
              <li><strong>금리</strong><span>미국 10년물 4.41%, 성장주 부담 완화</span></li>
              <li><strong>환율</strong><span>달러 강세 제한, 수출주 영향 중립</span></li>
              <li><strong>원자재</strong><span>유가 반등, 에너지 업종 거래 증가</span></li>
            </ul>
          </aside>
        </section>

        <section className="content-grid">
          <article className="panel news-panel" id="news">
            <div className="section-title">
              <h2>실시간 뉴스</h2>
              <button type="button">전체</button>
            </div>
            <div className="news-list">
              {news.map((item) => (
                <a href="#news" className="news-item" key={item.title}>
                  <span className="news-meta"><b>{item.tag}</b>{item.source} · {item.time}</span>
                  <strong>{item.title}</strong>
                </a>
              ))}
            </div>
          </article>

          <article className="panel" id="insight">
            <div className="section-title">
              <h2>인사이트</h2>
              <button type="button">더 보기</button>
            </div>
            <div className="insight-list">
              {insights.map((item) => (
                <a href="#insight" className="insight-item" key={item.title}>
                  <span>{item.category}</span>
                  <strong>{item.title}</strong>
                  <em>{item.date}</em>
                </a>
              ))}
            </div>
          </article>

          <article className="panel" id="calendar">
            <div className="section-title">
              <h2>오늘 경제일정</h2>
              <button type="button">캘린더</button>
            </div>
            <div className="calendar-list">
              {calendar.map((item) => (
                <div className="calendar-item" key={`${item.time}-${item.event}`}>
                  <time>{item.time}</time>
                  <strong>{item.event}</strong>
                  <span>{item.region}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel heatmap-panel">
            <div className="section-title">
              <h2>섹터 히트맵</h2>
              <button type="button">코스피</button>
            </div>
            <div className="sector-grid">
              {sectors.map((item) => (
                <div className={`sector-tile ${item.size} ${item.tone}`} key={item.name}>
                  <strong>{item.name}</strong>
                  <span>{item.value}%</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="bottom-grid" id="flow">
          <article className="panel">
            <div className="section-title">
              <h2>투자자 동향</h2>
              <span>거래소 기준</span>
            </div>
            <div className="flow-list">
              {smartMoney.map((item) => (
                <div className="flow-item" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <em>{item.trend}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="panel fear-panel">
            <div className="section-title">
              <h2>공포·탐욕 지수</h2>
              <span>중립 상단</span>
            </div>
            <div className="gauge">
              <div className="gauge-track">
                <span style={{ width: '64%' }} />
              </div>
              <strong>64</strong>
              <p>위험선호가 회복됐지만 실적 확인 전까지 변동성 관리가 필요합니다.</p>
            </div>
          </article>
        </section>
      </main>

      <footer className="site-footer">
        <strong>StockPulse</strong>
        <span>투자 정보 제공용 화면이며 매매 추천이 아닙니다.</span>
      </footer>
    </div>
  );
}

export default App;
