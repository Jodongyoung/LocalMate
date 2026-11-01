import { salesTarget } from '@/lib/mock-data'
import { formatKRW } from '@/lib/utils'

export function SalesTargetCard() {
  const progress = Math.min(100, (salesTarget.current / salesTarget.goal) * 100)
  
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">11월 매출 목표</h2>
          <p className="text-xs text-muted-foreground mt-0.5">목표 금액: {formatKRW(salesTarget.goal)}</p>
        </div>
        <p className="text-xl font-bold text-primary tabular-nums">{Math.round(progress)}%</p>
      </div>
      
      <div className="mt-4">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="mt-3 flex justify-between text-sm">
        <span className="text-muted-foreground">현재: {formatKRW(salesTarget.current)}</span>
        <span className="font-medium">목표 달성까지 {formatKRW(salesTarget.goal - salesTarget.current)} 남음</span>
      </div>
    </div>
  )
}