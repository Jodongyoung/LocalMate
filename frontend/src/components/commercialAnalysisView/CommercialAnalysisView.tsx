'use client'

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  MapPin,
  Store,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Award,
  Bike,
  ArrowUpRight,
  RefreshCw,
  RotateCcw,
  ChefHat
} from 'lucide-react';

interface StoreInfo {
  id: string;
  name: string;
  category: string;
  address: string;
}

interface CompetitorMenu {
  rank: number;
  menuName: string;
  orderShare: string;
  avgPrice: string;
  keyPoint: string;
}

interface TrendItem {
  tag: string;
  title: string;
  viralGrowth: string;
  summary: string;
  collabRecipe: string;
  expectedMargin: string;
}

interface DeliveryDiagnosis {
  areaAvgSales: number; // 만원 단위
  myStoreSales: number; // 만원 단위
  gapPercent: number;
  summaryHighlight: string;
  reasons: {
    title: string;
    detail: string;
    solution: string;
  }[];
}

interface AnalysisScenario {
  keyword: string;
  radius: string;
  competitorCount: number;
  saturationLevel: string;
  avgTicketPrice: string;
  areaSummary: string;
  topMenus: CompetitorMenu[];
  trends: TrendItem[];
  delivery: DeliveryDiagnosis;
}

// 주소 문자열에서 핵심 지역명(시/도 + 구/군) 동적 추출
const parseRegionName = (address: string): string => {
  if (!address || address.trim() === '') return '우리동네';
  const tokens = address.trim().split(/\s+/);
  if (tokens.length >= 2) {
    const city = tokens[0].replace(/(특별시|광역시|특별자치시|특별자치도)/, '');
    const district = tokens[1];
    return `${city} ${district}`;
  }
  return tokens[0];
};

// 주소 상권 밀집도 계수 (번화가/중심상권일수록 지점 수가 현실적으로 높게 산출됨)
const getRegionDensityMultiplier = (address: string): number => {
  if (!address) return 1.0;
  if (address.includes('동성로') || address.includes('중구') || address.includes('강남') || address.includes('서면') || address.includes('홍대')) {
    return 1.35; // 핵심 중심 번화가
  }
  if (address.includes('대연') || address.includes('남구') || address.includes('수성') || address.includes('대학')) {
    return 1.1; // 대학가·역세권 복합 상권
  }
  return 0.95; // 일반 주거·근린 상권
};

// 기본 상권 데이터 생성 (키워드 미입력 / 초기화 시 현재 매장 주소 기반 - 치킨/짜장면/피자 등 다양한 업종 반영)
const buildDefaultOverviewScenario = (address: string): AnalysisScenario => {
  const region = parseRegionName(address);
  const multiplier = getRegionDensityMultiplier(address);
  const totalCount = Math.round(138 * multiplier);

  return {
    keyword: '외식·배달 상권 전체',
    radius: '반경 1.2km',
    competitorCount: totalCount,
    saturationLevel: multiplier > 1.2 ? '핵심 번화가 (유동인구 최상)' : '복합 배달 상권 (수요 높음)',
    avgTicketPrice: '17,800원',
    areaSummary: `${region} 반경 1.2km 내에는 치킨·중식·피자·분식 등 총 ${totalCount}개의 외식 매장이 영업 중입니다. 현재 상권은 치킨 세트와 1인 짜장·탕수육, 사각 피자 콤보 등 배달비 할인과 1인 구성을 갖춘 메뉴들이 전체 매출 상위권을 독점하고 있습니다.`,
    topMenus: [
      { rank: 1, menuName: '반반 순살 치킨 + 모짜렐라 치즈볼 4알 세트', orderShare: '34.8%', avgPrice: '21,500원', keyPoint: '야간·주말 배달 1위' },
      { rank: 2, menuName: '직화 간짜장 / 짬뽕 + 미니 찹쌀 탕수육 1인 세트', orderShare: '27.4%', avgPrice: '14,500원', keyPoint: '점심·혼밥 주문 최상' },
      { rank: 3, menuName: '1인 디트로이트 사각 피자 + 치즈 오븐 스파게티', orderShare: '21.2%', avgPrice: '15,900원', keyPoint: '배달비 무료 혜택 집중' },
    ],
    trends: [
      {
        tag: '🔥 전국 SNS 품절 대란',
        title: '두쫀쿠 (두바이 쫀득 쿠키) & 피스타치오 카다이프 토핑 열풍',
        viralGrowth: '+480%',
        summary: '프랜차이즈 본사는 신메뉴 출시에 수개월이 걸리지만, 개인 자영업자는 유행하는 카다이프·피스타치오 식재료를 기존 디저트·사이드에 즉시 접목해 폭발적인 초기 유입을 만들고 있습니다.',
        collabRecipe: '기존 인기 사이드/디저트 반죽에 피스타치오 크림+카다이프를 더한 [오늘 한정 두쫀 사이드] 출시',
        expectedMargin: '객단가 +4,200원 상승'
      },
      {
        tag: '⚡ 상권 꿀조합 트렌드',
        title: '매콤 로제 떡볶이 + 바삭 튀김·면류 찍먹 하이브리드 세트',
        viralGrowth: '+295%',
        summary: '단품 하나만 시키기 아쉬워하는 배달 고객들이 "메인 + 매콤 분식 사이드"를 한 번에 해결할 수 있는 꿀조합 세트를 집중적으로 찾고 있습니다.',
        collabRecipe: '원가 1,500원대 소용량 로제 떡볶이/비빔면을 사이드 옵션으로 추가해 세트 객단가 상향',
        expectedMargin: '주문 전환율 +31% 증가'
      }
    ],
    delivery: {
      areaAvgSales: Math.round(3500 * (multiplier > 1.2 ? 1.08 : 1.0)),
      myStoreSales: 2140,
      gapPercent: -38.9,
      summaryHighlight: `${region} 내 배달 강세 상권들은 ① 배달비 무료/할인 지원, ② 1인 가구 전용 소용량 구성, ③ 풍성한 리뷰 사이드 서비스로 주문수를 쓸어 담고 있습니다.`,
      reasons: [
        {
          title: '주변 잘나가는 상권 대비 높은 체감 배달비 장벽',
          detail: '반경 내 배달 상위 매장 82%가 "알뜰배달 무료" 또는 "2,000원 즉시 할인 쿠폰"을 상시 노출하고 있어, 배달비가 붙는 우리 매장은 클릭 단계에서 이탈합니다.',
          solution: '최소주문금액을 1,000원 상향하는 대신 [배달비 2,000원 지원 쿠폰] 배지 활성화'
        },
        {
          title: '1인 가구·혼밥족을 위한 1인 전용 메뉴 구성 부족',
          detail: '주변 상권 전체 배달 주문의 절반 이상(52%)이 1인분 주문이지만, 우리 매장은 2인 이상 기준 가격대 위주라 1인 고객 선택지에서 밀리고 있습니다.',
          solution: '12,900원~14,900원대 [1인 실속 혼밥 세트]를 메뉴판 최상단 대표 메뉴로 배치'
        },
        {
          title: '경쟁 상권의 공격적인 리뷰 서비스 & 사이드 물량 공세',
          detail: '주변 인기 매장들은 "리뷰 약속 시 음료 사이즈업 + 인기 사이드 2종 증정"으로 체감 가성비를 극대화해 재주문율 58%를 유지 중입니다.',
          solution: '원가율이 낮은 효자 사이드(음료·튀김·토핑)를 묶은 [리뷰 2종 혜택] 즉시 적용'
        }
      ]
    }
  };
};

