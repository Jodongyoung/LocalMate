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

// 📋 메뉴 레시피 구성 성분 (BOM)
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
  packageCost: number     // 포장 부자재비 (원)
  recipe: RecipeComponent[]
}

// 📊 메뉴 수익성 분석 결과 (FR-M02)
export interface CalculatedMenuProfit {
  id: string
  name: string
  category: string
  price: number
  ingredientCost: number
  packageCost: number
  platformFee: number
  netProfit: number
  marginRate: number
  soldCount: number
  totalNetProfit: number
  totalRevenue: number
  profitRankType: 'high_profit' | 'volume_driver' | 'low_margin'
}

// 📦 식자재 폐기 위험 및 발주 추천 분석 결과 (FR-M03)
export interface IngredientAnalysisItem extends IngredientItem {
  totalValue: number           // 총 재고액 (수량 × 단가)
  isLowStock: boolean          // 안전재고 미달 여부
  recommendedOrder: number     // AI 적정 발주 추천량
  expiryStatus: 'danger' | 'warning' | 'safe' // D-2 이하 위험, D-4 이하 주의, 정상
  expectedLoss: number         // 폐기 시 예상 손실액
}

// 🌐 글로벌 통합 표준 식자재 마스터 사전
export const ALL_MASTER_INGREDIENTS: Record<string, IngredientItem> = {
  // 카페 원재료
  'ing-coffee-bean': { id: 'ing-coffee-bean', name: '하우스 블렌드 원두', category: '원두', unit: 'g', costPerUnit: 25, currentStock: 3500, safetyStock: 1000, expiryDays: 45 },
  'ing-fresh-milk': { id: 'ing-fresh-milk', name: '바리스타 생우유 1L', category: '유제품', unit: 'ml', costPerUnit: 2.4, currentStock: 4800, safetyStock: 3000, expiryDays: 2 },
  'ing-vanilla-syrup': { id: 'ing-vanilla-syrup', name: '바닐라빈 시럽', category: '시럽', unit: 'ml', costPerUnit: 18, currentStock: 1200, safetyStock: 500, expiryDays: 90 },
  'ing-matcha-powder': { id: 'ing-matcha-powder', name: '제주 유기농 말차 파우더', category: '파우더', unit: 'g', costPerUnit: 35, currentStock: 800, safetyStock: 300, expiryDays: 60 },
  'ing-earlgrey-tea': { id: 'ing-earlgrey-tea', name: '얼그레이 피치 레몬 베이스', category: '티베이스', unit: 'g', costPerUnit: 15, currentStock: 1500, safetyStock: 500, expiryDays: 60 },
  'ing-croffle-dough': { id: 'ing-croffle-dough', name: '프랑스 버터 크루아상 생지', category: '베이커리', unit: '개', costPerUnit: 1400, currentStock: 12, safetyStock: 20, expiryDays: 1 },
  'ing-strawberry-cake': { id: 'ing-strawberry-cake', name: '생딸기 바스크 케이크 완제', category: '베이커리', unit: '조각', costPerUnit: 3400, currentStock: 8, safetyStock: 10, expiryDays: 2 },
  'ing-egg-tart': { id: 'ing-egg-tart', name: '수제 에그타르트 생지(2구)', category: '베이커리', unit: '세트', costPerUnit: 2100, currentStock: 26, safetyStock: 15, expiryDays: 5 },

  // 치킨 및 사이드 원재료
  'ing-raw-chicken': { id: 'ing-raw-chicken', name: '국내산 10호 신선육', category: '원육', unit: '마리', costPerUnit: 5800, currentStock: 18, safetyStock: 25, expiryDays: 2 },
  'ing-fry-powder': { id: 'ing-fry-powder', name: '크리스피 전용 파우더', category: '파우더', unit: 'g', costPerUnit: 5.5, currentStock: 12000, safetyStock: 4000, expiryDays: 120 },
  'ing-fry-oil': { id: 'ing-fry-oil', name: '카놀라 튀김 전용유 18L', category: '유지류', unit: 'ml', costPerUnit: 3.2, currentStock: 14000, safetyStock: 10000, expiryDays: 60 },
  'ing-sweet-sauce': { id: 'ing-sweet-sauce', name: '특제 매콤달콤 양념소스', category: '소스', unit: 'g', costPerUnit: 6.8, currentStock: 4500, safetyStock: 1500, expiryDays: 60 },
  'ing-garlic-sauce': { id: 'ing-garlic-sauce', name: '단짠 갈릭 간장 소스', category: '소스', unit: 'g', costPerUnit: 6.2, currentStock: 1100, safetyStock: 1500, expiryDays: 60 },
  'ing-cheese-ball': { id: 'ing-cheese-ball', name: '모짜렐라 치즈볼 완제(5개입)', category: '사이드', unit: '세트', costPerUnit: 1800, currentStock: 14, safetyStock: 20, expiryDays: 90 },
  'ing-wing-stick': { id: 'ing-wing-stick', name: '바베큐 윙봉(6조각)', category: '원육', unit: '세트', costPerUnit: 4200, currentStock: 9, safetyStock: 15, expiryDays: 2 },
  'ing-coke': { id: 'ing-coke', name: '코카콜라 1.25L', category: '음료', unit: '병', costPerUnit: 1400, currentStock: 50, safetyStock: 20, expiryDays: 180 },
  'ing-beer': { id: 'ing-beer', name: '생맥주 케그 1000cc', category: '주류', unit: '병', costPerUnit: 2500, currentStock: 8, safetyStock: 10, expiryDays: 4 }
}

