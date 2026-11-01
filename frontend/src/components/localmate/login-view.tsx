import { useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  Lock,
  Mail,
  MessageSquareText,
  Sparkles,
  Store,
  Zap,
} from 'lucide-react'

const features = [
  { icon: BarChart3, title: '매출 목표 실시간 추적', desc: '일·월 매출과 목표 달성률을 한눈에' },
  { icon: MessageSquareText, title: '배달 리뷰 AI 감성 분석', desc: '불만 키워드와 개선 포인트 자동 추출' },
  { icon: Sparkles, title: 'AI 답글 추천', desc: '상황에 맞는 정중한 답글 초안 생성' },
]

export function LoginView({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.')
      return
    }
    setError('')
    onLogin()
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-4 md:gap-6">
        <section
          aria-labelledby="brand-title"
          className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-8 md:p-10 flex flex-col justify-between min-h-[420px]"
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

        <section
          aria-labelledby="login-title"
          className="rounded-3xl bg-card border shadow-sm p-8 md:p-10 flex flex-col justify-center"
        >
          <h2 id="login-title" className="text-2xl font-bold tracking-tight">
            사장님, 환영합니다
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            LocalMate 계정으로 로그인하고 매장 현황을 확인하세요.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
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
                <button type="button" className="text-xs text-primary hover:underline">
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
              className="h-11 rounded-xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition"
            >
              로그인
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
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
              className="group mt-3 w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              데모 체험용 원클릭 로그인 (게스트)
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              체험용 원클릭 로그인 · 대구 동성로점 샘플 데이터로 시작합니다
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
