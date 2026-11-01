import { useState } from 'react'

export function SettingsView() {
  const [profile, setProfile] = useState({
    storeName: '☕ 동성로 카페 (본점)',
    businessType: 'CAFE',
    address: '서울특별시 동작구 동작대로 123'
  })
  
  const [policy, setPolicy] = useState({
    tone: '정중하고 친절한 어조',
    prohibitedWords: '금지어 예시: 욕설, 비방, 허위 정보',
    refundPolicy: '환불 정책 설명: 1시간 이내 취소 시 전액 환불'
  })

  const handleSave = () => {
    // 저장 로직
    alert('설정이 성공적으로 저장되었습니다.')
  }

  const handleReset = () => {
    // 초기화 로직
    if (confirm('데모 시드 데이터를 초기화하시겠습니까?')) {
      alert('데이터가 초기화되었습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-4 md:px-6 py-6 flex flex-col gap-6 pb-28">
        {/* 매장 기본 프로필 */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">매장 기본 프로필</h2>
          <p className="text-xs text-muted-foreground mt-0.5">매장 정보를 수정하세요</p>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">상호명</label>
              <input
                type="text"
                value={profile.storeName}
                onChange={(e) => setProfile({...profile, storeName: e.target.value})}
                className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">업종</label>
              <select
                value={profile.businessType}
                onChange={(e) => setProfile({...profile, businessType: e.target.value as 'CAFE' | 'SALON'})}
                className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CAFE">카페</option>
                <option value="SALON">헤어살롱</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">주소</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
                className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
        
        {/* AI 응대 정책 설정 */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">AI 응대 정책 설정</h2>
          <p className="text-xs text-muted-foreground mt-0.5">AI 응대 방식을 설정하세요</p>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">응대 어조 선택</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tone"
                    value="정중하고 친절한 어조"
                    checked={policy.tone === '정중하고 친절한 어조'}
                    onChange={(e) => setPolicy({...policy, tone: e.target.value})}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm">정중하고 친절한 어조</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tone"
                    value="단골집 이모 어조"
                    checked={policy.tone === '단골집 이모 어조'}
                    onChange={(e) => setPolicy({...policy, tone: e.target.value})}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm">단골집 이모 어조</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">금지어 설정</label>
              <textarea
                value={policy.prohibitedWords}
                onChange={(e) => setPolicy({...policy, prohibitedWords: e.target.value})}
                className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">환불 정책</label>
              <textarea
                value={policy.refundPolicy}
                onChange={(e) => setPolicy({...policy, refundPolicy: e.target.value})}
                className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>
          </div>
        </div>
        
        {/* 저장 및 초기화 버튼 */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition"
          >
            데모 시드 데이터 초기화
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
          >
            설정 저장
          </button>
        </div>
      </main>
    </div>
  )
}