// 🌐 메뉴 레시피(BOM) 사전
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

// 📦 [FR-M03] 식자재 목록 로드
export function getStoreIngredients(storeKey: string): IngredientAnalysisItem[] {
  const isChicken = storeKey.includes('chicken') || storeKey.includes('치킨')
  const key = isChicken ? 'chicken' : 'cafe'
  const storageKey = `localmate_ingredients_v2_${key}`

  let currentMap: Record<string, IngredientItem> = {}

  const defaultKeys = isChicken
    ? ['ing-raw-chicken', 'ing-fry-powder', 'ing-fry-oil', 'ing-sweet-sauce', 'ing-garlic-sauce', 'ing-cheese-ball', 'ing-wing-stick', 'ing-coke', 'ing-beer']
    : ['ing-coffee-bean', 'ing-fresh-milk', 'ing-vanilla-syrup', 'ing-matcha-powder', 'ing-earlgrey-tea', 'ing-croffle-dough', 'ing-strawberry-cake', 'ing-egg-tart']

  defaultKeys.forEach(k => {
    if (ALL_MASTER_INGREDIENTS[k]) {
      currentMap[k] = { ...ALL_MASTER_INGREDIENTS[k] }
    }
  })

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          currentMap = { ...currentMap, ...parsed }
        }
      } catch (e) {}
    } else {
      localStorage.setItem(storageKey, JSON.stringify(currentMap))
    }
  }

  return Object.values(currentMap).map(ing => {
    const totalValue = Math.round(ing.currentStock * ing.costPerUnit)
    const isLowStock = ing.currentStock < ing.safetyStock
    const recommendedOrder = isLowStock ? Math.round((ing.safetyStock * 1.5) - ing.currentStock) : 0

    let expiryStatus: 'danger' | 'warning' | 'safe' = 'safe'
    if (ing.expiryDays <= 2) {
      expiryStatus = 'danger'
    } else if (ing.expiryDays <= 4) {
      expiryStatus = 'warning'
    }

    const expectedLoss = (expiryStatus === 'danger' || expiryStatus === 'warning') ? totalValue : 0

    return {
      ...ing,
      totalValue,
      isLowStock,
      recommendedOrder,
      expiryStatus,
      expectedLoss
    }
  })
}

// 📦 식자재 수량 입고
export function updateIngredientStock(storeKey: string, ingredientId: string, addedStock: number) {
  if (typeof window === 'undefined') return
  const isChicken = storeKey.includes('chicken') || storeKey.includes('치킨')
  const key = isChicken ? 'chicken' : 'cafe'
  const storageKey = `localmate_ingredients_v2_${key}`

  const currentList = getStoreIngredients(key)
  const map: Record<string, IngredientItem> = {}

  currentList.forEach(item => {
    if (item.id === ingredientId) {
      map[item.id] = { ...item, currentStock: Math.max(0, item.currentStock + addedStock) }
    } else {
      map[item.id] = { ...item }
    }
  })

  localStorage.setItem(storageKey, JSON.stringify(map))
  window.dispatchEvent(new CustomEvent('ingredientUpdated', { detail: { storeId: key } }))
  window.dispatchEvent(new Event('storage'))
}

// 🔄 식자재 구매단가 수정 (FR-M02 순이익 자동 갱신)
export function updateIngredientCost(storeKey: string, ingredientId: string, newCost: number) {
  if (typeof window === 'undefined') return
  const isChicken = storeKey.includes('chicken') || storeKey.includes('치킨')
  const key = isChicken ? 'chicken' : 'cafe'
  const storageKey = `localmate_ingredients_v2_${key}`

  const currentList = getStoreIngredients(key)
  const map: Record<string, IngredientItem> = {}

  currentList.forEach(item => {
    if (item.id === ingredientId) {
      map[item.id] = { ...item, costPerUnit: Math.max(0.1, newCost) }
    } else {
      map[item.id] = { ...item }
    }
  })

  localStorage.setItem(storageKey, JSON.stringify(map))
  window.dispatchEvent(new CustomEvent('ingredientUpdated', { detail: { storeId: key } }))
  window.dispatchEvent(new CustomEvent('menuUpdated', { detail: { storeId: key } }))
  window.dispatchEvent(new Event('storage'))
}

