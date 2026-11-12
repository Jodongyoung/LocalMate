'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Upload, 
  Send, 
  CheckCircle2, 
  RefreshCw, 
  RotateCcw,
  Copy,
  Check,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Bookmark
} from 'lucide-react';

type ChannelType = 'facebook' | 'instagram' | 'naver_cafe';

interface StoreInfo {
  id: string;
  name: string;
  category: string;
  address: string;
}

interface WeatherInfo {
  type: 'heatwave' | 'rain';
  badge: string;
  condition: string;
  tip: string;
  temp: string;
  region: string;
}

// 주소 문자열에서 핵심 지역명(시/도 + 구/군) 파싱 함수
const parseRegionName = (address: string): string => {
  if (!address || address.trim() === '') return '우리동네';
  
  const tokens = address.trim().split(/\s+/);
  if (tokens.length >= 2) {
    const city = tokens[0].replace(/(특별시|광역시|특별자치시)/, '');
    const district = tokens[1];
    return `${city} ${district}`;
  }
  return tokens[0];
};

// 실시간 날씨 규칙 (입력된 실제 주소 기반 동적 연동)
const getWeatherContext = (storeId: string, address: string): WeatherInfo => {
  const region = parseRegionName(address);

  if (storeId === 'chicken' || address.includes('수성') || address.includes('남구')) {
    return {
      type: 'heatwave',
      badge: '🔥 폭염 특화 이벤트',
      condition: `${region} 기온 34℃ 폭염 경보 발령`,
      tip: '무더운 날씨로 시원한 생맥주와 야식 배달 주문이 급증합니다.',
      temp: '34°C',
      region
    };
  }
  return {
    type: 'rain',
    badge: '🌧️ 우천 한정 혜택',
    condition: `${region} 잔잔한 비 (강수 확률 70%)`,
    tip: '매장 내 체류 시간이 길어집니다. 따뜻한 드립 커피와 디저트를 추천하세요.',
    temp: '14°C',
    region
  };
};

// 동네 상권 밀착형 10~15개 풍성한 로컬 해시태그 자동 추출 엔진
const generateLocalHashtags = (region: string, storeName: string, category: string, isHeat: boolean): string => {
  const cleanStore = storeName.replace(/[^\w\s가-힣]/g, '').trim().replace(/\s+/g, '');
  const cleanRegion = region.replace(/\s+/g, '');
  
  const baseStoreTags = [
    `#${cleanRegion}맛집`,
    `#${cleanRegion}핫플`,
    `#${cleanStore}`,
    `#동네맛집`,
    `#로컬맛집`,
    `#단골맛집`
  ];

  const weatherTags = isHeat 
    ? ['#폭염주의보', '#열대야탈출', '#시원한생맥주', '#치맥스타그램', '#야식배달', '#더위사냥']
    : ['#비오는날', '#빗소리', '#감성카페', '#디저트맛집', '#따뜻한커피', '#우천이벤트'];

  const menuTags = category.includes('치킨')
    ? ['#치킨맛집', '#겉바속촉', '#치즈볼맛집']
    : ['#크로플맛집', '#핸드드립', '#디저트카페'];

  const combined = [...baseStoreTags, ...weatherTags, ...menuTags];
  return combined.join(' ');
};

// 매장별 기본 프리셋
const STORE_PRESETS = {
  cafe: {
    preset1: {
      name: '크로플',
      icon: '🧇',
      image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80',
      defaultKeyword: '음료 주문 시 미니 크로플 무료 증정',
      defaultTitle: '비 오는 날 달콤 바삭 크로플 선물 🧇'
    },
    preset2: {
      name: '드립커피',
      icon: '☕',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      defaultKeyword: '디저트 페어링 시 드립커피 1,000원 할인',
      defaultTitle: '빗소리와 함께 즐기는 따뜻한 핸드드립 ☕'
    }
  },
  chicken: {
    preset1: {
      name: '바삭치킨',
      icon: '🍗',
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
      defaultKeyword: '치킨 한 마리 주문 시 생맥주 1잔 50% 반값',
      defaultTitle: '34도 열대야 탈출! 시원한 치맥 파티 🍗🍺'
    },
    preset2: {
      name: '쫀득치즈볼',
      icon: '🧀',
      image: 'https://images.pexels.com/photos/34692571/pexels-photo-34692571.jpeg?auto=compress&cs=tinysrgb&w=600',
      defaultKeyword: '세트 주문 시 겉바속쫀 모짜렐라 치즈볼 4알 무료',
      defaultTitle: '갓 튀겨 겉바속쫀 치즈볼 증정 이벤트 🧀'
    }
  }
};

