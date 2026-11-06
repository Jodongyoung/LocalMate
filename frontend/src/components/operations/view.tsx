'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'

// 인기 메뉴 데이터
const MENU_DATA = {
  cafe: [
    { name: '아메리카노', count: 128 },
    { name: '카페라떼', count: 96 },
    { name: '초코쿠키', count: 84 },
    { name: '허니브레드', count: 72 },
    { name: '에그샌드위치', count: 64 },
  ],
  chicken: [
    { name: '후라이드 치킨', count: 150 },
    { name: '양념 치킨', count: 132 },
    { name: '간장 치킨', count: 110 },
    { name: '치즈볼', count: 95 },
    { name: '순살 파닭', count: 88 },
  ]
}

type ChartData = { time: string; sales: number; hour: number }

// 🎯 초기 마운트 시 깜빡임 방지용 로더 함수
const getInitialStoreId = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('localmate_store_id') || 'cafe'
  }
  return 'cafe'
}

const getInitialChartData = (storeId: string): ChartData[] => {
  if (typeof window !== 'undefined') {
    const savedData = localStorage.getItem(`localmate_chart_${storeId}`)
    if (savedData) {
      try {
        return JSON.parse(savedData)
      } catch (e) {
        return []
      }
    }
  }
  return []
}

export function OperationsView() {
  // 1. 초기 렌더링부터 localStorage의 저장된 지점 정보를 즉시 주입 (깜빡임 차단)
  const [selectedStoreId, setSelectedStoreId] = useState<string>(getInitialStoreId)
  const [chartData, setChartData] = useState<ChartData[]>(() => getInitialChartData(getInitialStoreId()))
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadChartData = (storeId: string) => {
    const savedData = localStorage.getItem(`localmate_chart_${storeId}`)
    if (savedData) {
      try {
        setChartData(JSON.parse(savedData))
      } catch (e) {
        console.error("데이터 파싱 오류", e)
        setChartData([])
      }
    } else {
      setChartData([])
    }
    setUploadStatus('idle')
  }

  useEffect(() => {
    const savedStore = localStorage.getItem('localmate_store_id') || 'cafe'
    setSelectedStoreId(savedStore)
    loadChartData(savedStore)

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        setSelectedStoreId(customEvent.detail)
        loadChartData(customEvent.detail)
      }
    }

    const handleStorage = () => {
      const current = localStorage.getItem('localmate_store_id') || 'cafe'
      setSelectedStoreId(current)
      loadChartData(current)
    }

    window.addEventListener('storeChange', handleSync)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storeChange', handleSync)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setUploadStatus('error')
      setErrorMessage('CSV 파일만 업로드 가능합니다.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const reader = new FileReader()
    
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) return

      try {
        const lines = text.split('\n').filter(line => line.trim() !== '')
        if (lines.length < 2) throw new Error('데이터가 부족합니다.')
        if (!lines[0].includes(',')) throw new Error('올바른 CSV 형식이 아닙니다.')

        const parsedData: ChartData[] = []
        
        for (let i = 1; i < lines.length; i++) {
          const [time, salesStr] = lines[i].split(',')
          const sales = parseInt(salesStr, 10)
          
          if (time && !isNaN(sales)) {
            const hour = parseInt(time.split(':')[0], 10)
            parsedData.push({ time: time.trim(), sales, hour })
          }
        }

        if (parsedData.length === 0) throw new Error('유효한 데이터 행이 없습니다.')

        setChartData(parsedData)
        localStorage.setItem(`localmate_chart_${selectedStoreId}`, JSON.stringify(parsedData))
        
        setUploadStatus('success')
        setTimeout(() => setUploadStatus('idle'), 3000)
      } catch (error: any) {
        console.error(error)
        setUploadStatus('error')
        setErrorMessage(error.message || '파일 처리 중 오류가 발생했습니다.')
      }
      
      if (fileInputRef.current) fileInputRef.current.value = ''
    }

    reader.onerror = () => {
      setUploadStatus('error')
      setErrorMessage('파일 읽기 오류.')
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    if (confirm(`현재 매장의 데이터를 삭제하시겠습니까?`)) {
      localStorage.removeItem(`localmate_chart_${selectedStoreId}`)
      setChartData([])
      setUploadStatus('idle')
    }
  }

  const isCafe = selectedStoreId === 'cafe'
  const currentMenu = isCafe ? MENU_DATA.cafe : MENU_DATA.chicken
  const modeText = isCafe ? '카페 모드' : '치킨 모드'

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
          <p className="text-sm font-bold text-slate-700">{label}</p>
          <p className="text-indigo-600 font-medium">
            매출: {payload[0].value.toLocaleString()}원
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">매장 운영 분석</h1>
        <p className="text-sm text-slate-500 mt-1">매출 및 판매 추이를 확인하세요.</p>
      </div>

      {/* 시간대별 매출 추이 영역 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              시간대별 매출 추이
              {chartData.length > 0 && (
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">데이터 적용됨</span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isCafe ? '12~14시 점심 피크 강조' : '18~21시 저녁 피크 강조'} ({modeText})
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            {chartData.length > 0 && (
              <button 
                onClick={handleClearData}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="size-3" /> 데이터 지우기
              </button>
            )}
            
            {/* 범례(Legend) 영역 */}
            {chartData.length > 0 && (
              <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm bg-[#4f46e5]"></span>
                  <span>집중 피크 시간</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm bg-[#c7d2fe]"></span>
                  <span>일반 운영 시간</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 차트 영역 */}
        {chartData.length > 0 ? (
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => {
                    const isPeak = isCafe 
                      ? (entry.hour >= 12 && entry.hour <= 14) 
                      : (entry.hour >= 18 && entry.hour <= 21)
                    
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={isPeak ? '#4f46e5' : '#c7d2fe'}
                      />
                    )
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 bg-slate-50 rounded-lg flex flex-col items-center justify-center text-sm text-slate-400 border border-slate-100 border-dashed">
            <BarChartIcon className="size-8 mb-2 opacity-50" />
            <p>아래에서 CSV 파일을 업로드하면 차트가 표시됩니다.</p>
          </div>
        )}
      </div>

      {/* 인기 메뉴 TOP 5 영역 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">인기 메뉴 TOP 5</h2>
            <p className="text-xs text-slate-500">판매량 기준 ({modeText})</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="flex justify-between py-2 text-xs font-medium text-slate-400">
            <span>메뉴</span>
            <span>판매량</span>
          </div>
          {currentMenu.map((item, idx) => (
            <div key={idx} className="flex justify-between py-3 text-sm text-slate-700">
              <span className="font-medium flex items-center gap-2">
                <span className="text-xs text-slate-400 font-normal w-3">{idx + 1}</span> 
                {item.name}
              </span>
              <span className="font-bold text-slate-900">{item.count}회</span>
            </div>
          ))}
        </div>
      </div>

      {/* CSV 업로드 영역 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">매출 CSV 업로드</h2>
          <p className="text-xs text-slate-500">
            '시간,매출' 헤더를 가진 CSV 파일을 업로드하여 현재 매장의 데이터를 업데이트합니다.
          </p>
        </div>
        
        <input 
          type="file" 
          accept=".csv" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
        />

        <div 
          onClick={() => fileInputRef.current?.click()}
          className="h-32 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer group"
        >
          <Upload className="size-6 mb-2 group-hover:-translate-y-1 transition-transform" />
          <span className="text-sm font-medium">클릭하여 파일 선택 (.csv)</span>
        </div>

        {uploadStatus === 'success' && (
          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <CheckCircle2 className="size-4" />
            데이터가 성공적으로 적용되었습니다.
          </div>
        )}
        {uploadStatus === 'error' && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
            <AlertCircle className="size-4 shrink-0" />
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  )
}

function BarChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  )
}

export default OperationsView