// 🔄 [핵심] 식자재 수량 및 구매단가를 모두 최초 표준 기본값으로 완벽 초기화하는 함수
export function resetIngredientsToDefault(storeKey: string) {
  if (typeof window === 'undefined') return
  const isChicken = storeKey.includes('chicken') || storeKey.includes('치킨')
  const key = isChicken ? 'chicken' : 'cafe'
  const storageKey = `localmate_ingredients_v2_${key}`

  let defaultMap: Record<string, IngredientItem> = {}
  const defaultKeys = isChicken
    ? ['ing-raw-chicken', 'ing-fry-powder', 'ing-fry-oil', 'ing-sweet-sauce', 'ing-garlic-sauce', 'ing-cheese-ball', 'ing-wing-stick', 'ing-coke', 'ing-beer']
    : ['ing-coffee-bean', 'ing-fresh-milk', 'ing-vanilla-syrup', 'ing-matcha-powder', 'ing-earlgrey-tea', 'ing-croffle-dough', 'ing-strawberry-cake', 'ing-egg-tart']

  defaultKeys.forEach(k => {
    if (ALL_MASTER_INGREDIENTS[k]) {
      defaultMap[k] = { ...ALL_MASTER_INGREDIENTS[k] }
    }
  })

  localStorage.setItem(storageKey, JSON.stringify(defaultMap))
  window.dispatchEvent(new CustomEvent('ingredientUpdated', { detail: { storeId: key } }))
  window.dispatchEvent(new CustomEvent('menuUpdated', { detail: { storeId: key } }))
  window.dispatchEvent(new Event('storage'))
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

// 📍 [FR-M02] 실제 식자재 단가를 조회하여 메뉴 수익성 목록 반환
export function getStoreProfitAnalysis(storeKey: string): CalculatedMenuProfit[] {
  const isChicken = storeKey.includes('chicken') || storeKey.includes('치킨')
  const key = isChicken ? 'chicken' : 'cafe'

  const liveIngredients = getStoreIngredients(key)
  const ingMap: Record<string, IngredientItem> = {}
  liveIngredients.forEach(i => { ingMap[i.id] = i })

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
      calculateMenuProfit(m.name, m.category, m.price, m, ingMap, 0)
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
      ingMap,
      soldCount
    )
  })
}

// 🚀 [단일 통합 주문 파이프라인] 주문 인입 시: 완제품 재고 차감 + 매출 누적 + 식자재 BOM 원자재 차감
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

    // 1. 완제품 수량 차감
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

    // 3. BOM 식자재 소모 차감
    const cleanName = item.name.trim()
    const matchedRecipe = ALL_MASTER_RECIPES.find(r => 
      r.name.trim() === cleanName || 
      r.name.includes(cleanName) || 
      cleanName.includes(r.name)
    )

    if (matchedRecipe && matchedRecipe.recipe.length > 0) {
      const ingStorageKey = `localmate_ingredients_v2_${storeKey}`
      const ingredients = getStoreIngredients(storeKey)
      const ingMap: Record<string, IngredientItem> = {}
      ingredients.forEach(i => { ingMap[i.id] = { ...i } })

      matchedRecipe.recipe.forEach(comp => {
        if (ingMap[comp.ingredientId]) {
          const deductAmount = comp.amount * orderQuantity
          ingMap[comp.ingredientId].currentStock = Math.max(0, ingMap[comp.ingredientId].currentStock - deductAmount)
        }
      })

      localStorage.setItem(ingStorageKey, JSON.stringify(ingMap))
      window.dispatchEvent(new CustomEvent('ingredientUpdated', { detail: { storeId: storeKey } }))
    }

    // 4. 전역 이벤트 발행
    window.dispatchEvent(new CustomEvent('stockUpdated', { detail: { storeId: storeKey, stock: stockList } }))
    window.dispatchEvent(new CustomEvent('localmate_sales_updated', { detail: { storeId: storeKey, added: addedRevenue, todaySales: nextToday } }))
    window.dispatchEvent(new CustomEvent('menuUpdated', { detail: { storeId: storeKey } }))
    window.dispatchEvent(new CustomEvent('storage', { detail: storeKey }))

    return true
  } catch (e) {
    return false
  }
}