// 본문 멘트 생성 함수 (페이스북 · 인스타그램 · 네이버 카페)
const buildChannelPosts = (bodyKeyword: string, store: StoreInfo, weatherInfo: WeatherInfo) => {
  const isHeat = weatherInfo.type === 'heatwave';
  const cleanWord = bodyKeyword.trim() || '특가 할인 혜택';
  const cleanStoreName = store.name.replace(/[^\w\s가-힣]/g, '').trim();
  const hashtags = generateLocalHashtags(weatherInfo.region, store.name, store.category, isHeat);

  if (isHeat) {
    const facebookPool = [
      `여러분 오늘 ${weatherInfo.region} 기온이 34도까지 치솟아 정말 푹푹 찌네요! 🥵\n\n지친 저녁 시원하게 힐링하시라고, 오늘 저희 ${cleanStoreName}에서 페이지 팔로워분들을 위해 [${cleanWord}]을 시원하게 준비했습니다! ❄️\n\n퇴근길에 들르시거나 배달 주문 주실 때 "페이스북 보고 왔어요" 남겨주시면 사장님이 정성껏 챙겨드릴게요 :) 시원한 저녁 보내세요! 🍺`,
      `${weatherInfo.region} 분들 오늘 날씨 실화인가요? ☀️ 34도 폭염에 숨이 턱턱 막히네요 💦\n\n오늘 저녁은 불 앞에서 요리하지 마시고 편하게 드시라고, 페이스북 페이지 전용으로 [${cleanWord}] 깜짝 혜택 팍팍 쏩니다!\n\n주문서 요청사항에 "페이스북 보고 왔어요" 적어주시면 서비스 든든하게 넣어드릴게요 🍗 시원하게 치맥 한잔하세요!`,
      `폭염주의보 발령! ${weatherInfo.region} 주민분들 오늘처럼 무더운 날엔 시원한 야식이 최고죠 🔥\n\n지치신 고객분들의 활력을 위해 오늘 하루 [${cleanWord}] 이벤트를 전격 진행합니다!\n\n모두 더위 조심하시고, 매장 오셔서 편하게 혜택 누려보세요 💙`
    ];

    const instaPool = [
      `Beat the Heat! 🔥 ${weatherInfo.region} 역대급 폭염주의보 34℃ 발령 ☀️\n\n이렇게 푹푹 찌는 날씨엔 에어컨 빵빵한 곳에서 힐링이 진리!\n오늘 단 하루, 매장을 찾아주시는 분들을 위해 [${cleanWord}] 쏩니다 💛\n\n시원하고 바삭한 행복 충전하고 가세요 ✨\n.\n.\n${hashtags}`,
      `SUMMER SPECIAL 🌊 34도 열대야 완벽 타파!\n\n오늘 밤 야식은 무조건 이거다! 🍗🍺\n지금 주문/방문하시면 [${cleanWord}] 혜택이 쏟아집니다 ❄️\n\n친구, 가족과 함께 시원한 치맥 파티 즐기세요 💛\n.\n.\n${hashtags}`
    ];

    const naverCafePool = [
      `[이벤트 공지] ${cleanStoreName} 폭염 극복 카페 회원 감사 깜짝 프로모션\n\n안녕하세요, ${cleanStoreName}입니다.\n${weatherInfo.region}에 연일 이어지는 34도 무더위에도 찾아주시는 카페 회원님들께 보답하고자 금일 특별 행사를 진행합니다.\n\n■ 프로모션 내용: ${cleanWord}\n■ 적용 시간: 금일 영업 마감 시까지\n■ 참여 방법: 방문 및 주문 시 "네이버 카페 보고 왔어요" 말씀해 주세요!\n\n매장 내 에어컨을 쾌적하게 가동 중이오니 편안하게 방문해 주세요. 감사합니다.`,
      `[회원 혜택] 34℃ 폭염 대비 카페 회원님들을 위한 특별 혜택 안내\n\n무더위 속에서도 저희 매장을 믿고 주문해 주시는 카페 회원분들을 위해 금일 한정 [${cleanWord}] 프로모션을 진행합니다.\n\n항상 청결하고 신선한 재료로 정성을 다해 보답하겠습니다.`
    ];

    return {
      facebook: facebookPool[Math.floor(Math.random() * facebookPool.length)],
      instagram: instaPool[Math.floor(Math.random() * instaPool.length)],
      naver_cafe: naverCafePool[Math.floor(Math.random() * naverCafePool.length)]
    };
  } else {
    const facebookPool = [
      `여러분 오늘 ${weatherInfo.region}에 비가 꽤 많이 내리고 있네요 ☔\n\n쌀쌀하고 궂은 날씨에 찾아주시는 고객분들께 감사한 마음을 담아, 오늘 하루 [${cleanWord}]을 넉넉하게 챙겨드립니다! :)\n\n매장 오셔서 "페이스북 보고 왔어요"라고 살짝 말씀해 주세요 💙 빗길 조심하세요!`,
      `비 오는 날 특유의 빗소리가 참 좋은 하루입니다 🌧️\n\n따뜻하고 달콤한 힐링이 필요하신 ${weatherInfo.region} 분들을 위해 오늘 [${cleanWord}] 선물을 준비했습니다!\n\n방문이나 주문 주실 때 페이스북 보고 왔다고 꼭 알려주세요 💛`,
      `오늘처럼 비 오는 날엔 따뜻한 향기와 음악이 있는 매장으로 놀러오세요 ☕\n\n페이지 팔로워분들을 위해 준비한 당일 한정 [${cleanWord}] 혜택으로 소소한 행복을 선물합니다 ✨`
    ];

    const instaPool = [
      `Rainy Day Mood 🌧️ 감성 가득한 비 오는 날 ✨\n\n창밖 빗소리와 함께 즐기는 특별한 행복!\n오늘 하루 매장에 들러주시는 분들을 위해 [${cleanWord}]을 깜짝 준비했습니다 💛\n\n따뜻하고 달콤한 시간 보내고 가세요 ✨\n.\n.\n${hashtags}`,
      `빗소리 가득한 날, 기분 좋은 힐링 타임 ☔\n\n비 오는 날 방문 고객님들을 위한 깜짝 이벤트!\n달콤한 디저트와 함께 [${cleanWord}] 혜택 챙겨가세요 ☕🍰\n.\n.\n${hashtags}`
    ];

    const naverCafePool = [
      `[이벤트 공지] 우천 기념 카페 회원 감사 프로모션 안내\n\n안녕하세요, ${cleanStoreName}입니다.\n비 오는 날에도 저희 매장을 찾아주시는 ${weatherInfo.region} 카페 회원 여러분을 위해 당일 한정 프로모션을 진행합니다.\n\n■ 특별 혜택: ${cleanWord}\n■ 적용 기간: 금일 영업 종료 시까지\n■ 참여 방법: 주문 시 "네이버 카페 보고 왔어요"라고 알려주세요!\n\n항상 정성을 다해 준비하겠습니다. 감사합니다.`,
      `[회원 혜택] 비 오는 날 매장 방문 카페 회원 특별 이벤트 안내\n\n궂은 날씨에 발걸음해 주시는 카페 회원님들께 감사한 마음을 담아 [${cleanWord}] 증정 혜택을 진행합니다. 아늑한 매장에서 편안한 시간 보내세요.`
    ];

    return {
      facebook: facebookPool[Math.floor(Math.random() * facebookPool.length)],
      instagram: instaPool[Math.floor(Math.random() * instaPool.length)],
      naver_cafe: naverCafePool[Math.floor(Math.random() * naverCafePool.length)]
    };
  }
};

