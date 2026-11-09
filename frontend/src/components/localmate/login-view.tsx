import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  MessageSquareText,
  Send,
  Sparkles,
  Store,
  User,
  Zap,
} from 'lucide-react'

const features = [
  { icon: BarChart3, title: '매출 목표 실시간 추적', desc: '일·월 매출과 목표 달성률을 한눈에' },
  { icon: MessageSquareText, title: '배달 리뷰 AI 감성 분석', desc: '불만 키워드와 개선 포인트 자동 추출' },
  { icon: Sparkles, title: 'AI 답글 추천', desc: '상황에 맞는 정중한 답글 초안 생성' },
]

export function LoginView({ onLogin }: { onLogin: () => void }) {
  // 모드: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')

  // 로그인 폼 상태
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // 신규 사장님 매장 등록 폼 상태
  const [ownerName, setOwnerName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [category, setCategory] = useState('cafe')
  const [storeAddress, setStoreAddress] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  // 비밀번호 찾기 폼 상태
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOwnerName, setForgotOwnerName] = useState('')

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.')
      return
    }
    setError('')
    onLogin()
  }

  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      localStorage.setItem('localmate_store_id', category === 'chicken' ? 'chicken' : 'cafe')
    }
    onLogin()
  }

  function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault()
    // 임시 비밀번호 발급 피드백 후 바로 대시보드 로그인 진입
    alert('등록된 사장님 이메일로 임시 비밀번호를 발송했습니다. 대시보드로 즉시 자동 접속합니다.')
    onLogin()
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-4 md:gap-6">
        
        {/* 1. 좌측 브랜딩 섹션 */}
        <section
          aria-labelledby="brand-title"
          className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-8 md:p-10 flex flex-col justify-between min-h-[480px]"
        >
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 size-72 rounded-full bg-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-16 size-80 rounded-full bg-white/5"
          />
          <div className="relative">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl bg-white text-primary flex items-center justify-center">
                <Store className="size-5" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold tracking-tight">LocalMate</span>
            </div>
            <h1 id="brand-title" className="mt-10 text-3xl md:text-4xl font-bold leading-tight text-balance">
              소상공인을 위한
              <br />
              스마트 AI 매장 비서
            </h1>
            <p className="mt-4 text-primary-foreground/80 leading-relaxed text-pretty">
              배달앱 리뷰, 매출, 고객 응대까지. 사장님은 요리에만 집중하세요. 나머지는 LocalMate가 챙겨드릴게요.
            </p>
          </div>

          <ul className="relative mt-10 flex flex-col gap-3">
            {features.map((f) => (
              <li
                key={f.title}
                className="flex items-start gap-3 rounded-2xl bg-white/10 backdrop-blur-sm p-4"
              >
                <f.icon className="size-5 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-xs text-primary-foreground/75 mt-0.5">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 2. 우측 입력 폼 섹션 (로그인 / 신규 등록 / 비밀번호 찾기) */}
        <section
          aria-labelledby="form-title"
          className="rounded-3xl bg-card border shadow-sm p-8 md:p-10 flex flex-col justify-between"
        >
          <div>
            {/* 상단 헤더 & 탭 스위처 */}
            <div className="flex items-start justify-between gap-2 border-b pb-4 mb-6">
              <div>
                <h2 id="form-title" className="text-2xl font-bold tracking-tight">
                  {mode === 'login' && '사장님, 환영합니다'}
                  {mode === 'register' && '신규 사장님 매장 등록'}
                  {mode === 'forgot' && '비밀번호 재설정'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mode === 'login' && 'LocalMate 계정으로 로그인하고 매장 현황을 확인하세요.'}
                  {mode === 'register' && '매장 기본 정보를 입력하고 스마트 AI 비서를 바로 시작하세요.'}
                  {mode === 'forgot' && '가입하신 사업자 이메일과 대표자명을 입력해 주세요.'}
                </p>
              </div>

              {/* 비밀번호 찾기 모드가 아닐 때만 탭 표시 */}
              {mode !== 'forgot' ? (
                <div className="flex rounded-xl bg-secondary p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login')
                      setError('')
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      mode === 'login'
                        ? 'bg-card text-foreground shadow-xs font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    로그인
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register')
                      setError('')
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      mode === 'register'
                        ? 'bg-card text-foreground shadow-xs font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    신규 등록
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError('')
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition py-1 px-2 rounded-lg hover:bg-secondary shrink-0"
                >
                  <ArrowLeft className="size-3.5" /> 로그인으로
                </button>
              )}
            </div>

            {/* A. 로그인 모드 폼 */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium">
                    이메일
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="owner@localmate.kr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 rounded-xl border bg-background pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium">
                      비밀번호
                    </label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setMode('forgot')
                        setError('')
                      }}
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      비밀번호 찾기
                    </button>
                  </div>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 rounded-xl border bg-background pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary transition"
                    />
                  </div>
                </div>

                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="h-11 rounded-xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition mt-1"
                >
                  로그인
                </button>
              </form>
            )}

            {/* B. 사장님 최초 가입 등록 폼 */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-foreground">대표자 성함</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="예: 홍길동"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full h-10 rounded-xl border bg-background pl-9 pr-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary transition"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-foreground">매장 상호명</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="예: 동성로 카페 본점"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full h-10 rounded-xl border bg-background pl-9 pr-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-foreground">업종 분류</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 rounded-xl border bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary transition font-medium"
                    >
                      <option value="cafe">☕ 카페 · 디저트</option>
                      <option value="chicken">🍗 치킨 · 호프 · 펍</option>
                      <option value="restaurant">🍚 한식 · 일반음식점</option>
                      <option value="snack">🍕 피자 · 패스트푸드</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-foreground">매장 소재지</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="예: 대구 중구 동성로"
                        value={storeAddress}
                        onChange={(e) => setStoreAddress(e.target.value)}
                        className="w-full h-10 rounded-xl border bg-background pl-9 pr-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-foreground">사업자 이메일</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="owner@store.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full h-10 rounded-xl border bg-background pl-9 pr-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary transition"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-foreground">비밀번호 설정</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <input
                        type="password"
                        placeholder="영문, 숫자 6자 이상"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full h-10 rounded-xl border bg-background pl-9 pr-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary transition"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition mt-2 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="size-4" />
                  사장님 등록 완료 및 대시보드 시작
                </button>
              </form>
            )}

            {/* C. 비밀번호 찾기 모드 폼 */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="flex flex-col gap-3.5 animate-in fade-in duration-200">
                <div className="p-3.5 rounded-2xl bg-secondary/80 border text-xs text-muted-foreground leading-relaxed">
                  💡 사업자 등록 정보로 등록된 <strong>대표자 성함</strong>과 <strong>가입 이메일</strong>을 입력하시면 본인 인증 후 임시 비밀번호를 발급해 드립니다.
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="forgot-owner" className="text-sm font-medium">
                    대표자 성함
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      id="forgot-owner"
                      type="text"
                      placeholder="예: 홍길동"
                      value={forgotOwnerName}
                      onChange={(e) => setForgotOwnerName(e.target.value)}
                      className="w-full h-11 rounded-xl border bg-background pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="forgot-email" className="text-sm font-medium">
                    가입한 사업자 이메일
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="owner@localmate.kr"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full h-11 rounded-xl border bg-background pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    type="submit"
                    className="h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Send className="size-4" />
                    임시 비밀번호 발송 및 로그인
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="h-10 rounded-xl border bg-background text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition flex items-center justify-center gap-1"
                  >
                    로그인으로 돌아가기
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 3. 하단 게스트 체험 버튼 */}
          <div className="mt-6">
            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              또는
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="rounded-2xl border-2 border-primary/20 bg-secondary p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-secondary-foreground">
                <Zap className="size-3.5" aria-hidden="true" />
                가입 없이 바로 체험해 보세요
              </div>
              <button
                type="button"
                onClick={onLogin}
                className="group mt-3 w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="size-4" aria-hidden="true" />
                데모 체험용 원클릭 로그인 (게스트)
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                체험용 원클릭 로그인 · 대구 동성로점 샘플 데이터로 시작합니다
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}

export default LoginView