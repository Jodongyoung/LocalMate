'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  ShieldAlert, 
  PackageX, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  AlertTriangle, 
  Boxes, 
  RotateCcw, 
  Sparkles, 
  ExternalLink, 
  Settings2, 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  FileSpreadsheet, 
  CheckSquare, 
  Square
} from 'lucide-react'

export interface MenuItem {
  name: string
  category: string
  initial: number
  unit: string
  packageDesc?: string
}

export interface StockItem {
  id: string
  name: string
  category: string
  isLimited: boolean // 사장님이 직접 지정
  initial: number
  current: number
  perOrder: number
  unit: string
  packageDesc?: string
}

export interface OperationalTask {
  id: string
  category: 'stock' | 'delay' | 'promo'
  title: string
  badge: string
  badgeColor: string
  triggerReason: string
  actionDetail: string
  platformTarget: string
  status: 'pending' | 'approved' | 'rejected'
  timestamp: string
}

// 🎯 1. 매장별 전체 메뉴판 마스터 풀
const STORE_MENU_POOLS: Record<string, MenuItem[]> = {
  cafe: [
    { name: '아메리카노 (ICE)', category: '커피및음료', initial: 80, unit: '잔' },
    { name: '카페라떼', category: '커피및음료', initial: 50, unit: '잔' },
    { name: '바닐라빈 라떼', category: '커피및음료', initial: 35, unit: '잔' },
    { name: '얼그레이 레몬티', category: '커피및음료', initial: 25, unit: '잔' },
    { name: '디카페인 콜드브루', category: '커피및음료', initial: 30, unit: '잔' },
    { name: '생딸기 조각케이크', category: '디저트', initial: 15, unit: '조각', packageDesc: '1조각' },
    { name: '수제 에그타르트', category: '디저트', initial: 24, unit: '세트', packageDesc: '2개입' },
    { name: '플레인 크로플', category: '디저트', initial: 20, unit: '개', packageDesc: '1개입' },
    { name: '초코 퍼지 브라우니', category: '디저트', initial: 18, unit: '개', packageDesc: '1개입' },
    { name: '콜드브루 원액 보틀 (500ml)', category: '원두및MD', initial: 12, unit: '병', packageDesc: '500ml' },
    { name: '시그니처 블렌드 원두 (200g)', category: '원두및MD', initial: 15, unit: '팩', packageDesc: '200g' }
  ],
  chicken: [
    { name: '황금 후라이드 치킨', category: '메인메뉴', initial: 45, unit: '마리' },
    { name: '매콤달콤 양념 치킨', category: '메인메뉴', initial: 35, unit: '마리' },
    { name: '단짠 간장 골드 치킨', category: '메인메뉴', initial: 30, unit: '마리' },
    { name: '스모크 고추 바사삭 치킨', category: '메인메뉴', initial: 25, unit: '마리' },
    { name: '바삭 순살 파닭', category: '메인메뉴', initial: 20, unit: '마리' },
    { name: '통다리 바베큐 구이', category: '메인메뉴', initial: 15, unit: '세트' },
    { name: '특제 모짜렐라 치즈볼', category: '사이드메뉴', initial: 25, unit: '세트', packageDesc: '5개입' },
    { name: '수제 바베큐 윙봉', category: '사이드메뉴', initial: 20, unit: '세트', packageDesc: '6조각' },
    { name: '케이준 감자튀김', category: '사이드메뉴', initial: 35, unit: '봉지', packageDesc: '1봉(200g)' },
    { name: '트러플 특제 디핑소스', category: '사이드메뉴', initial: 30, unit: '개', packageDesc: '40g' },
    { name: '달콤 양념 소스 추가', category: '사이드메뉴', initial: 40, unit: '개', packageDesc: '50g' },
    { name: '바삭 치즈스틱', category: '사이드메뉴', initial: 20, unit: '세트', packageDesc: '3개입' },
    { name: '코카콜라 1.25L', category: '음료및주류', initial: 40, unit: '병', packageDesc: '1병' },
    { name: '코카콜라 500ml', category: '음료및주류', initial: 50, unit: '캔', packageDesc: '1캔' }
  ]
}

