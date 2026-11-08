// 🍳 식자재(원자재) 정의 인터페이스
export interface IngredientItem {
  id: string
  name: string
  category: string
  unit: string
  costPerUnit: number     // 단위당 구매 원가 (원)
  currentStock: number    // 현재 보유 수량
  safetyStock: number     // 최소 안전 재고
  expiryDays: number      // 유통기한 잔여 (일)
}

// 📋 메뉴 레시피 구성 성분
export interface RecipeComponent {
  ingredientId: string
  amount: number          // 1회 조리 시 소모량
}

// 🍔 메뉴 레시피 정의
export interface MenuProfitItem {
  id: string
  name: string
  category: string
  price: number           // 판매가 (원)
  packageCost: number     // 포장 용기 및 부자재비 (원)
  recipe: RecipeComponent[]
}

// 📊 계산된 메뉴 수익성 분석 결과
export interface CalculatedMenuProfit {
  id: string
  name: string
  category: string
  price: number
  ingredientCost: number  // 총 식자재 원가 (원)
  packageCost: number     // 포장 부자재비 (원)
  platformFee: number     // 배달 플랫폼 수수료 (9.8%)
  netProfit: number       // 건당 예상 순이익 (원)
  marginRate: number      // 마진율 (%)
  soldCount: number       // 당일 실제 누적 판매량
  totalNetProfit: number  // 당일 누적 총 순이익 (순이익 × 판매량)
  totalRevenue: number    // 당일 총 매출액 (판매가 × 판매량)
  profitRankType: 'high_profit' | 'volume_driver' | 'low_margin'
}

// 🌐 글로벌 통합 식자재 마스터 사전
export const ALL_MASTER_INGREDIENTS: Record<string, IngredientItem> = {
  // 카페 원재료
  'ing-coffee-bean': { id: 'ing-coffee-bean', name: '하우스 블렌드 원두', category: '원두', unit: 'g', costPerUnit: 25, currentStock: 3500, safetyStock: 1000, expiryDays: 45 },
  'ing-fresh-milk': { id: 'ing-fresh-milk', name: '바리스타 생우유 1L', category: '유제품', unit: 'ml', costPerUnit: 2.4, currentStock: 8000, safetyStock: 3000, expiryDays: 4 },
  'ing-vanilla-syrup': { id: 'ing-vanilla-syrup', name: '마다가스카르 바닐라빈 시럽', category: '시럽', unit: 'ml', costPerUnit: 18, currentStock: 1200, safetyStock: 500, expiryDays: 90 },
  'ing-matcha-powder': { id: 'ing-matcha-powder', name: '제주 유기농 말차 파우더', category: '파우더', unit: 'g', costPerUnit: 35, currentStock: 800, safetyStock: 300, expiryDays: 60 },
  'ing-earlgrey-tea': { id: 'ing-earlgrey-tea', name: '얼그레이 피치 레몬 베이스', category: '티베이스', unit: 'g', costPerUnit: 15, currentStock: 1500, safetyStock: 500, expiryDays: 60 },
  'ing-croffle-dough': { id: 'ing-croffle-dough', name: '프랑스 버터 크루아상 생지', category: '베이커리', unit: '개', costPerUnit: 1400, currentStock: 45, safetyStock: 20, expiryDays: 14 },
  'ing-strawberry-cake': { id: 'ing-strawberry-cake', name: '생딸기 바스크 케이크 완제', category: '베이커리', unit: '조각', costPerUnit: 3400, currentStock: 18, safetyStock: 10, expiryDays: 2 },
  'ing-egg-tart': { id: 'ing-egg-tart', name: '수제 에그타르트 생지(2구)', category: '베이커리', unit: '세트', costPerUnit: 2100, currentStock: 26, safetyStock: 15, expiryDays: 5 },

  // 치킨 및 사이드 원재료
  'ing-raw-chicken': { id: 'ing-raw-chicken', name: '국내산 10호 신선육', category: '원육', unit: '마리', costPerUnit: 5800, currentStock: 48, safetyStock: 20, expiryDays: 3 },
  'ing-fry-powder': { id: 'ing-fry-powder', name: '크리스피 전용 파우더', category: '파우더', unit: 'g', costPerUnit: 5.5, currentStock: 12000, safetyStock: 4000, expiryDays: 120 },
  'ing-fry-oil': { id: 'ing-fry-oil', name: '카놀라 튀김 전용유 18L', category: '유지류', unit: 'ml', costPerUnit: 3.2, currentStock: 25000, safetyStock: 10000, expiryDays: 60 },
  'ing-sweet-sauce': { id: 'ing-sweet-sauce', name: '특제 매콤달콤 양념소스', category: '소스', unit: 'g', costPerUnit: 6.8, currentStock: 4500, safetyStock: 1500, expiryDays: 60 },
  'ing-garlic-sauce': { id: 'ing-garlic-sauce', name: '단짠 갈릭 간장 소스', category: '소스', unit: 'g', costPerUnit: 6.2, currentStock: 4000, safetyStock: 1500, expiryDays: 60 },
  'ing-cheese-ball': { id: 'ing-cheese-ball', name: '모짜렐라 치즈볼 완제(5개입)', category: '사이드', unit: '세트', costPerUnit: 1800, currentStock: 38, safetyStock: 20, expiryDays: 90 },
  'ing-wing-stick': { id: 'ing-wing-stick', name: '바베큐 윙봉(6조각)', category: '원육', unit: '세트', costPerUnit: 4200, currentStock: 22, safetyStock: 15, expiryDays: 4 },
  'ing-coke': { id: 'ing-coke', name: '코카콜라 1.25L', category: '음료', unit: '병', costPerUnit: 1400, currentStock: 50, safetyStock: 20, expiryDays: 180 },
  'ing-beer': { id: 'ing-beer', name: '생맥주 케그 1000cc', category: '주류', unit: '병', costPerUnit: 2500, currentStock: 30, safetyStock: 10, expiryDays: 30 }
}

