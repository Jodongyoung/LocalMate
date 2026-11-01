import { CalendarDays, Gift, MessageCircleWarning, TrendingUp, Wallet } from 'lucide-react'
import { formatKRW, kpis } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function KpiCards({ unansweredCount }: { unansweredCount: number }) {
  const items = [
    {
      label: '오늘 매출',
      value: formatKRW(kpis.todaySales),
      sub: `어제 대비 +${kpis.todayDelta}%`,
      icon: Wallet,
      positive: true,
    },
    {
      label: '이번 달 누적 매출',
      value: formatKRW(kpis.monthlySales),
      sub: `전월 동기 대비 +${kpis.monthlyDelta}%`,
      icon: CalendarDays,
      positive: true,
    },
    {
      label: '배민 리뷰 이벤트 참여',
      value: `${kpis.reviewEventCount}건`,
      sub: `이번 주 +${kpis.reviewEventDelta}건`,
      icon: Gift,
      positive: true,
    },
    {
      label: '미답변 리뷰',
      value: `${unansweredCount}건`,
      sub: unansweredCount > 0 ? '24시간 내 답변 권장' : '모든 리뷰에 답변 완료',
      icon: MessageCircleWarning,
      positive: unansweredCount === 0,
      alert: unansweredCount > 0,
    },
  ]

  return (
    <section aria-label="주요 지표" className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            'rounded-2xl border bg-card p-4 md:p-5 shadow-sm transition hover:shadow-md',
            item.alert && 'border-destructive/30'
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs md:text-sm text-muted-foreground font-medium">{item.label}</p>
            <div
              className={cn(
                'size-8 rounded-lg flex items-center justify-center shrink-0',
                item.alert ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
            </div>
          </div>
          <p className="mt-3 text-lg md:text-2xl font-bold tracking-tight tabular-nums">{item.value}</p>
          <p
            className={cn(
              'mt-1 text-xs flex items-center gap-1',
              item.alert ? 'text-destructive' : 'text-success'
            )}
          >
            {item.positive && !item.alert && <TrendingUp className="size-3" aria-hidden="true" />}
            {item.sub}
          </p>
        </div>
      ))}
    </section>
  )
}