// 🎯 2. 매장별 기본 트래커 초기 품목 (현실적인 오픈 준비 수량)
const STORE_DEFAULT_STOCKS: Record<string, StockItem[]> = {
  cafe: [
    { id: 'cafe-1', name: '아메리카노 (ICE)', category: '커피및음료', isLimited: false, initial: 80, current: 80, perOrder: 1, unit: '잔' },
    { id: 'cafe-2', name: '카페라떼', category: '커피및음료', isLimited: false, initial: 50, current: 50, perOrder: 1, unit: '잔' },
    { id: 'cafe-3', name: '생딸기 조각케이크', category: '디저트', isLimited: true, initial: 15, current: 15, perOrder: 1, unit: '조각', packageDesc: '1조각' },
    { id: 'cafe-4', name: '수제 에그타르트', category: '디저트', isLimited: true, initial: 24, current: 24, perOrder: 1, unit: '세트', packageDesc: '2개입' },
    { id: 'cafe-5', name: '콜드브루 원액 보틀 (500ml)', category: '원두및MD', isLimited: false, initial: 12, current: 12, perOrder: 1, unit: '병', packageDesc: '500ml' }
  ],
  chicken: [
    { id: 'chk-1', name: '황금 후라이드 치킨', category: '메인메뉴', isLimited: false, initial: 45, current: 45, perOrder: 1, unit: '마리' },
    { id: 'chk-2', name: '매콤달콤 양념 치킨', category: '메인메뉴', isLimited: false, initial: 35, current: 35, perOrder: 1, unit: '마리' },
    { id: 'chk-3', name: '특제 모짜렐라 치즈볼', category: '사이드메뉴', isLimited: true, initial: 25, current: 25, perOrder: 1, unit: '세트', packageDesc: '5개입' },
    { id: 'chk-4', name: '수제 바베큐 윙봉', category: '사이드메뉴', isLimited: true, initial: 20, current: 20, perOrder: 1, unit: '세트', packageDesc: '6조각' },
    { id: 'chk-5', name: '트러플 특제 디핑소스', category: '사이드메뉴', isLimited: false, initial: 30, current: 30, perOrder: 1, unit: '개', packageDesc: '40g' }
  ]
}

// 🎯 3. 매장별 실전 AI 결재 제안 카드
const STORE_DEFAULT_PROPOSALS: Record<string, OperationalTask[]> = {
  cafe: [
    {
      id: 'task-cafe-delay',
      category: 'delay',
      title: '점심 피크타임 테이크아웃 대기 지연 방어',
      badge: '대기 방어 78%',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      triggerReason: '오피스 상권 12:30 주문 집중 감지 (예상 픽업 대기 시간 18분 초과로 인한 불만 위험)',
      actionDetail: '배민오더 예상 픽업 대기 시간 +10분 연장 및 시간 소요가 큰 핸드드립 메뉴 일시 마감',
      platformTarget: '배달의민족 / 쿠팡이츠 포장·매장 설정',
      status: 'pending',
      timestamp: '방금 전'
    },
    {
      id: 'task-cafe-promo',
      category: 'promo',
      title: '비수기 유휴 시간 디저트 페어링 타임세일',
      badge: '회전율 부스팅',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      triggerReason: '14:00~16:30 주문 공백기 발생 (오후 나른한 시간대 유휴 좌석률 65% 저조)',
      actionDetail: '16:30까지 [아메리카노 + 조각케이크] 포장 세트 1,500원 깜짝 할인 쿠폰 배너 노출',
      platformTarget: '배달앱 포장 할인 쿠폰 자동 발행',
      status: 'pending',
      timestamp: '10분 전'
    }
  ],
  chicken: [
    {
      id: 'task-chk-delay',
      category: 'delay',
      title: '우천 피크타임 배달 지연 선제 방어',
      badge: '위기 방어 85%',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      triggerReason: '강수 확률 85% 악천후 + 19시 피크타임 배차 지연 감지 (30분 내 지연 불만율 급증 예측)',
      actionDetail: '배달앱 기본 조리 대기 시간 +15분 연장 및 배달 권역 1.5km 일시 조정',
      platformTarget: '쿠팡이츠 / 배달의민족 매장 설정',
      status: 'pending',
      timestamp: '방금 전'
    },
    {
      id: 'task-chk-promo',
      category: 'promo',
      title: '비수기 유휴 시간대 포장 타임세일 부스팅',
      badge: '매출 부스팅',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      triggerReason: '14:00~17:00 주문 공백기 발생 (전주 대비 유휴 회전율 32% 저조)',
      actionDetail: '17:00까지 배민 포장 주문 2,000원 깜짝 할인 쿠폰 배너 노출',
      platformTarget: '배민 포장 쿠폰 자동 발행',
      status: 'pending',
      timestamp: '15분 전'
    }
  ]
}