// 🌐 글로벌 통합 정규 레시피 사전
export const ALL_MASTER_RECIPES: MenuProfitItem[] = [
  { id: 'master-cafe-1', name: '아메리카노 (ICED)', category: '커피및음료', price: 4500, packageCost: 280, recipe: [{ ingredientId: 'ing-coffee-bean', amount: 20 }] },
  { id: 'master-cafe-2', name: '카페라떼 (ICED)', category: '커피및음료', price: 5200, packageCost: 280, recipe: [{ ingredientId: 'ing-coffee-bean', amount: 20 }, { ingredientId: 'ing-fresh-milk', amount: 200 }] },
  { id: 'master-cafe-3', name: '바닐라빈 라떼', category: '커피및음료', price: 5800, packageCost: 280, recipe: [{ ingredientId: 'ing-coffee-bean', amount: 20 }, { ingredientId: 'ing-fresh-milk', amount: 180 }, { ingredientId: 'ing-vanilla-syrup', amount: 30 }] },
  { id: 'master-cafe-4', name: '제주 말차 라떼', category: '커피및음료', price: 6200, packageCost: 280, recipe: [{ ingredientId: 'ing-matcha-powder', amount: 25 }, { ingredientId: 'ing-fresh-milk', amount: 200 }] },
  { id: 'master-cafe-5', name: '얼그레이 피치 레몬티', category: '커피및음료', price: 5500, packageCost: 280, recipe: [{ ingredientId: 'ing-earlgrey-tea', amount: 40 }] },
  { id: 'master-cafe-6', name: '생딸기 바스크 케이크', category: '디저트', price: 7800, packageCost: 450, recipe: [{ ingredientId: 'ing-strawberry-cake', amount: 1 }] },
  { id: 'master-cafe-7', name: '버터 크로플 세트', category: '디저트', price: 5500, packageCost: 350, recipe: [{ ingredientId: 'ing-croffle-dough', amount: 1 }] },
  { id: 'master-cafe-8', name: '수제 에그타르트 세트', category: '디저트', price: 6500, packageCost: 350, recipe: [{ ingredientId: 'ing-egg-tart', amount: 1 }] },
  { id: 'master-chk-1', name: '황금 후라이드 치킨', category: '메인메뉴', price: 19000, packageCost: 650, recipe: [{ ingredientId: 'ing-raw-chicken', amount: 1 }, { ingredientId: 'ing-fry-powder', amount: 150 }, { ingredientId: 'ing-fry-oil', amount: 250 }] },
  { id: 'master-chk-2', name: '매콤달콤 양념 치킨', category: '메인메뉴', price: 20500, packageCost: 750, recipe: [{ ingredientId: 'ing-raw-chicken', amount: 1 }, { ingredientId: 'ing-fry-powder', amount: 150 }, { ingredientId: 'ing-fry-oil', amount: 250 }, { ingredientId: 'ing-sweet-sauce', amount: 180 }] },
  { id: 'master-chk-3', name: '단짠 갈릭 간장 치킨', category: '메인메뉴', price: 21000, packageCost: 750, recipe: [{ ingredientId: 'ing-raw-chicken', amount: 1 }, { ingredientId: 'ing-fry-powder', amount: 150 }, { ingredientId: 'ing-fry-oil', amount: 250 }, { ingredientId: 'ing-garlic-sauce', amount: 150 }] },
  { id: 'master-chk-4', name: '특제 모짜 치즈볼', category: '사이드메뉴', price: 5500, packageCost: 280, recipe: [{ ingredientId: 'ing-cheese-ball', amount: 1 }, { ingredientId: 'ing-fry-oil', amount: 80 }] },
  { id: 'master-chk-5', name: '수제 바베큐 윙봉', category: '사이드메뉴', price: 10500, packageCost: 380, recipe: [{ ingredientId: 'ing-wing-stick', amount: 1 }] },
  { id: 'master-chk-6', name: '콜라 1.25L', category: '음료및주류', price: 3000, packageCost: 100, recipe: [{ ingredientId: 'ing-coke', amount: 1 }] },
  { id: 'master-chk-7', name: '생맥주 1000cc', category: '음료및주류', price: 7000, packageCost: 200, recipe: [{ ingredientId: 'ing-beer', amount: 1 }] }
]