// 카드뉴스 헤드라인 생성 함수
const buildRefinedTitle = (rawTitle: string, weatherInfo: WeatherInfo) => {
  const isHeat = weatherInfo.type === 'heatwave';
  const titleText = rawTitle.trim();

  if (!titleText) {
    return isHeat ? '34도 열대야 탈출! 시원한 깜짝 특가 🔥' : '비 오는 날 더 특별한 감성 힐링 선물 🌧️';
  }

  if (isHeat) {
    const heatTemplates = [
      `🚨 34도 폭염 특보! [${titleText}] 🔥`,
      `열대야 싹 날린다! ${titleText} ❄️🍺`,
      `오늘 무더위 극복 찬스, ${titleText}! 🍗`,
      `🚨 마감 임박! [${titleText}] ☀️`
    ];
    return heatTemplates[Math.floor(Math.random() * heatTemplates.length)];
  } else {
    const rainTemplates = [
      `🌧️ 빗길 조심! [${titleText}] ☔`,
      `비 오는 날 달콤한 찬스, ${titleText}! 🧇`,
      `오늘 우천 한정 선물! [${titleText}] 💛`,
      `빗소리와 함께 즐기는 [${titleText}] ☕`
    ];
    return rainTemplates[Math.floor(Math.random() * rainTemplates.length)];
  }
};

