'use client'

import { useState, useEffect } from 'react'
import { validateAndParseKoreanAddress } from '@/lib/weather-scenarios'

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
  const [addressError, setAddressError] = useState<string | null>(null)

  useEffect(() => {
    const savedStore = localStorage.getItem('localmate_store_id') || 'cafe'
    setSelectedStoreId(savedStore)

    const savedSettings = localStorage.getItem(`localmate_settings_${savedStore}`)
    if (savedSettings) {
      try {
        setFormData(JSON.parse(savedSettings))
      } catch (e) {
        setFormData(savedStore === 'cafe' ? DEFAULT_SETTINGS.cafe : DEFAULT_SETTINGS.chicken)
      }
    } else {
      setFormData(savedStore === 'cafe' ? DEFAULT_SETTINGS.cafe : DEFAULT_SETTINGS.chicken)
    }

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        const newStoreId = customEvent.detail
        setSelectedStoreId(newStoreId)
        setAddressError(null)

        const newSettings = localStorage.getItem(`localmate_settings_${newStoreId}`)
        if (newSettings) {
          try {
            setFormData(JSON.parse(newSettings))
          } catch (e) {
            setFormData(newStoreId === 'cafe' ? DEFAULT_SETTINGS.cafe : DEFAULT_SETTINGS.chicken)
          }
        } else {
          setFormData(newStoreId === 'cafe' ? DEFAULT_SETTINGS.cafe : DEFAULT_SETTINGS.chicken)
        }
      }
    }
    window.addEventListener('storeChange', handleSync)
    return () => window.removeEventListener('storeChange', handleSync)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'address') {
      setAddressError(null)
    }
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value
    const newStoreId = newCategory === '카페' ? 'cafe' : 'chicken'
    setAddressError(null)

    const savedSettings = localStorage.getItem(`localmate_settings_${newStoreId}`)
    if (savedSettings) {
      try {
        setFormData(JSON.parse(savedSettings))
      } catch (e) {
        setFormData(newStoreId === 'cafe' ? DEFAULT_SETTINGS.cafe : DEFAULT_SETTINGS.chicken)
      }
    } else {
      setFormData(newStoreId === 'cafe' ? DEFAULT_SETTINGS.cafe : DEFAULT_SETTINGS.chicken)
    }

    setSelectedStoreId(newStoreId)
    localStorage.setItem('localmate_store_id', newStoreId)
    window.dispatchEvent(new CustomEvent('storeChange', { detail: newStoreId }))
  }

  // 🎯 설정 저장 및 주소 유효성 검증
  const handleSave = () => {
    // 대한민국 주소 검증
    const validation = validateAndParseKoreanAddress(formData.address)
    if (!validation.isValid) {
      setAddressError(validation.errorMsg || '정확한 주소를 입력해주세요.')
      return
    }

    setAddressError(null)

    localStorage.setItem(`localmate_settings_${selectedStoreId}`, JSON.stringify(formData))
    localStorage.setItem(`localmate_address_${selectedStoreId}`, formData.address)

    window.dispatchEvent(new CustomEvent('settingsChange', { 
      detail: { 
        storeId: selectedStoreId, 
        address: formData.address,
        district: validation.district,
        branchName: validation.branchName 
      } 
    }))

    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleReset = () => {
    if (confirm('현재 매장의 설정값을 초기화하시겠습니까?')) {
      const defaultData = selectedStoreId === 'cafe' ? DEFAULT_SETTINGS.cafe : DEFAULT_SETTINGS.chicken
      setFormData(defaultData)
      setAddressError(null)
      localStorage.removeItem(`localmate_settings_${selectedStoreId}`)
      localStorage.removeItem(`localmate_address_${selectedStoreId}`)

      window.dispatchEvent(new CustomEvent('settingsChange', { detail: { storeId: selectedStoreId, address: defaultData.address } }))
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
              placeholder="예: 서울 강남구, 대구 중구, 포항 북구"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none text-sm transition ${
                addressError 
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-400 bg-rose-50/20' 
                  : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'
              }`} 
            />
            {addressError && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
                <span>⚠️</span> {addressError}
              </p>
            )}
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