// 🤖 표준 원가율 추정기
export function estimateCostByCategory(category: string, price: number): { ingredientCost: number; packageCost: number } {
  const cat = category.toLowerCase()
  if (cat.includes('커피') || cat.includes('음료') || cat.includes('라떼') || cat.includes('티')) {
    return { ingredientCost: Math.round(price * 0.16), packageCost: 280 }
  } else if (cat.includes('디저트') || cat.includes('베이커리') || cat.includes('케이크')) {
    return { ingredientCost: Math.round(price * 0.32), packageCost: 350 }
  } else if (cat.includes('메인') || cat.includes('치킨')) {
    return { ingredientCost: Math.round(price * 0.38), packageCost: 700 }
  } else if (cat.includes('사이드')) {
    return { ingredientCost: Math.round(price * 0.28), packageCost: 300 }
  }
  return { ingredientCost: Math.round(price * 0.30), packageCost: 350 }
}

// 🧮 메뉴 1건의 순수익 계산기
export function calculateMenuProfit(
  menuName: string,
  category: string,
  price: number,
  knownRecipe: MenuProfitItem | undefined,
  ingredients: Record<string, IngredientItem>,
  soldCount: number = 0,
  customPrice?: number
): CalculatedMenuProfit {
  const targetPrice = customPrice !== undefined ? customPrice : price
  let ingredientCost = 0
  let packageCost = 300

  if (knownRecipe && knownRecipe.recipe.length > 0) {
    knownRecipe.recipe.forEach((item) => {
      const ing = ingredients[item.ingredientId]
      if (ing) {
        ingredientCost += ing.costPerUnit * item.amount
      }
    })
    packageCost = knownRecipe.packageCost
  } else {
    const estimated = estimateCostByCategory(category, targetPrice)
    ingredientCost = estimated.ingredientCost
    packageCost = estimated.packageCost
  }

  const platformFee = Math.round(targetPrice * 0.098)
  const netProfit = Math.round(targetPrice - ingredientCost - packageCost - platformFee)
  const marginRate = targetPrice > 0 ? Number(((netProfit / targetPrice) * 100).toFixed(1)) : 0

  let profitRankType: 'high_profit' | 'volume_driver' | 'low_margin' = 'volume_driver'
  if (marginRate >= 45 || netProfit >= 6000) {
    profitRankType = 'high_profit'
  } else if (marginRate < 25) {
    profitRankType = 'low_margin'
  }

  const actualSold = Math.max(0, soldCount)

  return {
    id: knownRecipe?.id || `menu-dyn-${menuName}`,
    name: menuName,
    category,
    price: targetPrice,
    ingredientCost: Math.round(ingredientCost),
    packageCost,
    platformFee,
    netProfit,
    marginRate,
    soldCount: actualSold,
    totalNetProfit: netProfit * actualSold,
    totalRevenue: targetPrice * actualSold,
    profitRankType
  }
}

