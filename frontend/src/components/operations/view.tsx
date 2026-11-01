import { useState } from 'react'
import { SalesTargetCard } from './sales-target-card'
import { KpiCards } from './kpi-cards'
import { SentimentChart } from './sentiment-chart'

export function OperationsView() {
  const [businessType, setBusinessType] = useState<'CAFE' | 'SALON'>('CAFE')

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 flex flex-col gap-6 pb-28">
        {/* 매장 전환 상태에 따른 화면 분기 */}
        {businessType === 'CAFE' ? (
          // 카페 모드 화면
          <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="font-semibold">시간대별 매출 추이</h2>
              <p className="text-xs text-muted-foreground mt-0.5">12~14시 점심 피크 강조</p>
              <div className="mt-4 h-64 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground">시간대별 매출 추이 차트 (카페 모드)</p>
              </div>
            </div>
            
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="font-semibold">인기 메뉴 TOP 5</h2>
              <p className="text-xs text-muted-foreground mt-0.5">판매량 기준</p>
              <div className="mt-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">메뉴</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">판매량</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 text-sm">아메리카노</td>
                      <td className="text-right py-3 text-sm">128회</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm">카페라떼</td>
                      <td className="text-right py-3 text-sm">96회</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm">초코쿠키</td>
                      <td className="text-right py-3 text-sm">84회</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm">브레드</td>
                      <td className="text-right py-3 text-sm">72회</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm">샌드위치</td>
                      <td className="text-right py-3 text-sm">64회</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="font-semibold">매출 CSV 업로드</h2>
              <p className="text-xs text-muted-foreground mt-0.5">CSV 파일을 업로드하여 매출 데이터를 업데이트하세요</p>
              <div className="mt-4 flex items-center justify-center h-32 border-2 border-dashed border-muted rounded-lg">
                <div className="text-center">
                  <Upload className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">CSV 파일을 여기에 드래그 앤 드롭하거나 클릭하여 업로드</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 미용실 모드 화면
          <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="font-semibold">요일/시간대별 예약 건수</h2>
              <p className="text-xs text-muted-foreground mt-0.5">예약 히트맵</p>
              <div className="mt-4 h-64 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground">요일/시간대별 예약 건수 히트맵 (미용실 모드)</p>
              </div>
            </div>
            
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="font-semibold">시술별 예약 비율</h2>
              <p className="text-xs text-muted-foreground mt-0.5">커트/펌/염색별 예약 비율</p>
              <div className="mt-4 h-64 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground">시술별 예약 비율 차트 (미용실 모드)</p>
              </div>
            </div>
            
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="font-semibold">예약 CSV 업로드</h2>
              <p className="text-xs text-muted-foreground mt-0.5">CSV 파일을 업로드하여 예약 데이터를 업데이트하세요</p>
              <div className="mt-4 flex items-center justify-center h-32 border-2 border-dashed border-muted rounded-lg">
                <div className="text-center">
                  <Upload className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">CSV 파일을 여기에 드래그 앤 드롭하거나 클릭하여 업로드</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// 임시로 업로드 아이콘을 가져오기 위해 추가
import { Upload } from 'lucide-react'