// 업종 키워드별 현실 반영 시나리오 생성 함수 (주소 밀집도 + 업종별 적정 반경/지점수 반영)
const buildKeywordScenario = (rawKeyword: string, address: string): AnalysisScenario => {
  const kw = rawKeyword.trim();
  const region = parseRegionName(address);
  const multiplier = getRegionDensityMultiplier(address);

  // 1. 치킨 상권
  if (kw.includes('치킨') || kw.includes('통닭')) {
    const count = Math.round(29 * multiplier);
    return {
      keyword: kw,
      radius: '반경 1.5km',
      competitorCount: count,
      saturationLevel: '경쟁 치열 (야간 피크 집중)',
      avgTicketPrice: '21,800원',
      areaSummary: `${region} 반경 1.5km 내 치킨 전문점은 총 ${count}개 지점이 영업 중입니다. 대형 프랜차이즈 사이에서 개인 매장은 "1인 순살 컵치킨"과 "특제 시즈닝·떡볶이 사이드 세트"로 틈새 점유율을 빠르게 가져가고 있습니다.`,
      topMenus: [
        { rank: 1, menuName: '반반 순살 치킨 + 모짜렐라 치즈볼 4알 세트', orderShare: '35.4%', avgPrice: '22,500원', keyPoint: '배달 주문 1위' },
        { rank: 2, menuName: '1인 혼치맥 컵치킨 + 생맥주/음료 알뜰 콤보', orderShare: '26.2%', avgPrice: '14,500원', keyPoint: '1인 가구 재주문 최상' },
        { rank: 3, menuName: '청양크림 / 고추마요 특제 소스 순살 치킨', orderShare: '19.8%', avgPrice: '21,000원', keyPoint: '2030 선호도 1위' },
      ],
      trends: [
        {
          tag: '🔥 SNS 숏폼 급상승',
          title: '마라 로제 떡볶이 + 순살 치킨 찍먹 콤보',
          viralGrowth: '+310%',
          summary: '치킨 소스에 꾸덕한 로제 떡볶이 국물을 찍어 먹는 "치떡 꿀조합" 해시태그가 야식 배달 타겟으로 폭발 중입니다.',
          collabRecipe: '기존 순살 치킨 + 소용량 로제 떡볶이 사이드(원가 1,800원) 묶음 세트 구성',
          expectedMargin: '객단가 +4,500원 상승'
        },
        {
          tag: '✨ 자영업자 한정판 전략',
          title: '두바이 초코 시즈닝 & 쫀득 치즈볼 디저트 콜라보',
          viralGrowth: '+245%',
          summary: '프랜차이즈 본사는 출시까지 6개월 걸리지만, 개인 매장은 피스타치오·카다이프 토핑 치즈볼을 일 20개 한정으로 즉시 출시 가능합니다.',
          collabRecipe: '사이드 메뉴 [수제 두쫀 치즈볼 4알] 한정판 옵션 추가',
          expectedMargin: '신규 유입률 +28% 예상'
        }
      ],
      delivery: {
        areaAvgSales: Math.round(3620 * (multiplier > 1.2 ? 1.06 : 1.0)),
        myStoreSales: 2140,
        gapPercent: -40.9,
        summaryHighlight: `${region} 내 치킨 배달 상위권 매장들은 1.4만 원대 1인 혼치킨 세트와 밤 9시 이후 배달비 지원 쿠폰으로 야식 주문을 흡수하고 있습니다.`,
        reasons: [
          {
            title: '주변 치킨 상권 대비 높은 배달 팁 및 할인 쿠폰 부재',
            detail: '반경 내 인기 치킨집 80%가 2,000원 즉시 할인 또는 알뜰배달 무료를 적용해 1만 원 후반대 체감가를 유지하고 있습니다.',
            solution: '야식 피크타임(20:00~24:00) [배달비 2,000원 지원 쿠폰] 집중 노출'
          },
          {
            title: '1인 가구 타겟 소용량(1.3만~1.5만 원대) 혼치킨 메뉴 부재',
            detail: '주변 배달 주문의 48%가 1인 가구에서 발생하나, 2만 원 이상 한 마리 메뉴 위주라 혼자 시키는 고객이 이탈합니다.',
            solution: '순살 반마리 + 감자튀김 + 음료 결합 [1인 혼치킨 14,900원 세트] 신설'
          },
          {
            title: '경쟁 상권의 치즈볼·소스 리뷰 서비스 물량 공세',
            detail: '상위 매장들은 리뷰 약속 시 치즈볼 4알 또는 특제 디핑소스 2종을 기본 증정해 재주문율 59%를 기록 중입니다.',
            solution: '원가율이 낮은 효자 사이드를 묶은 [리뷰 참여 시 치즈볼 4알 증정] 적용'
          }
        ]
      }
    };
  }

  // 2. 카페 / 디저트 상권
  if (kw.includes('카페') || kw.includes('커피') || kw.includes('디저트') || kw.includes('쿠키')) {
    const count = Math.round(54 * multiplier);
    return {
      keyword: kw,
      radius: '반경 800m',
      competitorCount: count,
      saturationLevel: '초과밀 상권 (디저트 차별화 필수)',
      avgTicketPrice: '9,600원',
      areaSummary: `${region} 반경 800m 내 카페·디저트 매장은 총 ${count}개 지점으로 밀집도가 매우 높습니다. 단순 아메리카노 경쟁 대신 "두쫀쿠·수제 크로플" 같은 시그니처 디저트 페어링 세트가 배달 매출을 견인합니다.`,
      topMenus: [
        { rank: 1, menuName: '아이스 아메리카노 2잔 + 수제 크로플 디저트 세트', orderShare: '39.2%', avgPrice: '12,800원', keyPoint: '오피스·배달 1위' },
        { rank: 2, menuName: '두바이 쫀득 쿠키 (두쫀쿠) & 피스타치오 크림 라떼', orderShare: '28.5%', avgPrice: '11,400원', keyPoint: 'SNS 인증샷 유입 1위' },
        { rank: 3, menuName: '1인 알뜰 모닝/런치 커피 + 구움과자 휘낭시에 콤보', orderShare: '19.1%', avgPrice: '8,900원', keyPoint: '최소주문금액 돌파 효자' },
      ],
      trends: [
        {
          tag: '🔥 전국 품절 대란 키워드',
          title: '두쫀쿠 (두바이 쫀득 쿠키) & 말차 크림 콜라보',
          viralGrowth: '+480%',
          summary: '마시멜로 쫀득 식감과 카다이프 바삭함을 결합한 "두쫀쿠"가 SNS 인증샷 필수 코스로 자리 잡았습니다. 개인 카페만의 수제 레시피 변주가 핵심입니다.',
          collabRecipe: '기존 크로플·쿠키 반죽에 피스타치오 스프레드 + 카다이프 토핑한 [수제 두바이 쫀득 디저트] 출시',
          expectedMargin: '디저트 객단가 +3,800원 상승'
        },
        {
          tag: '🌧️ 테이크아웃·배달 꿀조합',
          title: '1인 디저트 샘플러 박스 (미니 크로플 + 쿠키 반쪽 + 음료)',
          viralGrowth: '+230%',
          summary: '여러 가지 디저트를 조금씩 맛보고 싶어 하는 1인 배달 고객에게 3종 미니 샘플러 구성이 높은 호응을 얻고 있습니다.',
          collabRecipe: '기존 구움과자를 소분 조합한 [혼자서도 3종 맛보기 티타임 박스] 구성',
          expectedMargin: '배달 객단가 +2,900원 증가'
        }
      ],
      delivery: {
        areaAvgSales: Math.round(2890 * (multiplier > 1.2 ? 1.07 : 1.0)),
        myStoreSales: 2140,
        gapPercent: -26.0,
        summaryHighlight: `${region} 내 카페 배달 상위권 매장들은 최소주문금액 장벽을 낮춘 1인 커피+디저트 세트와 무료배달 쿠폰으로 점심·오후 주문을 흡수하고 있습니다.`,
        reasons: [
          {
            title: '주변 카페 상권 대비 높은 배달 최소주문금액 장벽',
            detail: '상위 카페들은 [음료 1잔 + 디저트 1개 = 11,500원] 알뜰 세트로 혼자 시키는 직장인·학생 주문을 흡수하고 있습니다.',
            solution: '11,000원대 [1인 커피+디저트 알뜰 배달 세트] 신설 및 최소주문금액 하향'
          },
          {
            title: '배달비 할인 쿠폰 미적용으로 인한 단가 경쟁력 열세',
            detail: '8,000원~12,000원대 소액 주문이 많은 카페 업종 특성상 배달비 2,000원 유무가 주문 전환율을 좌우합니다.',
            solution: '피크타임(12:00~16:00) [배달비 1,500원 지원 쿠폰] 노출 활성화'
          },
          {
            title: '리뷰 이벤트를 통한 재주문 단골 락인(Lock-in) 부족',
            detail: '인기 카페들은 리뷰 작성 시 아메리카노 샷 추가 또는 미니 구움과자 1개 증정으로 재주문율 62%를 유지 중입니다.',
            solution: '원가 500원대 미니 쿠키/샷 추가를 활용한 [리뷰 감사 서비스] 즉시 적용'
          }
        ]
      }
    };
  }

  // 3. 피자 상권 (배달 반경이 넓어 2.0km 기준)
  if (kw.includes('피자')) {
    const count = Math.round(16 * multiplier);
    return {
      keyword: kw,
      radius: '반경 2.0km',
      competitorCount: count,
      saturationLevel: '중상 (1인 피자 강세)',
      avgTicketPrice: '23,800원',
      areaSummary: `${region} 반경 2.0km 내 피자 전문점은 총 ${count}개 지점이 운영 중입니다. 대형 라지 피자보다 "1인 7인치 사각 피자 + 파스타/윙 콤보"가 평일 배달 주문의 46%를 차지하며 빠르게 성장하고 있습니다.`,
      topMenus: [
        { rank: 1, menuName: '1인 디트로이트 사각 피자 + 치즈 오븐 스파게티', orderShare: '38.4%', avgPrice: '15,900원', keyPoint: '1인 가구 주문 1위' },
        { rank: 2, menuName: '반반 스페셜 피자(불고기+페퍼로니) + 갈릭디핑 2개', orderShare: '31.2%', avgPrice: '24,500원', keyPoint: '주말 가족·모임 강세' },
        { rank: 3, menuName: '트러플 고구마 무스 크러스트 + 버팔로 윙 6조각', orderShare: '18.9%', avgPrice: '26,000원', keyPoint: '리뷰 평점 4.9 메뉴' },
      ],
      trends: [
        {
          tag: '🔥 SNS 치즈 폭포 트렌드',
          title: '꿀에 찍어 먹는 고르곤졸라 & 두바이 피스타치오 디저트 피자',
          viralGrowth: '+340%',
          summary: '단짠 조합을 선호하는 MZ세대 사이에서 식사 피자 주문 시 달콤한 디저트 피자 조각을 함께 시키는 릴스 인증이 급증하고 있습니다.',
          collabRecipe: '기존 도우 자투리나 미니 사이즈를 활용한 [피스타치오 카다이프 달콤 미니피자] 사이드 출시',
          expectedMargin: '사이드 추가율 +35%'
        },
        {
          tag: '🍕 반반 커스텀 유행',
          title: '매콤 마라 페퍼로니 + 콘치즈 폭탄 하프앤하프',
          viralGrowth: '+220%',
          summary: '한 판 가격으로 두 가지 자극적인 트렌드 맛을 동시에 즐기려는 소비 심리가 뚜렷합니다.',
          collabRecipe: '기존 페퍼로니 토핑에 청양마요·옥수수콘을 얹은 [마라콘치즈 반반피자] 한정 메뉴화',
          expectedMargin: '객단가 +3,500원 상승'
        }
      ],
      delivery: {
        areaAvgSales: Math.round(3890 * (multiplier > 1.2 ? 1.05 : 1.0)),
        myStoreSales: 2140,
        gapPercent: -44.9,
        summaryHighlight: `${region} 내 피자·양식 강세 매장들은 1인용 소형 피자 세트와 배달비 무료 정책으로 평일 저녁 혼자 먹는 고객층을 완전히 흡수했습니다.`,
        reasons: [
          {
            title: '주변 피자 상권의 "1인 세트(1.5만 원대)" 공세 대비 단가 열세',
            detail: '주변 인기 피자집들은 1인 피자+스파게티+콜라 세트를 15,900원에 무료배달로 제공해 평일 야간 주문을 독식하고 있습니다.',
            solution: '소용량 1인 메인 + 사이드 + 음료 결합 [1인 올인원 특가 세트] 신설'
          },
          {
            title: '소스·피클·사이드 기본 서비스 구성의 체감 만족도 차이',
            detail: '상위 경쟁점은 디핑소스 2종과 리뷰 작성 시 치즈크러스트 무료 업그레이드를 기본 제공해 재주문율을 높이고 있습니다.',
            solution: '리뷰 이벤트 참여 시 [인기 토핑 추가 또는 사이드 무료] 혜택으로 체감 가성비 강화'
          },
          {
            title: '배달비 할인 쿠폰 미적용으로 인한 노출 순위 하락',
            detail: '주변 경쟁점 대비 배달 팁이 2,000원~3,000원 높게 책정되어 배달앱 필터링에서 제외되는 비중이 높습니다.',
            solution: '단품 가격 미세 조정 후 [배달비 0원 / 첫주문 할인 쿠폰] 마케팅 적용'
          }
        ]
      }
    };
  }

  // 4. 파스타 / 양식 상권
  if (kw.includes('파스타') || kw.includes('스파게티') || kw.includes('양식')) {
    const count = Math.round(21 * multiplier);
    return {
      keyword: kw,
      radius: '반경 1.5km',
      competitorCount: count,
      saturationLevel: '경쟁 보통 (점심·야간 양분)',
      avgTicketPrice: '16,400원',
      areaSummary: `${region} 반경 1.5km 내 파스타·양식 매장은 총 ${count}개 지점이 운영 중입니다. 오피스 점심 1인 세트와 저녁 2인 파스타+리조또 세트로 시간대별 투트랙 전략을 구사하고 있습니다.`,
      topMenus: [
        { rank: 1, menuName: '우삼겹 매콤 투움바 파스타 + 마늘바게트 2조각', orderShare: '39.1%', avgPrice: '14,900원', keyPoint: '재주문율 1위' },
        { rank: 2, menuName: '명란 오일 파스타 + 리코타 샐러드 1인 런치세트', orderShare: '27.5%', avgPrice: '15,500원', keyPoint: '평일 점심 주문 집중' },
        { rank: 3, menuName: '트러플 크림 뇨끼 + 수제 피클 & 에이드 콤보', orderShare: '19.8%', avgPrice: '18,200원', keyPoint: '여성 고객 선호도 최상' },
      ],
      trends: [
        {
          tag: '🔥 SNS 비주얼 폭발',
          title: '통부라타 치즈 얹은 매콤 로제 파스타 & 마늘빵 찍먹 조합',
          viralGrowth: '+315%',
          summary: '포크로 부라타 치즈를 가르는 영상과 꾸덕한 로제 소스에 바삭한 빵을 찍어 먹는 꿀조합이 인스타 피드를 장악했습니다.',
          collabRecipe: '기존 크림·토마토 소스를 블렌딩한 로제 소스에 마늘바게트 추가 제공 세트로 구성',
          expectedMargin: '객단가 +3,800원 상승'
        },
        {
          tag: '🍝 1인 혼밥 트렌드',
          title: '파스타 + 미니 리조또 반반 1인 듀오 도시락',
          viralGrowth: '+210%',
          summary: '면만 먹기 아쉬운 1인 배달 고객을 위해 파스타와 밥(리조또)을 한 용기에 반반 담아주는 구성이 폭발적 인기입니다.',
          collabRecipe: '파스타 0.7인분 + 크림 리조또 0.5인분 결합 [혼밥 욕심쟁이 듀오 세트] 출시',
          expectedMargin: '신규 1인 유입 +33%'
        }
      ],
      delivery: {
        areaAvgSales: Math.round(3280 * (multiplier > 1.2 ? 1.05 : 1.0)),
        myStoreSales: 2140,
        gapPercent: -34.7,
        summaryHighlight: `${region} 내 잘나가는 양식·파스타 매장들은 배달비 부담을 낮추고 "마늘빵·샐러드·음료"를 기본 묶음으로 구성해 가성비 인식을 잡았습니다.`,
        reasons: [
          {
            title: '단품 위주 메뉴 구성으로 인한 객단가 및 가성비 인식 저하',
            detail: '주변 상위 파스타 매장은 14,900원 세트에 마늘빵과 음료까지 포함해 "혜자 맛집" 리뷰를 확보한 반면, 단품 추가 결제 구조는 이탈률이 높습니다.',
            solution: '메인 메뉴 주문 시 사이드·음료를 묶은 [1인 풀코스 세트] 기본 노출'
          },
          {
            title: '점심 피크타임(11:30~13:30) 빠른 조리·알뜰배달 혜택 부재',
            detail: '직장인·학생 점심 주문은 배달비 무료 여부와 30분 내 도착 배지가 주문 결정의 70%를 좌우합니다.',
            solution: '평일 점심 한정 [배달비 할인 쿠폰] 및 인기 3종 빠른 조리 패스트트랙 운영'
          },
          {
            title: '리뷰 이벤트를 통한 재방문 쿠폰 순환 구조 미흡',
            detail: '경쟁점은 리뷰 작성 고객에게 다음 주문용 2,000원 단골 쿠폰과 사이드 증정을 동시에 걸어 락인(Lock-in) 효과를 내고 있습니다.',
            solution: '리뷰 서비스 확대 + 재주문 단골 전용 할인 쿠폰 자동 발행'
          }
        ]
      }
    };
  }

  // 5. 국수 / 면요리 상권
  if (kw.includes('국수') || kw.includes('칼국수') || kw.includes('막국수') || kw.includes('냉면') || kw.includes('면')) {
    const count = Math.round(18 * multiplier);
    return {
      keyword: kw,
      radius: '반경 1.2km',
      competitorCount: count,
      saturationLevel: '점심 회전율 최상',
      avgTicketPrice: '11,200원',
      areaSummary: `${region} 반경 1.2km 내 국수·면요리 매장은 총 ${count}개 지점이 운영 중입니다. "면 단품 + 수제 만두/주먹밥" 1인 세트 구성이 필수이며, 배달 시 면 불음 방지 분리 포장 리뷰가 매출을 결정합니다.`,
      topMenus: [
        { rank: 1, menuName: '얼큰 바지락 칼국수 / 멸치국수 + 고기왕만두 3알 세트', orderShare: '42.3%', avgPrice: '11,500원', keyPoint: '점심·비오는날 1위' },
        { rank: 2, menuName: '매콤 비빔국수 + 직화 불고기 쌈 세트', orderShare: '29.7%', avgPrice: '12,900원', keyPoint: '2030 혼밥 선호도 1위' },
        { rank: 3, menuName: '들기름 막국수 + 바삭 감자전/수육 소짜 콤보', orderShare: '18.5%', avgPrice: '14,500원', keyPoint: '객단가 견인 효자 메뉴' },
      ],
      trends: [
        {
          tag: '🔥 SNS 미식 트렌드',
          title: '고소한 들기름 막국수 & 바삭한 수육·튀김 곁들임 꿀조합',
          viralGrowth: '+360%',
          summary: '자극적인 국물 대신 고소한 들기름·김가루·노른자 비빔면에 바삭한 고기 튀김을 곁들여 먹는 레시피가 SNS에서 폭발적인 조회수를 기록 중입니다.',
          collabRecipe: '기존 면/사이드 메뉴에 들기름 특제 간장 소스를 입힌 [시그니처 들기름 비빔 세트] 출시',
          expectedMargin: '객단가 +3,200원 상승'
        },
        {
          tag: '🥟 분식·면 콜라보',
          title: '비빔국수 국물에 납작만두·치즈볼 싸먹는 "면치기 꿀조합"',
          viralGrowth: '+240%',
          summary: '새콤달콤한 비빔 소스에 바삭한 튀김 사이드를 싸 먹는 조합이 10~30대 배달 주문에서 높은 재주문율을 보입니다.',
          collabRecipe: '비빔면류 주문 시 바삭 만두 또는 치즈볼 3알을 묶은 [꿀조합 1인 정식] 구성',
          expectedMargin: '세트 주문 비중 +40%'
        }
      ],
      delivery: {
        areaAvgSales: Math.round(2980 * (multiplier > 1.2 ? 1.05 : 1.0)),
        myStoreSales: 2140,
        gapPercent: -28.1,
        summaryHighlight: `${region} 내 면요리·분식 배달 강자들은 낮은 최소주문금액(10,000원대)과 배달비 할인을 무기로 1인 혼밥 주문을 싹쓸이하고 있습니다.`,
        reasons: [
          {
            title: '1인 식사 기준 최소주문금액 및 배달비 부담',
            detail: '국수·면류는 1만 원 초반대 메뉴가 주력인데, 최소주문금액이 15,000원 이상이면 혼자 시키려는 고객이 전부 이탈합니다.',
            solution: '1인 세트(11,900원~12,900원) 기준에 맞춰 최소주문금액 하향 및 배달비 할인 적용'
          },
          {
            title: '단품(8~9천원) 위주 판매로 인한 낮은 건당 매출',
            detail: '주변 상위 매장은 단품 대신 "면 + 만두/주먹밥/고기 곁들임" 세트를 기본 노출해 건당 단가를 13,000원대로 끌어올렸습니다.',
            solution: '사이드 곁들임이 포함된 [든든 1인 한상 세트]를 대표 메뉴 1번으로 고정'
          },
          {
            title: '서비스 혜택(사이드 추가·음료 증정) 체감도 부족',
            detail: '주변 잘나가는 매장들은 리뷰 작성 시 만두 2알이나 캔음료를 100% 증정해 별점 4.9점을 방어하고 있습니다.',
            solution: '원가 부담이 적은 인기 사이드 2알 무료 증정 리뷰 이벤트 즉시 개설'
          }
        ]
      }
    };
  }

  // 6. 국밥 / 한식 상권
  if (kw.includes('국밥') || kw.includes('해장국') || kw.includes('순대국') || kw.includes('곰탕') || kw.includes('탕')) {
    const count = Math.round(24 * multiplier);
    return {
      keyword: kw,
      radius: '반경 1.5km',
      competitorCount: count,
      saturationLevel: '고정 단골층 두터움',
      avgTicketPrice: '12,400원',
      areaSummary: `${region} 반경 1.5km 내 국밥·탕류 매장은 총 ${count}개 지점이 운영 중입니다. 직장인 점심과 야간 해장 배달 수요가 매우 탄탄하며, "국밥 1그릇 + 수육/순대 소짜" 1인 보쌈 정식이 매출 1위입니다.`,
      topMenus: [
        { rank: 1, menuName: '얼큰 돼지/순대 국밥 + 항정 수육 맛보기 1인 정식', orderShare: '44.8%', avgPrice: '13,500원', keyPoint: '전체 주문의 절반 차지' },
        { rank: 2, menuName: '뼈해장국 특 + 깍두기 볶음밥/공기밥 추가 세트', orderShare: '28.3%', avgPrice: '12,000원', keyPoint: '야간·주말 해장 1위' },
        { rank: 3, menuName: '맑은 곰탕/소고기국밥 + 메밀전병·만두 콤보', orderShare: '17.4%', avgPrice: '13,000원', keyPoint: '전 연령층 안정적 수요' },
      ],
      trends: [
        {
          tag: '🔥 해장·야식 SNS 밈',
          title: '마라 얼큰 국밥 & 들깨 크림 순대국밥 퓨전 레시피',
          viralGrowth: '+290%',
          summary: '전통 국밥 육수에 마라 소스나 고소한 들깨·청양고추 토핑을 더한 퓨전 국밥이 2030 젊은 세대의 해장 트렌드로 급부상했습니다.',
          collabRecipe: '기존 얼큰 양념에 마라 오일/청양 토핑 옵션을 추가한 [스트레스 타파 얼큰 특선] 출시',
          expectedMargin: '2030 신규 유입 +37%'
        },
        {
          tag: '🥩 1인 고기 정식 열풍',
          title: '국밥 + 직화 불맛 수육/제육 미니 한상 도시락',
          viralGrowth: '+255%',
          summary: '국밥만 먹기 허전한 1인 가구를 위해 3,000원만 추가하면 고기 한 접시가 같이 오는 1인 정식 세트가 압도적 선택을 받고 있습니다.',
          collabRecipe: '메인 식사 + 고기/튀김 사이드 소짜 결합 [1인 사장님 특선 정식] 구성',
          expectedMargin: '객단가 +3,500원 상승'
        }
      ],
      delivery: {
        areaAvgSales: Math.round(3540 * (multiplier > 1.2 ? 1.05 : 1.0)),
        myStoreSales: 2140,
        gapPercent: -39.5,
        summaryHighlight: `${region} 내 한식·국밥 강세 매장들은 "빠른 배달 + 배달비 할인 + 푸짐한 1인 정식 세트" 3박자로 매일 시켜 먹는 단골을 확보했습니다.`,
        reasons: [
          {
            title: '주변 한식 상권의 "배달비 무료 & 빠른 한그릇" 프로모션 격차',
            detail: '국밥·한식은 고객이 배고플 때 즉시 주문하는 업종이라 배달비가 비싸거나 쿠폰이 없으면 바로 옆 경쟁 가게로 넘어갑니다.',
            solution: '점심(11~14시)·저녁(18~21시) 피크타임 [배달비 2,000원 할인 쿠폰] 집중 배치'
          },
          {
            title: '1인 고객이 만족할 수 있는 "맛보기 고기/사이드 정식" 부재',
            detail: '상위 국밥집들은 13,500원 정식에 수육 5점과 순대 4알을 함께 담아 "혼자서도 푸짐하다"는 리뷰로 상단 랭킹을 유지합니다.',
            solution: '메인 메뉴에 인기 사이드 소량을 결합한 [1인 푸짐 정식 세트] 신설'
          },
          {
            title: '반찬·소스 추가 및 리뷰 서비스 구성의 단조로움',
            detail: '경쟁점은 리뷰 이벤트로 "공기밥 추가 / 음료 / 사이드 2종 택1" 등 실속 있는 선택권을 주어 재주문율을 60% 이상 유지합니다.',
            solution: '고객 취향대로 고를 수 있는 [리뷰 혜택 3종 택1] 옵션 추가'
          }
        ]
      }
    };
  }

  // 7. 그 외 자유 키워드 (짜장면, 마라탕, 족발, 분식, 초밥, 버거 등 입력값마다 고유 수치 산출)
  const seed = kw.split('').reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 1), 0);
  const baseCount = 11 + (seed % 23);
  const realisticCount = Math.max(8, Math.round(baseCount * multiplier));
  const ticket = 13000 + (seed % 12) * 1000;
  const areaAvg = Math.round((3100 + (seed % 9) * 110) * (multiplier > 1.2 ? 1.05 : 1.0));
  const mySales = 2140;
  const gap = Number((((mySales - areaAvg) / areaAvg) * 100).toFixed(1));

  return {
    keyword: kw,
    radius: realisticCount >= 25 ? '반경 1.2km' : '반경 1.5km',
    competitorCount: realisticCount,
    saturationLevel: realisticCount >= 25 ? '경쟁 치열 (상위 25%)' : '성장 유망 상권',
    avgTicketPrice: `${ticket.toLocaleString()}원`,
    areaSummary: `${region} 일대 [${kw}] 업종을 분석한 결과, 총 ${realisticCount}개 지점이 경쟁 중이며 1인 소용량 세트와 배달비 할인 쿠폰을 운영하는 매장이 매출 상위권을 점유하고 있습니다.`,
    topMenus: [
      { rank: 1, menuName: `[${kw}] 1인 실속 혼밥 세트 + 인기 사이드 콤보`, orderShare: '38.2%', avgPrice: `${(ticket - 2000).toLocaleString()}원`, keyPoint: '배달비 무료 혜택 집중' },
      { rank: 2, menuName: `시그니처 [${kw}] 스페셜 + 특제 소스 & 음료 묶음`, orderShare: '29.4%', avgPrice: `${(ticket + 2500).toLocaleString()}원`, keyPoint: '리뷰 만족도 1위' },
      { rank: 3, menuName: `반반 맛보기 [${kw}] & 시즌 한정 토핑 추가 구성`, orderShare: '18.7%', avgPrice: `${(ticket + 1000).toLocaleString()}원`, keyPoint: '2030 재주문율 최상' },
    ],
    trends: [
      {
        tag: '🔥 SNS 바이럴 꿀조합',
        title: `[${kw}] + 매콤 로제·청양크림 특제 디핑 소스 꿀조합 열풍`,
        viralGrowth: '+325%',
        summary: `최근 인스타·틱톡에서 기존 [${kw}] 메뉴에 매콤달콤한 특제 소스와 바삭한 사이드를 곁들여 먹는 커스텀 레시피가 젊은 층 사이에서 빠르게 확산 중입니다.`,
        collabRecipe: `우리 매장 주력 메뉴에 특제 디핑 소스와 미니 사이드를 결합한 [${kw} 트렌드 꿀조합 세트] 출시`,
        expectedMargin: '객단가 +3,900원 상승'
      },
      {
        tag: '✨ 자영업자 한정판 전략',
        title: `두쫀쿠·피스타치오 디저트 & 시즌 한정 사이드 콜라보`,
        viralGrowth: '+270%',
        summary: '프랜차이즈와 달리 개인 매장은 본사 승인 없이 유행하는 트렌드 식재료를 즉시 사이드나 한정 옵션으로 출시해 초기 바이럴 매출을 선점할 수 있습니다.',
        collabRecipe: `식사 후 즐기는 [오늘 20개 한정 두바이 쫀득 디저트/사이드] 추가 옵션 구성`,
        expectedMargin: '신규 고객 유입 +29%'
      }
    ],
    delivery: {
      areaAvgSales: areaAvg,
      myStoreSales: mySales,
      gapPercent: gap,
      summaryHighlight: `${region} 내 [${kw}] 및 배달 강세 상권들은 배달비 할인 지원, 1인 가구 전용 메뉴, 푸짐한 리뷰 서비스로 우리 매장보다 월 ${(areaAvg - mySales).toLocaleString()}만 원 높은 매출을 기록 중입니다.`,
      reasons: [
        {
          title: '주변 잘나가는 상권 대비 높은 배달비 및 쿠폰 혜택 부족',
          detail: `${region} 상위 매장들은 "배달비 무료" 또는 "2,000원 즉시 할인 쿠폰"을 상시 적용해 고객의 첫 클릭을 선점하고 있습니다.`,
          solution: '배달앱 내 [배달비 2,000원 지원 쿠폰] 설정으로 주변 상권과 가격 경쟁력 확보'
        },
        {
          title: '1인 가구 타겟 소용량·1인 전용 세트 메뉴 구성 미흡',
          detail: `주변 배달 주문의 절반 이상이 1인 가구에서 발생하나, 1.3만~1.5만 원대 알뜰 1인 세트가 부족해 혼자 주문하는 고객이 이탈하고 있습니다.`,
          solution: `메인 소용량 + 사이드 + 음료가 포함된 [1인 실속 세트] 신설 및 상단 고정`
        },
        {
          title: '경쟁 상권의 풍성한 리뷰 서비스 & 사이드 물량 공세',
          detail: '주변 인기 매장들은 리뷰 약속 시 인기 사이드 2종 무료 증정으로 체감 가성비를 높여 재주문율을 극대화하고 있습니다.',
          solution: '원가율이 낮은 효자 사이드를 활용한 [리뷰 참여 시 사이드 2종 증정] 이벤트 운영'
        }
      ]
    }
  };
};