// 📍 실제 저장된 재고 데이터와 통합 마스터 레시피를 결합하여 분석 데이터 반환
export function getStoreProfitAnalysis(storeKey: string): CalculatedMenuProfit[] {
  const isChicken = storeKey.includes('chicken') || storeKey.includes('치킨')
  const key = isChicken ? 'chicken' : 'cafe'

  let liveStockItems: any[] = []
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`localmate_stock_v5_${key}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          liveStockItems = parsed
        }
      } catch (e) {}
    }
  }

  if (liveStockItems.length === 0) {
    const fallbackList = isChicken 
      ? ALL_MASTER_RECIPES.filter(m => m.id.includes('chk'))
      : ALL_MASTER_RECIPES.filter(m => m.id.includes('cafe'))

    return fallbackList.map((m) =>
      calculateMenuProfit(m.name, m.category, m.price, m, ALL_MASTER_INGREDIENTS, 0)
    )
  }

  return liveStockItems.map((item) => {
    const cleanName = item.name.trim()
    const matchedKnown = ALL_MASTER_RECIPES.find((km) => 
      km.name.trim() === cleanName || 
      km.name.includes(cleanName) || 
      cleanName.includes(km.name)
    )

    const initial = Number(item.initial) || 0
    const current = Number(item.current) !== undefined ? Number(item.current) : initial
    const soldCount = Math.max(0, initial - current)
    const price = Number(item.price) || (matchedKnown?.price ?? 15000)

    return calculateMenuProfit(
      item.name,
      item.category || matchedKnown?.category || '메뉴',
      price,
      matchedKnown,
      ALL_MASTER_INGREDIENTS,
      soldCount
    )
  })
}

// 🚀 [핵심] 단일 주문 파이프라인 함수: 재고 차감 + 매출 누적 + 이벤트 발행을 일원화 처리
export function processStoreOrder(targetStoreId: string, menuNameOrId?: string, orderQuantity: number = 1): boolean {
  if (typeof window === 'undefined') return false

  const isChicken = targetStoreId.includes('chicken') || targetStoreId.includes('치킨')
  const storeKey = isChicken ? 'chicken' : 'cafe'
  const storageKey = `localmate_stock_v5_${storeKey}`
  const savedStock = localStorage.getItem(storageKey)
  if (!savedStock) return false

  try {
    const stockList: any[] = JSON.parse(savedStock)
    if (!Array.isArray(stockList) || stockList.length === 0) return false

    // 대상 메뉴 찾기 (지정 없으면 첫 번째 가용 메뉴)
    let targetIndex = -1
    if (menuNameOrId) {
      targetIndex = stockList.findIndex(item => item.id === menuNameOrId || item.name.includes(menuNameOrId))
    }
    if (targetIndex === -1) {
      targetIndex = stockList.findIndex(item => item.current > 0)
      if (targetIndex === -1) targetIndex = 0
    }

    const item = stockList[targetIndex]
    if (item.current <= 0) return false

    // 1. 재고 차감 (current - orderQuantity)
    const nextCurrent = Math.max(0, item.current - orderQuantity)
    stockList[targetIndex].current = nextCurrent
    localStorage.setItem(storageKey, JSON.stringify(stockList))

    // 2. 대시보드 매출 누적 가산
    const unitPrice = Number(item.price) || 15000
    const addedRevenue = unitPrice * orderQuantity

    const baseToday = isChicken ? 1284000 : 980000
    const baseMonth = isChicken ? 18500000 : 15200000

    const currentToday = Number(localStorage.getItem(`localmate_today_sales_${storeKey}`)) || baseToday
    const currentMonth = Number(localStorage.getItem(`localmate_month_sales_${storeKey}`)) || baseMonth

    const nextToday = currentToday + addedRevenue
    const nextMonth = currentMonth + addedRevenue

    localStorage.setItem(`localmate_today_sales_${storeKey}`, nextToday.toString())
    localStorage.setItem(`localmate_month_sales_${storeKey}`, nextMonth.toString())

    // 3. 전체 시스템 실시간 동기화 이벤트 브로드캐스팅
    window.dispatchEvent(new CustomEvent('stockUpdated', { detail: { storeId: storeKey, stock: stockList } }))
    window.dispatchEvent(new CustomEvent('localmate_sales_updated', { detail: { storeId: storeKey, added: addedRevenue, todaySales: nextToday } }))
    window.dispatchEvent(new CustomEvent('menuUpdated', { detail: { storeId: storeKey } }))
    window.dispatchEvent(new CustomEvent('storage', { detail: storeKey }))

    return true
  } catch (e) {
    return false
  }
}