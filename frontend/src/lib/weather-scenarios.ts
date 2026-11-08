export interface WeatherCondition {
  weather: 'rain' | 'snow' | 'heat' | 'cold' | 'clear';
  title: string;
  conditionText: string;
  badgeText: string;
  actionAdvice: string;
  quickChipText: string;
  botAnswer: string;
}

export const KOREA_REGIONS: Record<string, string[]> = {
  '서울': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  '부산': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
  '대구': ['군위군', '남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
  '인천': ['강화군', '계양구', '미추홀구', '남동구', '동구', '부평구', '서구', '연수구', '옹진군', '중구'],
  '광주': ['광산구', '남구', '동구', '북구', '서구'],
  '대전': ['대덕구', '동구', '서구', '유성구', '중구'],
  '울산': ['남구', '동구', '북구', '울주군', '중구'],
  '세종': ['세종시'],
  '경기': ['수원시', '성남시', '고양시', '용인시', '부천시', '안산시', '안양시', '남양주시', '화성시', '평택시', '의정부시', '시흥시', '파주시', '광명시', '김포시', '군포시', '광주시', '이천시', '양주시', '오산시', '구리시', '안성시', '포천시', '의왕시', '하남시', '여주시', '양평군', '동두천시', '과천시', '가평군', '연천군'],
  '강원': ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군'],
  '충북': ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'],
  '충남': ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군'],
  '전북': ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군'],
  '전남': ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군'],
  '경북': ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군'],
  '경남': ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군'],
  '제주': ['제주시', '서귀포시']
};

export function validateAndParseKoreanAddress(address: string): { isValid: boolean; district: string; branchName: string; errorMsg?: string } {
  if (!address || typeof address !== 'string' || !address.trim()) {
    return { isValid: false, district: '', branchName: '', errorMsg: '주소를 입력해주세요.' };
  }

  const clean = address.trim().replace(/\s+/g, ' ');
  const tokens = clean.split(' ');

  const normalizeProvince = (p: string) => {
    if (p.startsWith('서울')) return '서울';
    if (p.startsWith('부산')) return '부산';
    if (p.startsWith('대구')) return '대구';
    if (p.startsWith('인천')) return '인천';
    if (p.startsWith('광주')) return '광주';
    if (p.startsWith('대전')) return '대전';
    if (p.startsWith('울산')) return '울산';
    if (p.startsWith('세종')) return '세종';
    if (p.startsWith('경기')) return '경기';
    if (p.startsWith('강원')) return '강원';
    if (p.startsWith('충청북도') || p.startsWith('충북')) return '충북';
    if (p.startsWith('충청남도') || p.startsWith('충남')) return '충남';
    if (p.startsWith('전라북도') || p.startsWith('전북')) return '전북';
    if (p.startsWith('전라남도') || p.startsWith('전남')) return '전남';
    if (p.startsWith('경상북도') || p.startsWith('경북')) return '경북';
    if (p.startsWith('경상남도') || p.startsWith('경남')) return '경남';
    if (p.startsWith('제주')) return '제주';
    return null;
  };

  if (clean.includes('포항')) {
    if (clean.includes('북구') || clean.includes('북')) return { isValid: true, district: '경북 포항 북구', branchName: '포항 북구점' };
    if (clean.includes('남구') || clean.includes('남')) return { isValid: true, district: '경북 포항 남구', branchName: '포항 남구점' };
    return { isValid: false, district: '', branchName: '', errorMsg: '포항시는 "포항 북구" 또는 "포항 남구"로 구를 함께 명시해주세요.' };
  }

  if (clean.includes('창원')) {
    const changwonDistricts = ['의창구', '성산구', '마산합포구', '마산회원구', '진해구'];
    for (const d of changwonDistricts) {
      if (clean.includes(d) || clean.includes(d.replace('구', ''))) {
        return { isValid: true, district: `경남 창원 ${d}`, branchName: `창원 ${d}점` };
      }
    }
    return { isValid: false, district: '', branchName: '', errorMsg: '창원시는 상세 구를 함께 명시해주세요.' };
  }

  const province = normalizeProvince(tokens[0]);
  if (province) {
    const rest = tokens.slice(1).join(' ').trim();
    if (!rest) return { isValid: false, district: '', branchName: '', errorMsg: `'${tokens[0]}' 뒤에 구/시/군 명칭을 함께 입력해주세요.` };

    const validSubRegions = KOREA_REGIONS[province];
    for (const validSub of validSubRegions) {
      const pureSub = validSub.replace(/[시|구|군]$/, '');
      if (rest.startsWith(validSub) || rest.startsWith(pureSub) || rest.includes(validSub) || rest.includes(pureSub)) {
        return { isValid: true, district: `${province} ${validSub}`, branchName: `${validSub}점` };
      }
    }
    return { isValid: false, district: '', branchName: '', errorMsg: `'${province}'에는 '${rest}'(이)라는 구/군/시가 존재하지 않습니다.` };
  }

  for (const [prov, subList] of Object.entries(KOREA_REGIONS)) {
    for (const sub of subList) {
      const pureSub = sub.replace(/[시|구|군]$/, '');
      if (clean === sub || clean === pureSub || clean.startsWith(sub) || clean.startsWith(pureSub)) {
        return { isValid: true, district: `${prov} ${sub}`, branchName: `${sub}점` };
      }
    }
  }

  return { isValid: false, district: '', branchName: '', errorMsg: '올바른 대한민국 지역 주소가 아닙니다. (예: 대구 중구, 대구 수성구)' };
}

// 🌤️ 매장별 날씨 시나리오 (치킨집 0번: 우천 / 카페 0번: 폭염)
export const STORE_WEATHER_SCENARIOS: Record<string, WeatherCondition[]> = {
  // 1. 치킨 전문점 (대구 수성구점) ➔ 기본 0번: 🌧️ 우천
  chicken: [
    {
      weather: 'rain',
      title: '실시간 날씨 맞춤 브리핑',
      conditionText: '{location} 비 소식이 있어요 (강수 확률 85%)',
      badgeText: '🌧️ 우천 주의보',
      actionAdvice: '비 오는 날은 배달 주문이 평소보다 35% 늘어납니다. 라이더 배차 시간을 미리 10분 늘려 잡으세요.',
      quickChipText: '🌧️ 비 오는 날 배달·매출 증대 팁',
      botAnswer: '지난 6개월 데이터를 보면 비 오는 날 치킨 배달 주문이 평균 35% 급증해요!\n\n1. 피크타임 전 "비 오는 날 배달비 1천원 지원" 쿠폰을 미리 세팅하세요.\n2. 눅눅해짐 방지를 위해 치킨 박스 숨구멍 패키징을 점검하세요.\n3. 예상 조리·배달 시간을 미리 10분 넉넉하게 걸어두면 지연 불만을 방지할 수 있습니다.'
    },
    {
      weather: 'heat',
      title: '실시간 날씨 맞춤 브리핑',
      conditionText: '{location} 기온 34℃ 폭염 경보 발령',
      badgeText: '🔥 폭염 경보',
      actionAdvice: '더운 날씨로 야간 야식 및 생맥주 주문이 집중됩니다. 냉장고 재고를 확보하세요.',
      quickChipText: '🔥 폭염 야식 주문 공략 팁',
      botAnswer: '기온이 30도를 넘으면 저녁 8시 이후 야식과 주류 매출이 28% 상승합니다!\n\n1. 생맥주 1,000cc + 치킨 콤보 메뉴를 배민 대표 메뉴로 올려두세요.\n2. 치킨 무와 음료를 평소보다 1.5배 시원하게 냉장 보관하세요.'
    },
    {
      weather: 'snow',
      title: '실시간 날씨 맞춤 브리핑',
      conditionText: '{location} 대설 주의보 (적설량 3cm 예상)',
      badgeText: '❄️ 폭설 주의',
      actionAdvice: '빙판길로 인해 배달 대행사 배차가 지연될 수 있습니다. 포장 주문 혜택을 강화하세요.',
      quickChipText: '❄️ 폭설 대비 매장 운영 팁',
      botAnswer: '눈이 오면 라이더 배차가 평소보다 2배 이상 지연됩니다!\n\n1. 배달 가능 반경을 1.5km 이내로 일시 축소 권장합니다.\n2. "포장 방문 시 2,000원 할인"을 앱 상단에 걸어 픽업 고객을 유도하세요.\n3. 매장 입구 미끄럼 방지 매트를 점검하세요.'
    }
  ],

  // 2. 카페 (대구 중구 동성로본점) ➔ 기본 0번: ☀️ 폭염
  cafe: [
    {
      weather: 'heat',
      title: '실시간 날씨 맞춤 브리핑',
      conditionText: '{location} 기온 35℃ 체감 폭염 특보',
      badgeText: '☀️ 폭염 특보',
      actionAdvice: '시원한 에이드와 대용량 1L 아이스 아메리카노 테이크아웃 수요가 급증합니다.',
      quickChipText: '🥤 폭염 특수 얼음·음료 전략',
      botAnswer: '폭염 날씨에는 1인 1음료 외에 대용량 테이크아웃 수요가 50% 늘어납니다!\n\n1. 제빙기 얼음 생산 속도를 체크하고 필요시 식용 얼음을 미리 확보하세요.\n2. 수박 주스, 청포도 에이드 등 갈증 해소형 과일 음료 배너를 걸어두세요.'
    },
    {
      weather: 'rain',
      title: '실시간 날씨 맞춤 브리핑',
      conditionText: '{location} 잔잔한 비 (강수 확률 70%)',
      badgeText: '🌧️ 잔잔한 비',
      actionAdvice: '매장 내 체류 시간이 길어집니다. 따뜻한 드립 커피와 디저트 세트를 추천하세요.',
      quickChipText: '☕ 비 오는 날 카페 매출 팁',
      botAnswer: '비 오는 날은 디저트 페어링(케이크+따뜻한 음료) 주문 비중이 42%까지 증가합니다!\n\n1. "비 내리는 날 전용 플레이리스트"로 매장 분위기를 차분하게 연출하세요.\n2. 따뜻한 라떼류와 구움과자 세트를 매장 입구 및 배민 첫 화면에 배치하세요.'
    },
    {
      weather: 'cold',
      title: '실시간 날씨 맞춤 브리핑',
      conditionText: '{location} 현재 체감 기온 영하 5℃ 한파 특보',
      badgeText: '🧊 강추위',
      actionAdvice: '따뜻한 시그니처 핫음료 수요가 폭증합니다. 스팀 밀크 재고를 넉넉히 확인하세요.',
      quickChipText: '🧣 한파 대비 메뉴 추천 팁',
      botAnswer: '영하권 날씨에는 아이스 메뉴 비중이 70%에서 25%로 급감합니다!\n\n1. 수제 뱅쇼, 핫초코, 밀크티 등 시즌 온음료를 카운터 중앙에 강조하세요.\n2. 매장 난방 온도를 22도로 유지하고 무릎담요를 카운터에 비치하세요.'
    }
  ]
};

export function sanitizeStoreKey(input: any): string {
  if (typeof input === 'string') return input.trim();
  if (input && typeof input === 'object') {
    if (typeof input.detail === 'string') return input.detail.trim();
    if (typeof input.storeId === 'string') return input.storeId.trim();
    if (typeof input.id === 'string') return input.id.trim();
  }
  if (typeof window !== 'undefined') {
    const fromStorage = localStorage.getItem('localmate_store_id');
    if (fromStorage && typeof fromStorage === 'string') return fromStorage;
  }
  return 'cafe';
}

export function getSavedStoreLocation(storeKey?: any): { district: string; branchName: string } {
  const safeKey = sanitizeStoreKey(storeKey);
  const isChicken = safeKey.includes('chicken') || safeKey.includes('치킨');
  const normalizedKey = isChicken ? 'chicken' : 'cafe';

  const defaultDistrict = normalizedKey === 'chicken' ? '대구 수성구' : '대구 중구';
  const defaultBranch = normalizedKey === 'chicken' ? '수성구점' : '동성로본점';

  if (typeof window === 'undefined') {
    return { district: defaultDistrict, branchName: defaultBranch };
  }

  let rawAddress = '';
  const directAddress = localStorage.getItem(`localmate_address_${normalizedKey}`);
  if (directAddress && directAddress.trim()) {
    rawAddress = directAddress.trim();
  } else {
    const savedSettings = localStorage.getItem(`localmate_settings_${normalizedKey}`);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.address && parsed.address.trim()) {
          rawAddress = parsed.address.trim();
        }
      } catch (e) {}
    }
  }

  // 예전 잘못된 주소(부산 남구, 대구 동구 등) 강제 필터링
  if (rawAddress) {
    if (normalizedKey === 'chicken' && rawAddress.includes('부산')) {
      rawAddress = '대구 수성구 범어동 45';
      localStorage.setItem(`localmate_address_chicken`, rawAddress);
    }
    if (normalizedKey === 'cafe' && (rawAddress.includes('동구') || rawAddress.includes('부산'))) {
      rawAddress = '대구 중구 동성로 12';
      localStorage.setItem(`localmate_address_cafe`, rawAddress);
    }

    const parsed = validateAndParseKoreanAddress(rawAddress);
    if (parsed.isValid) {
      return { 
        district: parsed.district, 
        branchName: normalizedKey === 'cafe' && parsed.district.includes('중구') ? '동성로본점' : parsed.branchName 
      };
    }
  }

  return { district: defaultDistrict, branchName: defaultBranch };
}

