'use client'

import { useState, useEffect } from 'react'

// 초기 기본값 세팅 (카페와 치킨집 고정)
const DEFAULT_SETTINGS = {
  cafe: {
    name: '☕ 동성로 카페 (본점)',
    category: '카페',
    address: '대구광역시 중구 동성로 123',
    tone: 'polite',
    forbiddenWords: '',
    refundPolicy: '음료 제조 시작 전 100% 환불 가능'
  },
  chicken: {
    name: '🍗 수성 치킨 (지점)',
    category: '치킨',
    address: '대구광역시 수성구 수성못길 456',
    tone: 'friendly',
    forbiddenWords: '맛없다, 비싸다',
    refundPolicy: '조리 시작 후 환불 불가'
  }
}

export function SettingsView() {
  const [selectedStoreId, setSelectedStoreId] = useState('cafe')
  const [formData, setFormData] = useState(DEFAULT_SETTINGS.cafe)
  const [isSaved, setIsSaved] = useState(false)

  // 1. 선택된 매장 동기화 및 설정값 불러오기
  useEffect(() => {
    const savedStore = localStorage.getItem('localmate_store_id') || 'cafe'
    setSelectedStoreId(savedStore)
    
    const savedSettings = localStorage.getItem(`localmate_settings_${savedStore}`)
    if (savedSettings) {
      setFormData(JSON.parse(savedSettings))
    } else {
      setFormData(savedStore === 'cafe' ? DEFAULT_SETTINGS.cafe : DEFAULT_SETTINGS.chicken)
    }

    // 외부(사이드바/헤더)에서 매장 변경 시 즉시 감지
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        const newStoreId = customEvent.detail
        setSelectedStoreId(newStoreId)
        
        const newSettings = localStorage.getItem(`localmate_settings_${newStoreId}`)
        if (newSettings) {
          setFormData(JSON.parse(newSettings))
        } else {
          setFormData(newStoreId === 'cafe' ? DEFAULT_SETTINGS.cafe : DEFAULT_SETTINGS.chicken)
        }
      }
    }
    window.addEventListener('storeChange', handleSync)
    return () => window.removeEventListener('storeChange', handleSync)
  }, [])

  // 2. 폼 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // 3. ✅ 업종(카테고리) 변경 시 해당 매장의 세팅 전체를 불러오도록 전환 (Store Switcher 역할)
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value
    const newStoreId = newCategory === '카페' ? 'cafe' : 'chicken'
    
    // 대상 매장의 데이터 불러오기
    const savedSettings = localStorage.getItem(`localmate_settings_${newStoreId}`)
    if (savedSettings) {
      setFormData(JSON.parse(savedSettings))
    } else {
      setFormData(newStoreId === 'cafe' ? DEFAULT_SETTINGS.cafe : DEFAULT_SETTINGS.chicken)
    }

    setSelectedStoreId(newStoreId)

    // 사이드바와 헤더에도 매장이 바뀌었다고 알림
    localStorage.setItem('localmate_store_id', newStoreId)
    window.dispatchEvent(new CustomEvent('storeChange', { detail: newStoreId }))
  }

  // 4. ✅ 설정 저장 핸들러 (저장 즉시 사이드바/헤더 이름 실시간 업데이트)
  const handleSave = () => {
    localStorage.setItem(`localmate_settings_${selectedStoreId}`, JSON.stringify(formData))
    
    // 헤더/사이드바 이름 변경 신호 발송
    window.dispatchEvent(new Event('settingsChange')) 
    
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  // 5. ✅ 초기화 핸들러 (현재 선택된 매장의 데이터를 초기값으로 완전 복구)
  const handleReset = () => {
    if (confirm('현재 매장의 설정값을 초기화하시겠습니까?')) {
      const defaultData = selectedStoreId === 'cafe' ? DEFAULT_SETTINGS.cafe : DEFAULT_SETTINGS.chicken
      setFormData(defaultData)
      localStorage.removeItem(`localmate_settings_${selectedStoreId}`)
      
      // 헤더/사이드바도 기본 이름으로 복구하라는 신호 발송
      window.dispatchEvent(new Event('settingsChange')) 
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">매장 설정</h1>
        <p className="text-sm text-slate-500 mt-1">
          현재 선택된 매장: <strong className="text-indigo-600">{formData.name}</strong>
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">매장 기본 프로필</h2>
          <p className="text-xs text-slate-500 mt-1">매장 정보를 수정하세요</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">상호명</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">업종 (매장 전환)</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white font-medium text-indigo-600"
            >
              <option value="카페">카페</option>
              <option value="치킨">치킨</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">주소</label>
            <input 
              type="text" 
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">AI 응대 정책 설정</h2>
          <p className="text-xs text-slate-500 mt-1">AI 응대 방식을 설정하세요</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">응대 어조 선택</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="tone" 
                  value="polite"
                  checked={formData.tone === 'polite'}
                  onChange={handleChange}
                  className="text-indigo-600 focus:ring-indigo-500" 
                />
                정중하고 친절한 어조
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="tone" 
                  value="friendly"
                  checked={formData.tone === 'friendly'}
                  onChange={handleChange}
                  className="text-indigo-600 focus:ring-indigo-500" 
                />
                단골집 이모 어조 (친근함)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">금지어 설정</label>
            <textarea 
              name="forbiddenWords"
              value={formData.forbiddenWords}
              onChange={handleChange}
              placeholder="금지어 예시: 욕설, 비방, 허위 정보" 
              className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">환불 정책</label>
            <textarea 
              name="refundPolicy"
              value={formData.refundPolicy}
              onChange={handleChange}
              placeholder="환불 정책 설명: 1시간 이내 취소 시 전액 환불" 
              className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button 
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          데모 시드 데이터 초기화
        </button>
        <button 
          onClick={handleSave}
          className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md"
        >
          {isSaved ? '저장 완료!' : '설정 저장'}
        </button>
      </div>
    </div>
  )
}