export function TasksView() {
  const [selectedStoreId, setSelectedStoreId] = useState('cafe')
  const [menuPool, setMenuPool] = useState<MenuItem[]>([])
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [proposals, setProposals] = useState<OperationalTask[]>([])
  const [isEditingStock, setIsEditingStock] = useState(false)
  const [editList, setEditList] = useState<StockItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. 매장별 독립 데이터 로드 함수
  const loadStoreData = (storeId: string) => {
    const isCafe = storeId === 'cafe'
    const defaultPool = isCafe ? STORE_MENU_POOLS.cafe : STORE_MENU_POOLS.chicken
    const defaultStock = isCafe ? STORE_DEFAULT_STOCKS.cafe : STORE_DEFAULT_STOCKS.chicken
    const defaultProposals = isCafe ? STORE_DEFAULT_PROPOSALS.cafe : STORE_DEFAULT_PROPOSALS.chicken

    // 메뉴 풀 로드
    const savedPool = localStorage.getItem(`localmate_menupool_v5_${storeId}`)
    if (savedPool) {
      try {
        setMenuPool(JSON.parse(savedPool))
      } catch (e) {
        setMenuPool(defaultPool)
      }
    } else {
      setMenuPool(defaultPool)
    }

    // 트래커 품목 로드 (이전 치킨 데이터가 카페에 섞이지 않도록 엄격 검증)
    const savedStock = localStorage.getItem(`localmate_stock_v5_${storeId}`)
    if (savedStock) {
      try {
        const parsed = JSON.parse(savedStock) as StockItem[]
        // 카페인데 치킨 메뉴가 들어있으면 기본 카페 데이터로 리셋
        if (isCafe && parsed.some(p => p.name.includes('치킨'))) {
          setStockItems(defaultStock)
          localStorage.setItem(`localmate_stock_v5_${storeId}`, JSON.stringify(defaultStock))
        } else if (!isCafe && parsed.some(p => p.name.includes('아메리카노') || p.name.includes('케이크'))) {
          setStockItems(defaultStock)
          localStorage.setItem(`localmate_stock_v5_${storeId}`, JSON.stringify(defaultStock))
        } else {
          setStockItems(parsed)
        }
      } catch (e) {
        setStockItems(defaultStock)
      }
    } else {
      setStockItems(defaultStock)
    }

    // 결재 제안 카드 로드
    const savedProposals = localStorage.getItem(`localmate_proposals_v5_${storeId}`)
    if (savedProposals) {
      try {
        setProposals(JSON.parse(savedProposals))
      } catch (e) {
        setProposals(defaultProposals)
      }
    } else {
      setProposals(defaultProposals)
    }
  }

  useEffect(() => {
    const savedStore = localStorage.getItem('localmate_store_id') || 'cafe'
    setSelectedStoreId(savedStore)
    loadStoreData(savedStore)

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        const newStoreId = customEvent.detail
        setSelectedStoreId(newStoreId)
        loadStoreData(newStoreId)
        setIsEditingStock(false)
      }
    }
    window.addEventListener('storeChange', handleSync)
    return () => window.removeEventListener('storeChange', handleSync)
  }, [])

  // 2. localStorage 저장 및 사이드바 뱃지 동기화
  const syncAndSave = (newProposals: OperationalTask[], newStock?: StockItem[], newPool?: MenuItem[]) => {
    setProposals(newProposals)
    localStorage.setItem(`localmate_proposals_v5_${selectedStoreId}`, JSON.stringify(newProposals))

    if (newStock) {
      setStockItems(newStock)
      localStorage.setItem(`localmate_stock_v5_${selectedStoreId}`, JSON.stringify(newStock))
    }

    if (newPool) {
      setMenuPool(newPool)
      localStorage.setItem(`localmate_menupool_v5_${selectedStoreId}`, JSON.stringify(newPool))
    }

    const pendingCount = newProposals.filter(p => p.status === 'pending').length
    localStorage.setItem('localmate_pending_tasks_count', pendingCount.toString())
    window.dispatchEvent(new CustomEvent('pendingTasksUpdated', { detail: pendingCount }))
  }

  // 3. 주문 유입 시뮬레이션
  const handleOrderDeduct = (item: StockItem) => {
    if (item.current <= 0) return

    const nextCurrent = Math.max(0, item.current - item.perOrder)
    const updatedStock = stockItems.map(s => s.id === item.id ? { ...s, current: nextCurrent } : s)
    let updatedProposals = [...proposals]

    const threshold = item.perOrder * 2
    // 🎯 소진 임박: 배달앱 품절 승인 카드
    if (nextCurrent > 0 && nextCurrent <= threshold) {
      const warningTaskId = `task-stock-warning-${item.id}`
      if (!updatedProposals.some(p => p.id === warningTaskId && p.status === 'pending')) {
        const warningTask: OperationalTask = {
          id: warningTaskId,
          category: 'stock',
          title: `[소진 임박] '${item.name}' ${nextCurrent}${item.unit} 잔여`,
          badge: item.isLimited ? '한정 품목 임박' : '재고 소진 임박',
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
          triggerReason: `주문 집중으로 잔여량(${nextCurrent}${item.unit})이 임계치에 도달했습니다. 추가 주문 접수 시 배달앱 취소 및 평점 하락 위험이 있습니다.`,
          actionDetail: `배달앱(배민/쿠팡이츠) 메뉴 목록에서 '${item.name}' 상태를 즉시 '일시 품절'로 선제 전환`,
          platformTarget: '배달 플랫폼 메뉴 관리',
          status: 'pending',
          timestamp: '방금 발생'
        }
        updatedProposals = [warningTask, ...updatedProposals]
      }
    }

    // 🎯 0개 완전 소진: 품절 확정 및 매출 부스팅 카드 교체
    if (nextCurrent === 0) {
      const zeroTaskId = `task-stock-zero-${item.id}`
      updatedProposals = updatedProposals.filter(p => p.id !== `task-stock-warning-${item.id}`)

      if (!updatedProposals.some(p => p.id === zeroTaskId)) {
        const isCafe = selectedStoreId === 'cafe'
        const altPromo = isCafe ? '수제 에그타르트 세트 타임세일' : '대체 사이드 메뉴 타임세일'
        
        const zeroTask: OperationalTask = {
          id: zeroTaskId,
          category: 'promo',
          title: `[완전 품절] '${item.name}' 0개 소진 ➔ 타임세일 부스팅 전환`,
          badge: '완전 품절 대응',
          badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
          triggerReason: `'${item.name}' 당일 준비 재고가 0개로 소진되었습니다. 주문 고객 이탈을 방어하기 위해 대체 메뉴 프로모션으로 전환합니다.`,
          actionDetail: `배달앱 품절 확정 처리 및 ${altPromo} 깜짝 할인 배너 노출`,
          platformTarget: '배달앱 메뉴 품절 및 프로모션 배너',
          status: 'pending',
          timestamp: '방금 발생'
        }
        updatedProposals = [zeroTask, ...updatedProposals]
      }
    }

    syncAndSave(updatedProposals, updatedStock)
  }

  // 4. 수량 및 메뉴 직접 설정 모드 열기
  const handleOpenEdit = () => {
    setEditList(JSON.parse(JSON.stringify(stockItems)))
    setIsEditingStock(true)
  }

  // 5. 항목 추가 (최대 5개)
  const handleAddItem = () => {
    if (editList.length >= 5) {
      alert('관리 메뉴는 최대 5개까지 동시 등록 가능합니다.')
      return
    }

    const usedNames = editList.map(e => e.name)
    const available = menuPool.find(m => !usedNames.includes(m.name)) || menuPool[0]

    const newItem: StockItem = {
      id: `item-${Date.now()}`,
      name: available.name,
      category: available.category,
      isLimited: false,
      initial: available.initial,
      current: available.initial,
      perOrder: 1,
      unit: available.unit,
      packageDesc: available.packageDesc
    }

    setEditList([...editList, newItem])
  }

  // 6. 항목 삭제
  const handleRemoveItem = (id: string) => {
    if (editList.length <= 1) {
      alert('최소 1개 이상의 메뉴가 유지되어야 합니다.')
      return
    }
    setEditList(editList.filter(item => item.id !== id))
  }

  // 7. 편집 필드 변경
  const handleEditChange = (id: string, field: keyof StockItem, value: any) => {
    setEditList(prev => prev.map(item => {
      if (item.id === id) {
        if (field === 'name') {
          const matched = menuPool.find(m => m.name === value)
          if (matched) {
            return {
              ...item,
              name: matched.name,
              category: matched.category,
              initial: matched.initial,
              current: matched.initial,
              unit: matched.unit,
              packageDesc: matched.packageDesc
            }
          }
        }
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  // 8. 설정 저장 및 적용
  const handleSaveEdit = () => {
    const cleaned = editList.map(item => ({
      ...item,
      initial: Math.max(1, Number(item.initial) || 1),
      current: Math.max(0, Number(item.current) !== undefined ? Number(item.current) : Number(item.initial) || 1),
      perOrder: Math.max(1, Number(item.perOrder) || 1)
    }))
    setIsEditingStock(false)
    syncAndSave(proposals, cleaned)
  }

  // 9. 메뉴판 CSV 파일 업로드 파싱 핸들러 (4개 컬럼 순수 데이터)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return

      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
      const parsedPool: MenuItem[] = []
      const parsedInitialCards: StockItem[] = []

      lines.forEach((line) => {
        if (line.includes('메뉴명') || line.includes('LocalMate') || line.startsWith('※')) return

        const cols = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''))
        if (cols.length >= 3 && cols[0]) {
          const name = cols[0]
          const category = cols[1] || '메뉴'
          const initial = Number(cols[2]) || 30
          const packageDesc = cols[3] && cols[3] !== '-' ? cols[3] : undefined

          let unit = '개'
          if (category.includes('커피') || category.includes('음료')) unit = '잔'
          else if (category.includes('메인')) unit = '마리'
          else if (name.includes('케이크')) unit = '조각'
          else if (name.includes('보틀') || name.includes('콜라')) unit = '병'
          else if (packageDesc?.includes('입') || packageDesc?.includes('조각') || packageDesc?.includes('세트')) unit = '세트'

          parsedPool.push({ name, category, initial, unit, packageDesc })

          if (parsedInitialCards.length < 5) {
            parsedInitialCards.push({
              id: `item-uploaded-${parsedInitialCards.length + 1}-${Date.now()}`,
              name,
              category,
              isLimited: false,
              initial,
              current: initial, // 오픈 준비 수량 100% 동기화
              perOrder: 1,
              unit,
              packageDesc
            })
          }
        }
      })

      if (parsedInitialCards.length > 0) {
        setIsEditingStock(false)
        syncAndSave(proposals, parsedInitialCards, parsedPool)
        alert(`메뉴판 파일에서 ${parsedPool.length}개 메뉴를 성공적으로 읽었습니다.\n상위 ${parsedInitialCards.length}개 메뉴가 실시간 트래커에 준비 수량으로 즉시 반영되었습니다.`)
      } else {
        alert('올바른 형식의 메뉴판 파일(CSV)을 읽지 못했습니다.\n형식: 메뉴명, 카테고리, 준비수량, 기본구성개수')
      }
    }
    reader.readAsText(file, 'utf-8')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // 10. 시뮬레이션 초기화 (현재 매장 기준으로 깔끔 리셋)
  const handleResetSimulation = () => {
    if (confirm('현재 매장의 메뉴 수량과 결재 제안을 기본 상태로 리셋하시겠습니까?')) {
      const isCafe = selectedStoreId === 'cafe'
      const defaultStock = isCafe ? STORE_DEFAULT_STOCKS.cafe : STORE_DEFAULT_STOCKS.chicken
      const defaultProposals = isCafe ? STORE_DEFAULT_PROPOSALS.cafe : STORE_DEFAULT_PROPOSALS.chicken
      const defaultPool = isCafe ? STORE_MENU_POOLS.cafe : STORE_MENU_POOLS.chicken
      
      setIsEditingStock(false)
      syncAndSave(defaultProposals, defaultStock, defaultPool)
    }
  }

  // 승인/보류 핸들러
  const handleApprove = (id: string) => {
    const updated = proposals.map(p => p.id === id ? { ...p, status: 'approved' as const } : p)
    syncAndSave(updated)
  }

  const handleReject = (id: string) => {
    const updated = proposals.map(p => p.id === id ? { ...p, status: 'rejected' as const } : p)
    syncAndSave(updated)
  }

  const pendingList = proposals.filter(p => p.status === 'pending')
  const historyList = proposals.filter(p => p.status !== 'pending')
  const isAllStockZero = stockItems.length > 0 && stockItems.every(s => s.current === 0)

  // 카테고리별 유니크 목록 추출
  const availableCategories = Array.from(new Set(menuPool.map(m => m.category)))

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28">
      <main className="mx-auto max-w-6xl px-4 md:px-6 py-6 space-y-6">
        {/* 상단 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900">
                {selectedStoreId === 'cafe' ? '☕ 카페 실시간 운영 제어 & 승인' : '🍗 치킨 전문점 운영 제어 & 승인'}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Actionable AI
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              AI가 위기 상황을 선제 감지하여 대책을 수립합니다. 점주의 원클릭 승인 즉시 배달 플랫폼 설정에 자동 반영됩니다.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetSimulation}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCcw className="size-3.5 text-slate-500" /> 시뮬레이션 초기화
            </button>
            <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
              <span className="text-xs text-slate-600 font-medium">
                승인 대기: <strong className={pendingList.length > 0 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>{pendingList.length}건</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 0개 완전 소진 시 상단 안내 배너 */}
        {isAllStockZero && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <PackageX className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-950">모든 관리 메뉴의 재고가 0개로 소진되었습니다</p>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  배달앱 일시품절 조치가 완료되었습니다. 주문 고객 이탈을 방어하기 위해 하단의 '타임세일 매출 부스팅' 결재를 진행하세요.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg shrink-0">
              품절 방어 모드 가동 중
            </span>
          </div>
        )}

        {/* 1. 메뉴별 실시간 재고 & 품절 방어 트래커 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Boxes className="size-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                {selectedStoreId === 'cafe' ? '카페 메뉴별 실시간 재고 & 품절 방어' : '치킨 메뉴별 실시간 재고 & 품절 방어'}
              </h2>
              <span className="text-[11px] text-slate-400 font-normal">| POS 실시간 연동 ({stockItems.length}/5)</span>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".csv, .txt" 
                className="hidden" 
              />

              {isEditingStock ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1"
                  >
                    <Upload className="size-3 text-slate-500" /> 엑셀/CSV 업로드
                  </button>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={editList.length >= 5}
                    className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition flex items-center gap-1 disabled:opacity-40"
                  >
                    <Plus className="size-3" /> 메뉴 추가 (+1)
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition flex items-center gap-1 shadow-xs"
                  >
                    <Save className="size-3" /> 저장 및 적용
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1"
                  >
                    <FileSpreadsheet className="size-3 text-slate-500" /> 메뉴판 파일 업로드
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1"
                  >
                    <Settings2 className="size-3 text-slate-500" /> 메뉴 및 수량 직접 설정
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 카드 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {(isEditingStock ? editList : stockItems).map((item) => {
              const percentage = item.initial > 0 ? Math.round((item.current / item.initial) * 100) : 0
              const threshold = item.perOrder * 2
              const isLow = item.current > 0 && item.current <= threshold
              const isZero = item.current === 0

              const isMain = item.category.includes('메인') || item.category.includes('커피') || item.category.includes('음료')
              const isSide = item.category.includes('사이드') || item.category.includes('디저트')
              
              const categoryBadge = isMain
                ? { label: selectedStoreId === 'cafe' ? '커피/음료' : '메인', color: 'bg-blue-50 text-blue-700 border-blue-200' }
                : isSide
                  ? { label: selectedStoreId === 'cafe' ? '디저트' : '사이드', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
                  : { label: selectedStoreId === 'cafe' ? '원두/MD' : '음료', color: 'bg-slate-100 text-slate-700 border-slate-200' }

              return (
                <div 
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all relative ${
                    isZero 
                      ? 'bg-slate-50 border-slate-200 opacity-75' 
                      : isLow 
                        ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isEditingStock ? (
                    // 🎯 수량 직접 편집 모드
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between gap-1">
                        <label 
                          onClick={() => handleEditChange(item.id, 'isLimited', !item.isLimited)}
                          className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 select-none"
                        >
                          {item.isLimited ? (
                            <span className="flex items-center gap-1 text-amber-600">
                              <CheckSquare className="size-4" /> 한정 메뉴 지정
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Square className="size-4" /> 일반 메뉴
                            </span>
                          )}
                        </label>

                        {editList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-400 hover:text-rose-500 transition p-0.5"
                            title="항목 제거"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>

                      <select
                        value={item.name}
                        onChange={(e) => handleEditChange(item.id, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate"
                      >
                        {availableCategories.map((cat) => (
                          <optgroup key={cat} label={`📂 ${cat}`}>
                            {menuPool.filter(m => m.category === cat).map((m) => (
                              <option key={m.name} value={m.name}>
                                {m.name} {m.packageDesc ? `(${m.packageDesc})` : ''}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>

                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">준비 수량</label>
                          <input 
                            type="number"
                            value={item.initial}
                            onChange={(e) => handleEditChange(item.id, 'initial', Number(e.target.value))}
                            className="w-full px-2 py-1 border rounded text-xs text-center font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">현재 잔여</label>
                          <input 
                            type="number"
                            value={item.current}
                            onChange={(e) => handleEditChange(item.id, 'current', Number(e.target.value))}
                            className="w-full px-2 py-1 border rounded text-xs text-center font-bold text-indigo-600"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">1회 주문당</label>
                          <input 
                            type="number"
                            value={item.perOrder}
                            onChange={(e) => handleEditChange(item.id, 'perOrder', Number(e.target.value))}
                            className="w-full px-2 py-1 border rounded text-xs text-center font-bold text-rose-600"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // 기본 뷰
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${categoryBadge.color}`}>
                              {categoryBadge.label}
                            </span>
                            {item.isLimited && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                한정
                              </span>
                            )}
                            <p className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                              {item.name}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            준비 {item.initial}{item.unit}
                            {item.packageDesc ? ` • 기본구성: ${item.packageDesc}` : ''}
                          </p>
                        </div>

                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          isZero 
                            ? 'bg-slate-200 text-slate-600' 
                            : isLow 
                              ? 'bg-amber-100 text-amber-800 animate-pulse' 
                              : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {isZero ? '완전 품절' : isLow ? '소진 임박' : `${item.current}${item.unit} 잔여`}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>잔여율</span>
                          <span className="font-semibold text-slate-700">{percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              isZero ? 'bg-slate-400' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOrderDeduct(item)}
                        disabled={isZero}
                        className={`w-full py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 shadow-2xs ${
                          isZero
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {isZero ? '재고 소진 완료' : `⚡ 주문 유입 시뮬레이션 (-${item.perOrder}${item.unit})`}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 2. 결재 대기 중인 운영 제어 카드 리스트 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="size-4 text-indigo-600" /> 결재 대기 중인 운영 제어 카드 ({pendingList.length})
            </h2>
            <span className="text-xs text-slate-400">결재 승인 시 배달 플랫폼 설정 즉시 자동 반영</span>
          </div>

          {pendingList.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {pendingList.map((task) => (
                <div 
                  key={task.id} 
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-indigo-200 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${task.badgeColor}`}>
                        {task.badge}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                    </div>
                    <span className="text-xs text-slate-400">{task.timestamp}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                      <AlertTriangle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800">감지 원인:</strong>{' '}
                        <span className="text-slate-600 leading-relaxed">{task.triggerReason}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-2">
                      <ArrowRight className="size-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-indigo-900">AI 실행 대책:</strong>{' '}
                        <span className="text-indigo-800 font-medium leading-relaxed">{task.actionDetail}</span>
                        <div className="mt-1 text-[11px] text-indigo-500 flex items-center gap-1">
                          <ExternalLink className="size-3" /> 연동 대상: {task.platformTarget}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleReject(task.id)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                    >
                      보류
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(task.id)}
                      className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
                    >
                      <CheckCircle2 className="size-3.5" /> 원클릭 승인 및 배달앱 적용
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="size-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">결재 대기 중인 운영 제안이 없습니다 (0건)</p>
              <p className="text-[11px] text-slate-400">모든 위험 요소가 예방되었거나 정상 처리되었습니다.</p>
            </div>
          )}
        </div>

        {/* 3. 최근 제어 및 실행 이력 */}
        {historyList.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900">최근 실행 및 승인 이력</h2>
            <div className="divide-y divide-slate-100">
              {historyList.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {item.status === 'approved' ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="size-3" /> 배달앱 적용 완료
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                        <XCircle className="size-3" /> 점주 보류
                      </span>
                    )}
                    <span className="font-medium text-slate-800">{item.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{item.platformTarget}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default TasksView