// 📍 매장별 분리 날씨 반환 (카페=폭염, 치킨=우천)
export function getCurrentWeatherScenario(storeNameOrId?: any): WeatherCondition {
  const safeKey = sanitizeStoreKey(storeNameOrId);
  const isChicken = safeKey.includes('치킨') || safeKey.includes('chicken');
  const storeKey = isChicken ? 'chicken' : 'cafe';
  const scenarios = STORE_WEATHER_SCENARIOS[storeKey];

  let slotIndex = 0;
  if (typeof window !== 'undefined') {
    const storeWeather = localStorage.getItem(`localmate_weather_index_${storeKey}`);
    if (storeWeather !== null) {
      slotIndex = parseInt(storeWeather, 10) || 0;
    } else {
      // 기본적으로 0번 (치킨=우천, 카페=폭염)으로 고정되어 서로 완전히 다름
      slotIndex = 0;
    }
  }

  const baseScenario = scenarios[slotIndex % scenarios.length];
  const { district } = getSavedStoreLocation(storeKey);

  return {
    ...baseScenario,
    conditionText: baseScenario.conditionText.replace('{location}', district),
  };
}

export function setStoreWeatherIndex(storeKey: 'cafe' | 'chicken', index: number) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`localmate_weather_index_${storeKey}`, index.toString());
    window.dispatchEvent(new CustomEvent('weatherChange', { detail: { storeKey, index } }));
    window.dispatchEvent(new CustomEvent('storeChange', { detail: storeKey }));
  }
}