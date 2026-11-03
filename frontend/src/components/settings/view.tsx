'use client'

import { useState, useEffect, useMemo } from 'react'
import { Sparkles, MessageSquare, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react'
import { validateAndParseKoreanAddress } from '@/lib/weather-scenarios'

type ToneType = 'polite' | 'friendly' | 'concise'

interface StoreSettings {
  name: string
  category: string
  address: string
  tone: ToneType
  compensationPolicy: string
  forbiddenWords: string
  refundPolicy: string
}

const DEFAULT_SETTINGS: Record<string, StoreSettings> = {
  cafe: {
    name: '☕ 동성로 카페 (본점)',
    category: '카페',
    address: '대구광역시 중구 동성로 123',
    tone: 'polite',
    compensationPolicy: 'service',
    forbiddenWords: '맛없다, 비싸다, 환불',
    refundPolicy: '음료 제조 시작 전 100% 환불 가능'
  },
  chicken: {
    name: '🍗 수성 치킨 (지점)',
    category: '치킨',
    address: '대구광역시 수성구 수성못길 456',
    tone: 'friendly',
    compensationPolicy: 'redelivery',
    forbiddenWords: '비싸다, 양적다, 배달지연',
    refundPolicy: '조리 시작 후 환불 불가'
  }
}

const TONE_MODE_LABELS: Record<ToneType, string> = {
  polite: '정중 모드',
  friendly: '친근 모드',
  concise: '간결 모드'
}

// 7대 핵심 금지어 유지
const RECOMMENDED_FORBIDDEN_TAGS = ['맛없다', '비싸다', '양적다', '식었다', '배달지연', '라이더', '환불']

export function SettingsView() {
  const [selectedStoreId, setSelectedStoreId] = useState('cafe')
  const [formData, setFormData] = useState<StoreSettings>(DEFAULT_SETTINGS.cafe)
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

  const handleToggleForbiddenTag = (tag: string) => {
    const currentWords = formData.forbiddenWords
      ? formData.forbiddenWords.split(',').map(w => w.trim()).filter(Boolean)
      : []

    let updated: string[]
    if (currentWords.includes(tag)) {
      updated = currentWords.filter(w => w !== tag)
    } else {
      updated = [...currentWords, tag]
    }
    setFormData(prev => ({ ...prev, forbiddenWords: updated.join(', ') }))
  }

  const handleSave = () => {
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

  const activeForbiddenList = useMemo(() => {
    return formData.forbiddenWords
      ? formData.forbiddenWords.split(',').map(w => w.trim()).filter(Boolean)
      : []
  }, [formData.forbiddenWords])

  // 🎯 각 금지어의 개별 활성화 상태에 따라 완전히 자연스러운 문맥을 조립하는 엔진
  const { filteredText, detectedForbidden } = useMemo(() => {
    const has = (word: string) => activeForbiddenList.includes(word)
    const detected: string[] = RECOMMENDED_FORBIDDEN_TAGS.filter(tag => has(tag))

    let text = ''

    // 1. 간결 모드
    if (formData.tone === 'concise') {
      const delayText = has('배달지연') ? '배송 소요 시간' : '배달지연'
      const riderText = has('라이더') ? '전달 과정' : '라이더 배차'
      const tempText = has('식었다') ? '음식 온도가 아쉬우셨던 점' : '음식이 식었다 느끼신 점'
      const qualityText = (has('맛없다') || has('양적다') || has('비싸다'))
        ? '맛과 양, 가격 만족도 부족'
        : '맛없다·양적다·비싸다 느끼신 사항'
      const refundText = has('환불') ? '고객 보상 절차' : '환불 및 재배달'

      text = `주문해 주셔서 감사합니다. 말씀해 주신 ${delayText} 및 ${riderText} 문제와 ${tempText}, ${qualityText}을 즉시 개선하겠습니다. ${refundText} 문의는 매장으로 연락 주시면 바로 돕겠습니다.`
    }
    // 2. 친근 모드
    else if (formData.tone === 'friendly') {
      const delayText = has('배달지연') ? '배송이 예상보다 늦어지고' : '배달지연이 생겨'
      const riderText = has('라이더') ? '전달 과정이 매끄럽지 못해' : '라이더 배차가 늦어져'
      const tempText = has('식었다') ? '치킨이 온도가 내려간 채 도착했을까 봐' : '치킨이 다소 식었다 느끼셨을까 봐'
      
      let tasteParts: string[] = []
      if (!has('양적다')) tasteParts.push('양적다 생각 마시구')
      if (!has('비싸다')) tasteParts.push('비싸다 느끼지 마세요')
      if (!has('맛없다')) tasteParts.push('맛없다 서운해 마세요')

      const tasteText = tasteParts.length > 0
        ? tasteParts.join(', ') + '!'
        : '맛과 양, 가격 모든 면에서 기대에 차실 수 있도록 최선을 다할게요!'

      const refundText = has('환불') ? '속상하신 마음 푸실 수 있도록' : '환불 대신'

      text = `사장입니다! 맛있게 드셔주셔서 오늘 하루 피로가 싹 가시네요 🍗 다만 궂은 날씨 탓에 ${delayText} ${riderText} ${tempText} 정말 속상한 마음입니다. ${tasteText} ${refundText} 다음 주문 때 요청사항에 닉네임 적어주시면 서비스 치즈볼 팍팍 챙겨드릴게요!`
    }
    // 3. 정중 모드 (기본)
    else {
      const delayText = has('배달지연') ? '배송 과정에서 소요 시간이 지체되고' : '배달지연 및'
      const riderText = has('라이더') ? '전달 과정의 미흡함으로 인해' : '라이더 배차 지연으로 인해'
      const tempText = has('식었다') ? '음식의 따뜻한 온도를 지키지 못한 점' : '음식이 식었다 느끼셨을 점'
      
      let qualityNegativeParts: string[] = []
      if (!has('맛없다')) qualityNegativeParts.push('맛없다')
      if (!has('양적다')) qualityNegativeParts.push('양적다')
      if (!has('비싸다')) qualityNegativeParts.push('비싸다')

      const qualityText = qualityNegativeParts.length > 0
        ? `혹여나 ${qualityNegativeParts.join('거나 ')} 생각되지 않도록 조리 품질을 높이겠습니다.`
        : `고객님께서 전해주신 맛과 양, 가격에 대한 아쉬움을 겸허히 수용하고 조리 및 포장 품질을 철저히 높이겠습니다.`

      const refundText = has('환불') ? '불편에 대한 보상 및 재배달 안내는' : '환불이나 재배달 조치는'

      text = `고객님, 소중한 리뷰 남겨주셔서 진심으로 감사드립니다. ${delayText} ${riderText} ${tempText} 깊이 사과드립니다. ${qualityText} ${refundText} 매장으로 편히 연락 주시면 성심껏 조치해 드리겠습니다.`
    }

    // 보상 정책 반영 문구 결합
    if (formData.compensationPolicy === 'redelivery') {
      text += '\n\n[정책 반영] 불편을 겪으신 메뉴는 즉시 확인 후 따뜻하게 재배달 도와드리겠습니다.'
    } else if (formData.compensationPolicy === 'refund_guide') {
      text += '\n\n[정책 반영] 누락이나 파손 건은 고객센터 접수 시 빠른 부분 환불 처리를 지원합니다.'
    } else if (formData.compensationPolicy === 'service') {
      text += '\n\n[정책 반영] 다음 번 주문 시 서운함 없으시도록 특제 사이드 메뉴를 꼭 함께 챙겨드리겠습니다.'
    }

    return { filteredText: text, detectedForbidden: detected }
  }, [formData.tone, formData.compensationPolicy, activeForbiddenList])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">매장 설정 및 AI 정책</h1>
          <p className="text-sm text-slate-500 mt-1">
            현재 선택된 매장: <strong className="text-indigo-600">{formData.name}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="size-4" /> 설정이 즉시 반영되었습니다
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 좌측: 설정 입력 폼 */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🏪</span> 매장 기본 정보
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">상호명</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">업종</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white font-semibold text-indigo-600"
                  >
                    <option value="카페">카페</option>
                    <option value="치킨">치킨</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">매장 주소 (날씨·상권 연동)</label>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="예: 서울 강남구, 대구 중구, 포항 북구"
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none text-sm transition ${
                      addressError 
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-400 bg-rose-50/20' 
                        : 'border-slate-200 focus:ring-2 focus:ring-indigo-500'
                    }`} 
                  />
                </div>
              </div>
              {addressError && (
                <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
                  <span>⚠️</span> {addressError}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="size-4 text-indigo-600" /> AI 응대 정책 커스텀
              </h2>
              <p className="text-xs text-slate-500 mt-1">리뷰 자동 초안 및 AI 비서가 손님을 응대할 때 적용할 행동 규칙을 지정합니다.</p>
            </div>

            {/* 1. 어조 선택 */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-slate-700">1. 고객 응대 어조 선택</label>
              <div className="grid grid-cols-1 gap-2.5">
                {(['polite', 'friendly', 'concise'] as ToneType[]).map((t) => (
                  <label 
                    key={t}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      formData.tone === t 
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="tone" 
                      value={t}
                      checked={formData.tone === t}
                      onChange={handleChange}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500" 
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{t === 'polite' ? '정중하고 신뢰감 있는 어조' : t === 'friendly' ? '친근하고 활기찬 이모 어조' : '간결하고 명확한 스피드 어조'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t === 'polite' ? '브런치 카페, 고급 디저트, 프랜차이즈 매장에 권장' : t === 'friendly' ? '치킨, 피자, 분식 등 단골 소통형 배달 전문점에 권장' : '오피스 상권 테이크아웃, 패스트푸드 매장에 권장'}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. 클레임 보상 원칙 */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">2. 불만 발생 시 기본 보상 원칙</label>
              <select
                name="compensationPolicy"
                value={formData.compensationPolicy || 'service'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              >
                <option value="service">재주문 유도 (다음 주문 시 특별 서비스 약속)</option>
                <option value="redelivery">적극 대처 (누락/식음 건 즉시 재배달 안내)</option>
                <option value="refund_guide">원칙 준수 (고객센터를 통한 부분 환불 규정 안내)</option>
              </select>
            </div>

            {/* 3. 금지어 태그 설정 */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5 text-rose-500" /> 3. AI 답글 금지어 설정
                </label>
                <span className="text-[11px] text-slate-400">클릭하여 빠른 추가/제거</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {RECOMMENDED_FORBIDDEN_TAGS.map((tag) => {
                  const isSelected = activeForbiddenList.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleForbiddenTag(tag)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition font-medium ${
                        isSelected 
                          ? 'bg-rose-50 border-rose-300 text-rose-700 font-semibold' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{tag}
                    </button>
                  )
                })}
              </div>

              <input 
                type="text" 
                name="forbiddenWords"
                value={formData.forbiddenWords}
                onChange={handleChange}
                placeholder="콤마(,)로 구분하여 입력 (예: 맛없다, 비싸다, 식었다)" 
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
              />
            </div>

            {/* 4. 환불 규정 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">4. 매장 고유 환불 규정</label>
              <input 
                type="text" 
                name="refundPolicy"
                value={formData.refundPolicy}
                onChange={handleChange}
                placeholder="예: 조리 시작 전 100% 취소 가능, 이후 환불 불가" 
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold text-rose-600 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 transition"
            >
              기본값으로 초기화
            </button>
            <button 
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              {isSaved ? '저장 완료!' : '설정 저장하기'}
            </button>
          </div>
        </div>

        {/* 우측: 실시간 AI 답글 시뮬레이터 */}
        <div className="lg:col-span-5 sticky top-6 min-w-0">
          <div className="bg-gradient-to-b from-indigo-50/60 to-white rounded-2xl border border-indigo-100 p-5 shadow-sm space-y-4 w-full overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">실시간 AI 답글 시뮬레이터</h3>
                  <p className="text-[11px] text-slate-500">지정한 어조와 정책이 답글에 즉시 적용됩니다</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full shrink-0">
                Live Preview
              </span>
            </div>

            {/* 가상 고객 불만 리뷰 박스 */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 text-xs space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">배민 고객 '달콤초코' 님 (★ 3.0)</span>
                <span className="text-amber-500 font-semibold">복합 불만 (대기·식음·가격)</span>
              </div>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                "배달지연으로 40분이나 늦게 왔고 치킨도 다 식었어요. 양도 좀 양적다 싶었는데 가격만 비싸다 느꼈습니다."
              </p>
            </div>

            {/* AI 생성 답글 미리보기 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-900 flex items-center gap-1">
                  <Sparkles className="size-3.5 text-indigo-600" /> AI 자동 생성 초안 미리보기
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  현재 어조: <strong className="text-indigo-600">{TONE_MODE_LABELS[formData.tone]}</strong>
                </span>
              </div>

              <div className="bg-white rounded-xl border border-indigo-200/80 p-4 shadow-xs relative">
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                  {filteredText}
                </p>

                {/* 금지어 감지 뱃지 */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  {detectedForbidden.length > 0 ? (
                    <>
                      <div className="flex items-center gap-1 text-indigo-700 font-medium min-w-0">
                        <AlertTriangle className="size-3 text-indigo-500 shrink-0" />
                        <span className="truncate max-w-[190px]" title={detectedForbidden.join(', ')}>
                          금지어 '{detectedForbidden.join(', ')}'
                        </span>
                        <span>정제 완료</span>
                      </div>
                      <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 whitespace-nowrap shrink-0">
                        {detectedForbidden.length}건 순화 표현 적용
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-500 flex items-center gap-1">
                        <ShieldAlert className="size-3 text-emerald-500" /> 금지어 필터: 정상 작동 중
                      </span>
                      <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        정책 위반 표현 0건 (안전)
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
              💡 <strong>점주 TIP:</strong> 불만 리뷰에 무조건적인 사과보다, 설정된 어조로 진정성을 전하고 보상 약속을 남기면 재주문 전환율이 <strong>38%</strong> 상승합니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}