export function MarketingView() {
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>('facebook');

  // 활성 매장 및 주소 로드
  const getInitialStore = (): StoreInfo => {
    const storeId = typeof window !== 'undefined' ? (localStorage.getItem('localmate_store_id') || 'cafe') : 'cafe';
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`localmate_settings_${storeId}`) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          id: storeId,
          name: parsed.name || (storeId === 'cafe' ? '☕ 동성로 카페 (본점)' : '🍗 수성 치킨 (지점)'),
          category: storeId === 'cafe' ? '카페/디저트' : '치킨/패스트푸드',
          address: parsed.address || (storeId === 'cafe' ? '대구 중구 동성로 123' : '부산 남구 대연동 45')
        };
      } catch (e) {}
    }
    return storeId === 'cafe'
      ? { id: 'cafe', name: '☕ 동성로 카페 (본점)', category: '카페/디저트', address: '대구 중구 동성로 123' }
      : { id: 'chicken', name: '🍗 수성 치킨 (지점)', category: '치킨/패스트푸드', address: '부산 남구 대연동 45' };
  };

  const [currentStore, setCurrentStore] = useState<StoreInfo>(getInitialStore);
  const weather = getWeatherContext(currentStore.id, currentStore.address);
  const currentPresetGroup = currentStore.id === 'cafe' ? STORE_PRESETS.cafe : STORE_PRESETS.chicken;

  const [keyword, setKeyword] = useState<string>(currentPresetGroup.preset1.defaultKeyword);
  const [bannerTitle, setBannerTitle] = useState<string>(currentPresetGroup.preset1.defaultTitle);
  const [selectedImage, setSelectedImage] = useState<string>(currentPresetGroup.preset1.image);
  const [combinedImage, setCombinedImage] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ [key in ChannelType]?: boolean }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // 채널별 AI 본문 멘트
  const [generatedPosts, setGeneratedPosts] = useState<{ [key in ChannelType]?: string }>(() => {
    const initialStore = getInitialStore();
    const initialWeather = getWeatherContext(initialStore.id, initialStore.address);
    const initialPreset = initialStore.id === 'cafe' ? STORE_PRESETS.cafe.preset1 : STORE_PRESETS.chicken.preset1;
    return buildChannelPosts(initialPreset.defaultKeyword, initialStore, initialWeather);
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 매장 설정 및 매장 전환 동기화
  const reloadStoreData = useCallback((targetStoreId?: string) => {
    const storeId = targetStoreId || localStorage.getItem('localmate_store_id') || 'cafe';
    const saved = localStorage.getItem(`localmate_settings_${storeId}`);
    let updatedStore: StoreInfo;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        updatedStore = {
          id: storeId,
          name: parsed.name || (storeId === 'cafe' ? '☕ 동성로 카페 (본점)' : '🍗 수성 치킨 (지점)'),
          category: storeId === 'cafe' ? '카페/디저트' : '치킨/패스트푸드',
          address: parsed.address || (storeId === 'cafe' ? '대구 중구 동성로 123' : '부산 남구 대연동 45')
        };
      } catch {
        updatedStore = storeId === 'cafe'
          ? { id: 'cafe', name: '☕ 동성로 카페 (본점)', category: '카페/디저트', address: '대구 중구 동성로 123' }
          : { id: 'chicken', name: '🍗 수성 치킨 (지점)', category: '치킨/패스트푸드', address: '부산 남구 대연동 45' };
      }
    } else {
      updatedStore = storeId === 'cafe'
        ? { id: 'cafe', name: '☕ 동성로 카페 (본점)', category: '카페/디저트', address: '대구 중구 동성로 123' }
        : { id: 'chicken', name: '🍗 수성 치킨 (지점)', category: '치킨/패스트푸드', address: '부산 남구 대연동 45' };
    }

    const newWeather = getWeatherContext(updatedStore.id, updatedStore.address);
    const preset = updatedStore.id === 'cafe' ? STORE_PRESETS.cafe.preset1 : STORE_PRESETS.chicken.preset1;

    setCurrentStore(updatedStore);
    setKeyword(preset.defaultKeyword);
    setBannerTitle(preset.defaultTitle);
    setSelectedImage(preset.image);
    setUploadStatus({});
    setGeneratedPosts(buildChannelPosts(preset.defaultKeyword, updatedStore, newWeather));
  }, []);

  useEffect(() => {
    const handleStoreChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      reloadStoreData(customEvent.detail);
    };

    const handleSettingsChange = () => {
      reloadStoreData();
    };

    window.addEventListener('storeChange', handleStoreChange);
    window.addEventListener('settingsChange', handleSettingsChange);
    window.addEventListener('storage', handleSettingsChange);

    return () => {
      window.removeEventListener('storeChange', handleStoreChange);
      window.removeEventListener('settingsChange', handleSettingsChange);
      window.removeEventListener('storage', handleSettingsChange);
    };
  }, [reloadStoreData]);

  // AI 생성 버튼 클릭 핸들러
  const handleGenerateAiMarketing = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const newPosts = buildChannelPosts(keyword, currentStore, weather);
      setGeneratedPosts(newPosts);

      const refinedHeadline = buildRefinedTitle(bannerTitle, weather);
      setBannerTitle(refinedHeadline);

      setIsGenerating(false);
    }, 400);
  };

  // 시뮬레이션 초기화 핸들러
  const handleResetSimulation = () => {
    const defaultData = currentStore.id === 'cafe' ? STORE_PRESETS.cafe.preset1 : STORE_PRESETS.chicken.preset1;
    
    setKeyword(defaultData.defaultKeyword);
    setBannerTitle(defaultData.defaultTitle);
    setSelectedImage(defaultData.image);
    setUploadStatus({});
    setSelectedChannel('facebook');
    setGeneratedPosts(buildChannelPosts(defaultData.defaultKeyword, currentStore, weather));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Canvas 카드뉴스 합성
  const generateCardBanner = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedImage;

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;

      ctx.drawImage(img, 0, 0, 600, 600);

      const gradient = ctx.createLinearGradient(0, 220, 0, 600);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.65)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.94)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 600, 600);

      ctx.fillStyle = weather.type === 'heatwave' ? '#DC2626' : '#EA580C';
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(30, 30, 180, 38, 8);
        ctx.fill();
      } else {
        ctx.fillRect(30, 30, 180, 38);
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(weather.badge, 42, 55);

      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(currentStore.name, 35, 470);

      ctx.fillStyle = '#FFFFFF';
      const maxWidth = 530;
      let fontSize = bannerTitle.length > 22 ? 22 : 26;
      ctx.font = `bold ${fontSize}px sans-serif`;

      const words = bannerTitle.split(' ');
      let currentLine = '';
      const lines: string[] = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(currentLine);
          currentLine = words[n] + ' ';
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      const startY = lines.length > 1 ? 515 : 535;
      const lineHeight = fontSize + 8;
      lines.slice(0, 2).forEach((line, index) => {
        ctx.fillText(line.trim(), 35, startY + index * lineHeight);
      });

      setCombinedImage(canvas.toDataURL('image/png'));
    };
  }, [selectedImage, bannerTitle, currentStore.name, weather.badge, weather.type]);

  useEffect(() => {
    generateCardBanner();
  }, [generateCardBanner]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 원클릭 클립보드 복사 핸들러 (navigator.clipboard)
  const handleCopyClipboard = async () => {
    const bodyText = generatedPosts[selectedChannel] || '';
    if (!bodyText) return;

    try {
      await navigator.clipboard.writeText(bodyText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = bodyText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadStatus((prev) => ({ ...prev, [selectedChannel]: true }));
    }, 1200);
  };

  const getDisplayContent = () => {
    const bodyText = generatedPosts[selectedChannel] || '';
    switch (selectedChannel) {
      case 'facebook':
        return { tag: '페이스북 페이지 소식', body: bodyText };
      case 'instagram':
        return { tag: '인스타그램 피드', body: bodyText };
      case 'naver_cafe':
        return { tag: '네이버 카페 게시글', body: bodyText };
    }
  };

  const channelData = getDisplayContent();

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* 상단 타이틀 바 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
              AI 마케팅 자동화
            </span>
            <span className="text-slate-400 text-xs">FR-M01</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">
            날씨·상권 연동 1초 SNS 홍보 & 카드뉴스 자동 발행
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            2번은 본문 내용, 3번은 카드뉴스 헤드라인입니다. 점주가 간단히 적은 단어를 AI가 분석하여 각각에 맞게 자동 완성합니다.
          </p>
        </div>

        {/* 🔄 시뮬레이션 초기화 버튼 */}
        <button
          onClick={handleResetSimulation}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2 shrink-0 border border-slate-200 shadow-sm active:scale-95"
          title="기본 설정 상태로 리셋"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          시뮬레이션 초기화
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측 제어 패널 */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              마케팅 혜택 및 이미지 세팅
            </h3>

            {/* 실시간 매장 환경 감지 (주소 동적 연동) */}
            <div className={`p-4 rounded-xl border ${weather.type === 'heatwave' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${weather.type === 'heatwave' ? 'text-amber-800' : 'text-blue-700'}`}>
                  실시간 매장 환경 감지
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${weather.type === 'heatwave' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
                  {weather.temp}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                📍 {currentStore.name} ({currentStore.address})
              </p>
              <p className={`text-xs mt-1 font-medium ${weather.type === 'heatwave' ? 'text-red-700' : 'text-blue-800'}`}>
                {weather.condition}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                💡 {weather.tip}
              </p>
            </div>

            {/* 1. 사진 선택/업로드 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700">
                  1. 홍보할 음식/메뉴 사진 첨부
                </label>
                <span className="text-xs text-slate-400 font-medium">
                  {currentStore.id === 'cafe' ? '☕ 카페 전용 메뉴' : '🍗 치킨 전용 메뉴'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 border border-dashed border-slate-300 rounded-xl hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  내 사진 등록
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(currentPresetGroup.preset1.image);
                    setKeyword(currentPresetGroup.preset1.defaultKeyword);
                    setBannerTitle(currentPresetGroup.preset1.defaultTitle);
                    setGeneratedPosts(buildChannelPosts(currentPresetGroup.preset1.defaultKeyword, currentStore, weather));
                  }}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <span>{currentPresetGroup.preset1.icon}</span>
                  {currentPresetGroup.preset1.name} 예시
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(currentPresetGroup.preset2.image);
                    setKeyword(currentPresetGroup.preset2.defaultKeyword);
                    setBannerTitle(currentPresetGroup.preset2.defaultTitle);
                    setGeneratedPosts(buildChannelPosts(currentPresetGroup.preset2.defaultKeyword, currentStore, weather));
                  }}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <span>{currentPresetGroup.preset2.icon}</span>
                  {currentPresetGroup.preset2.name} 예시
                </button>
              </div>
            </div>

            {/* 2. 본문 핵심 혜택 단어 입력 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                2. 본문 핵심 혜택 단어 (점주 입력란)
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="예: 치킨할인오늘까지만, 생맥주 반값, 치즈볼 무료 등"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                👉 AI 생성 시 이 단어를 분석하여 채널별 본문 멘트를 매번 새롭게 작명합니다.
              </span>
            </div>

            {/* 3. 카드뉴스 타이틀 단어 입력 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  3. 카드뉴스 타이틀 단어 (헤드라인 전용)
                </label>
                <span className="text-[11px] text-blue-600 font-medium">점주 입력/수정 가능</span>
              </div>
              <input
                type="text"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                placeholder="예: 절대놓치지마세요, 오늘만 한정 특가 등"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                👉 AI 생성 시 이 단어를 파악하여 카드뉴스 하단용 굵은 헤드라인으로 다듬어줍니다.
              </span>
            </div>

            {/* AI 생성 버튼 */}
            <button
              onClick={handleGenerateAiMarketing}
              disabled={isGenerating}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  본문 & 타이틀 AI 분석 및 생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  카드뉴스 & 채널별 멘트 즉시 합성
                </>
              )}
            </button>
          </div>
        </div>

        {/* 우측 스마트폰 목업 시뮬레이터 */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-4 w-full max-w-md">
            <button
              onClick={() => setSelectedChannel('facebook')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                selectedChannel === 'facebook'
                  ? 'bg-[#1877F2] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📘 페이스북
            </button>
            <button
              onClick={() => setSelectedChannel('instagram')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                selectedChannel === 'instagram'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📸 인스타그램
            </button>
            <button
              onClick={() => setSelectedChannel('naver_cafe')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                selectedChannel === 'naver_cafe'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ☕ 네이버 카페
            </button>
          </div>

          <div className="w-full max-w-md bg-white rounded-[2.5rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-800 h-6 flex justify-center items-center">
              <div className="w-24 h-3.5 bg-black rounded-b-xl" />
            </div>

            {/* 앱 헤더 & 원클릭 클립보드 복사 버튼 */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{channelData.tag}</span>
                <span className="text-xs text-slate-400">방금 전</span>
              </div>
              
              {/* 📋 원클릭 클립보드 복사 액션 버튼 */}
              <button
                onClick={handleCopyClipboard}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isCopied 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                }`}
                title="본문 전체 복사"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>문구 복사</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto max-h-[480px]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs">
                  {currentStore.id === 'cafe' ? '☕' : '🍗'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{currentStore.name}</h4>
                  <p className="text-xs text-slate-400">{currentStore.address}</p>
                </div>
              </div>

              {/* 합성된 1:1 카드뉴스 */}
              <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm relative aspect-square bg-slate-100">
                {combinedImage ? (
                  <img
                    src={combinedImage}
                    alt="AI 합성 카드뉴스"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8 mb-2 animate-pulse" />
                    <span className="text-xs">카드뉴스 생성 중...</span>
                  </div>
                )}
              </div>

              {selectedChannel === 'instagram' && (
                <div className="flex justify-between items-center text-slate-700 py-1">
                  <div className="flex gap-4">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    <MessageCircle className="w-5 h-5" />
                    <Send className="w-5 h-5" />
                  </div>
                  <Bookmark className="w-5 h-5" />
                </div>
              )}

              {/* AI가 생성한 채널별 맞춤 본문 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs leading-relaxed text-slate-800 whitespace-pre-line select-text">
                {channelData.body}
              </div>
            </div>

            {/* 하단 액션 버튼 영역 (복사 + 원클릭 자동 업로드) */}
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <button
                onClick={handleCopyClipboard}
                className="px-3.5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition shrink-0"
                title="클립보드에 본문 복사"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                {isCopied ? '복사됨' : '복사'}
              </button>

              <button
                onClick={handleSimulateUpload}
                disabled={isUploading || uploadStatus[selectedChannel]}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  uploadStatus[selectedChannel]
                    ? 'bg-emerald-500 text-white cursor-default'
                    : selectedChannel === 'facebook'
                    ? 'bg-[#1877F2] hover:bg-blue-700 text-white'
                    : selectedChannel === 'instagram'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    플랫폼에 자동 업로드 중...
                  </>
                ) : uploadStatus[selectedChannel] ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    업로드 완료! (실시간 게시됨)
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    이 채널로 즉시 자동 업로드
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}