// 솔루션별 매출 기여 비중 (진단 1: 40%, 진단 2: 35%, 진단 3: 25%)
const SOLUTION_IMPACT_WEIGHTS = [0.4, 0.35, 0.25];

export function CommercialAnalysisView() {
  const loadCurrentStoreFromStorage = useCallback((): StoreInfo => {
    if (typeof window === 'undefined') {
      return { id: 'cafe', name: '☕ 동성로 카페 (본점)', category: '카페/디저트', address: '대구 중구 동성로 123' };
    }
    const storeId = localStorage.getItem('localmate_store_id') || 'cafe';
    const saved = localStorage.getItem(`localmate_settings_${storeId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          id: storeId,
          name: parsed.name || (storeId === 'cafe' ? '☕ 동성로 카페 (본점)' : '🍗 수성 치킨 (지점)'),
          category: parsed.category || (storeId === 'cafe' ? '카페/디저트' : '치킨/패스트푸드'),
          address: parsed.address || (storeId === 'cafe' ? '대구 중구 동성로 123' : '부산 남구 대연동 45')
        };
      } catch {}
    }
    return storeId === 'cafe'
      ? { id: 'cafe', name: '☕ 동성로 카페 (본점)', category: '카페/디저트', address: '대구 중구 동성로 123' }
      : { id: 'chicken', name: '🍗 수성 치킨 (지점)', category: '치킨/패스트푸드', address: '부산 남구 대연동 45' };
  }, []);

  const [currentStore, setCurrentStore] = useState<StoreInfo>(loadCurrentStoreFromStorage);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<AnalysisScenario>(() =>
    buildDefaultOverviewScenario(loadCurrentStoreFromStorage().address)
  );
  const [appliedSolutions, setAppliedSolutions] = useState<{ [key: number]: boolean }>({});

  const currentRegion = parseRegionName(currentStore.address);

  // 매장 변경(storeChange) 및 설정 저장(settingsChange) 실시간 동기화
  useEffect(() => {
    const syncStoreInfo = () => {
      const latest = loadCurrentStoreFromStorage();
      setCurrentStore(latest);
      setSearchKeyword((prevKw) => {
        if (!prevKw.trim()) {
          setActiveScenario(buildDefaultOverviewScenario(latest.address));
        } else {
          setActiveScenario(buildKeywordScenario(prevKw, latest.address));
        }
        return prevKw;
      });
    };

    syncStoreInfo();
    window.addEventListener('storeChange', syncStoreInfo);
    window.addEventListener('settingsChange', syncStoreInfo);
    window.addEventListener('storage', syncStoreInfo);
    window.addEventListener('focus', syncStoreInfo);

    return () => {
      window.removeEventListener('storeChange', syncStoreInfo);
      window.removeEventListener('settingsChange', syncStoreInfo);
      window.removeEventListener('storage', syncStoreInfo);
      window.removeEventListener('focus', syncStoreInfo);
    };
  }, [loadCurrentStoreFromStorage]);

  // 키워드 검색 실행 핸들러
  const handleRunAnalysis = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAnalyzing(true);
    setAppliedSolutions({});

    setTimeout(() => {
      const clean = searchKeyword.trim();
      if (!clean) {
        setActiveScenario(buildDefaultOverviewScenario(currentStore.address));
      } else {
        setActiveScenario(buildKeywordScenario(clean, currentStore.address));
      }
      setIsAnalyzing(false);
    }, 450);
  };

  // 시뮬레이션 초기화 핸들러
  const handleResetSimulation = () => {
    setSearchKeyword('');
    setActiveScenario(buildDefaultOverviewScenario(currentStore.address));
    setAppliedSolutions({});
  };

  const toggleApplySolution = (idx: number) => {
    setAppliedSolutions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // 솔루션 적용에 따른 실시간 예상 매출 및 그래프 수치 계산
  const totalGap = Math.max(0, activeScenario.delivery.areaAvgSales - activeScenario.delivery.myStoreSales);
  const solutionLifts = SOLUTION_IMPACT_WEIGHTS.map((weight, idx) => {
    if (idx === 2) {
      const firstTwo = Math.round(totalGap * SOLUTION_IMPACT_WEIGHTS[0]) + Math.round(totalGap * SOLUTION_IMPACT_WEIGHTS[1]);
      return Math.max(0, totalGap - firstTwo);
    }
    return Math.round(totalGap * weight);
  });

  const addedSales = solutionLifts.reduce((sum, lift, idx) => (appliedSolutions[idx] ? sum + lift : sum), 0);
  const projectedSales = activeScenario.delivery.myStoreSales + addedSales;
  const appliedCount = Object.values(appliedSolutions).filter(Boolean).length;

  const currentGapPercent = Number(
    (((projectedSales - activeScenario.delivery.areaAvgSales) / activeScenario.delivery.areaAvgSales) * 100).toFixed(1)
  );

  const maxChartScale = Math.max(activeScenario.delivery.areaAvgSales, projectedSales);
  const areaBarWidth = Math.round((activeScenario.delivery.areaAvgSales / maxChartScale) * 100);
  const baseMyBarWidth = Math.round((activeScenario.delivery.myStoreSales / maxChartScale) * 100);
  const addedBarWidth = Math.max(0, Math.round((projectedSales / maxChartScale) * 100) - baseMyBarWidth);

  return (
    <div className="space-y-6">
      {/* 상단 타이틀 & 주변 상권 키워드 검색 바 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold">
                AI 상권·트렌드·배달 정밀 진단
              </span>
              <span className="text-slate-400 text-xs">FR-A02</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              주변 상권 경쟁력 분석 & SNS 트렌드 신메뉴 R&D
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              현재 매장 위치(<strong className="text-slate-700">{currentRegion}</strong>) 주변 상권의 인기 업종·메뉴와 최신 SNS 유행(두쫀쿠·꿀조합 등)을 분석해 배달 매출 격차 해소 솔루션을 제안합니다.
            </p>
          </div>

          {/* 실시간 설정 주소 연동 배지 */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shrink-0">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{currentStore.name}</span>
            <span className="text-slate-300">|</span>
            <span className="text-indigo-700 font-bold">{currentStore.address}</span>
          </div>
        </div>

        {/* 자유 키워드 검색 + AI 상권 진단 실행 + 시뮬레이션 초기화 */}
        <form onSubmit={handleRunAnalysis} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="분석할 주변 상권 키워드 자유 입력 (예: 치킨, 카페, 피자, 짜장면, 국수, 국밥 등)"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm transition active:scale-[0.99]"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  주변 상권 분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI 상권 진단 실행
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetSimulation}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-200 transition active:scale-[0.99]"
              title="기본 상권 데이터로 초기화"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              시뮬레이션 초기화
            </button>
          </div>
        </form>
      </div>

      {/* 중단 2단 그리드: [1. 주변 상권 현황 & 인기 메뉴] + [2. SNS 트렌드 & 신메뉴 R&D] */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. 좌측: 내 위치 주변 상권 분석 결과 (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>1. {currentRegion} 주변 [{activeScenario.keyword}] 상권 분석</span>
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                {activeScenario.radius} 기준
              </span>
            </div>

            {/* 상권 핵심 지표 3카드 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">반경 내 영업 지점</span>
                <strong className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {activeScenario.competitorCount}개 지점
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">상권 활성화도</span>
                <strong className="text-sm font-extrabold text-indigo-600 mt-1.5 block">
                  {activeScenario.saturationLevel}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">주변 평균 객단가</span>
                <strong className="text-lg font-extrabold text-slate-900 mt-1 block">
                  {activeScenario.avgTicketPrice}
                </strong>
              </div>
            </div>

            {/* 주변 상권 최다 판매 메뉴 TOP 3 */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  🏆 {currentRegion} 주변 상권 최다 판매 인기 메뉴 TOP 3
                </span>
              </div>

              {activeScenario.topMenus.map((item) => (
                <div
                  key={item.rank}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                        item.rank === 1
                          ? 'bg-amber-400 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.rank}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.menuName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        상권 주문 점유율 <strong className="text-slate-700">{item.orderShare}</strong> · 평균가 {item.avgPrice}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {item.keyPoint}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
            💡 <strong>AI 주변 상권 요약:</strong> {activeScenario.areaSummary}
          </div>
        </div>

        {/* 2. 우측: SNS 급상승 트렌드 & 자영업자 신메뉴·꿀조합 솔루션 (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                2. SNS 유행 음식 & 신메뉴·꿀조합 R&D
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full">
                개인 자영업자 즉시 도입 가능
              </span>
            </div>

            <p className="text-xs text-slate-500">
              프랜차이즈와 달리 개인 매장은 본사 승인 없이 유행 아이템(두쫀쿠·한정 콜라보 등)을 즉시 메뉴화하여 초기 바이럴 수익을 극대화할 수 있습니다.
            </p>

            <div className="space-y-3.5">
              {activeScenario.trends.map((trend, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {trend.tag}
                    </span>
                    <span className="text-xs font-extrabold text-rose-600 flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      SNS 검색량 {trend.viralGrowth}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900">{trend.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{trend.summary}</p>

                  <div className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
                        <ChefHat className="w-3.5 h-3.5" />
                        추천 꿀조합 메뉴화 솔루션
                      </span>
                      <span className="text-[11px] font-extrabold text-emerald-600">
                        {trend.expectedMargin}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">{trend.collabRecipe}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between gap-2">
            <span>
              ✨ <strong>팁:</strong> 위 트렌드 메뉴를 출시한 뒤 <strong>[AI SNS 마케팅]</strong> 탭에서 키워드만 넣으면 즉시 홍보 카드뉴스가 제작됩니다.
            </span>
          </div>
        </div>
      </div>

      {/* 3. 하단 전체: 주변 잘나가는 배달 상권 대비 우리 매장 배달 매출 정밀 진단 (12 cols) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Bike className="w-5 h-5 text-blue-600" />
              3. {currentRegion} 주변 배달 강세 상권 대비 우리 가게 매출 격차 AI 진단
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              하단 진단 카드의 <strong>[이 솔루션 매장 운영에 적용하기]</strong>를 클릭하면 예상 매출 상승분이 상단 그래프에 실시간 시뮬레이션됩니다.
            </p>
          </div>

          {currentGapPercent >= 0 ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl shrink-0 transition-all duration-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-emerald-700">
                주변 배달 상위 상권 평균 달성 완료! (+{Math.abs(currentGapPercent)}%)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl shrink-0 transition-all duration-300">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-xs font-bold text-rose-700">
                주변 배달 상위 상권 대비 월 매출 {currentGapPercent}% {appliedCount > 0 ? `(${appliedCount}개 솔루션 반영 중)` : '(전략 보완 필요)'}
              </span>
            </div>
          )}
        </div>

        {/* 배달 매출 비교 시각화 바 (실시간 솔루션 시뮬레이션 연동) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <div className="md:col-span-6 space-y-4">
            {/* 상권 상위 평균 바 */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-600">{currentRegion} 주변 배달 상위 20% 상권 평균</span>
                <span className="text-indigo-600">{activeScenario.delivery.areaAvgSales.toLocaleString()}만 원 / 월</span>
              </div>
              <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${areaBarWidth}%` }}
                />
              </div>
            </div>

            {/* 우리 가게 현재 + 솔루션 예상 상승 누적 바 */}
            <div>
              <div className="flex flex-wrap justify-between items-center text-xs font-bold mb-1.5 gap-1">
                <span className="text-slate-800">
                  {appliedCount > 0
                    ? `솔루션 ${appliedCount}개 적용 시 예상 배달 매출`
                    : `현재 우리 가게 (${currentStore.name}) 배달 매출`}
                </span>
                <div className="flex items-center gap-1.5">
                  {addedSales > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-extrabold">
                      +{addedSales.toLocaleString()}만 원 상승 예측
                    </span>
                  )}
                  <span className={addedSales > 0 ? 'text-emerald-600 font-extrabold text-sm' : 'text-rose-600'}>
                    {projectedSales.toLocaleString()}만 원 / 월
                  </span>
                </div>
              </div>

              <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex">
                {/* 기존 매출 (빨간색) */}
                <div
                  className="h-full bg-rose-500 transition-all duration-700 ease-out shrink-0"
                  style={{ width: `${baseMyBarWidth}%` }}
                />
                {/* 솔루션 적용 예상 상승분 (초록색 누적) */}
                <div
                  className="h-full bg-emerald-500 transition-all duration-700 ease-out shrink-0"
                  style={{ width: `${addedBarWidth}%` }}
                />
              </div>

              {addedSales > 0 && (
                <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    기존 매출 ({activeScenario.delivery.myStoreSales.toLocaleString()}만 원)
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    AI 솔루션 기대 상승분 (+{addedSales.toLocaleString()}만 원)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-6 md:border-l md:border-slate-200 md:pl-6 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Award className="w-4 h-4 text-amber-500" />
              <span>AI 주변 상권 배달 비교 브리핑</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeScenario.delivery.summaryHighlight}{' '}
              {addedSales > 0 ? (
                <>
                  현재 선택한 <strong className="text-emerald-600">{appliedCount}개 솔루션</strong> 적용 시 월 예상 매출이{' '}
                  <strong className="text-emerald-600">{projectedSales.toLocaleString()}만 원</strong>으로 상승하며,{' '}
                  {totalGap - addedSales > 0 ? (
                    <>
                      남은 격차는 <strong className="text-indigo-600">{(totalGap - addedSales).toLocaleString()}만 원</strong>입니다.
                    </>
                  ) : (
                    <strong className="text-emerald-600">주변 상위 20% 상권 평균 매출을 100% 따라잡습니다!</strong>
                  )}
                </>
              ) : (
                <>
                  아래 3가지 핵심 처방을 모두 적용하면 월{' '}
                  <strong className="text-indigo-600">+{totalGap.toLocaleString()}만 원</strong> 수준까지 배달 매출을 끌어올릴 수 있습니다.
                </>
              )}
            </p>
          </div>
        </div>

        {/* AI 원인 분석 & 실행 솔루션 3카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeScenario.delivery.reasons.map((item, idx) => {
            const isApplied = !!appliedSolutions[idx];
            const liftAmount = solutionLifts[idx];

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                  isApplied
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600">
                      진단 0{idx + 1}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-lg transition-colors duration-300 ${
                        isApplied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      기대 매출 +{liftAmount.toLocaleString()}만 원/월
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.detail}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-800">
                    <span className="font-bold text-indigo-600 block mb-0.5">👉 AI 처방 솔루션</span>
                    {item.solution}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleApplySolution(idx)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors duration-300 ${
                      isApplied
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-900 hover:bg-indigo-600 text-white'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        시뮬레이션 반영됨 (+{liftAmount.toLocaleString()}만 원)
                      </>
                    ) : (
                      <>
                        이 솔루션 매장 운영에 적용하기
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}