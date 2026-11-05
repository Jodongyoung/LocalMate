export type TableStatus = 'available' | 'reserved' | 'occupied' | 'noshow_warning'

export interface TableItem {
  id: number
  name: string // 예: "1번 (창가 2인)", "31번 (중앙 4인)"
  capacity: number // 수용 인원 (2, 4, 6)
  status: TableStatus
  currentOrder?: string // 이용 중일 때 주문 내역
  reservation?: {
    id: string
    guestName: string
    guestCount: number
    reservedTime: string // "15:00"
    source: 'naver' | 'manual'
    phoneLastDigits: string
    remainSeconds: number // 노쇼 카운트다운 (초)
    isWarning: boolean
  }
}