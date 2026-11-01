import { useEffect, useRef, useState } from 'react'
import { Bell, Check, ChevronDown, LogOut, Store } from 'lucide-react'
import { stores } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function DashboardHeader({
  onLogout,
  unansweredCount,
}: {
  onLogout: () => void
  unansweredCount: number
}) {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(stores[0].id)
  const menuRef = useRef<HTMLDivElement>(null)
  const selected = stores.find((s) => s.id === selectedId) ?? stores[0]

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Store className="size-4" aria-hidden="true" />
          </div>
          <span className="font-bold tracking-tight hidden sm:inline">LocalMate</span>
        </div>

        <span className="h-6 w-px bg-border hidden sm:block" aria-hidden="true" />

        <div ref={menuRef} className="relative min-w-0">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-muted transition min-w-0"
          >
            <span className="size-2 rounded-full bg-success shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold truncate">{selected.name}</span>
            <span className="text-xs text-muted-foreground truncate hidden md:inline">
              ({selected.platform})
            </span>
            <ChevronDown
              className={cn('size-4 text-muted-foreground shrink-0 transition-transform', open && 'rotate-180')}
              aria-hidden="true"
            />
          </button>
          {open && (
            <ul
              role="listbox"
              aria-label="매장 선택"
              className="absolute left-0 top-full mt-2 w-72 rounded-2xl border bg-popover p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95"
            >
              {stores.map((s) => (
                <li key={s.id} role="option" aria-selected={s.id === selectedId}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(s.id)
                      setOpen(false)
                    }}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-muted transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.platform}</p>
                    </div>
                    {s.id === selectedId && <Check className="size-4 text-primary" aria-hidden="true" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            className="relative size-9 rounded-xl hover:bg-muted flex items-center justify-center transition"
            aria-label={`알림, 미답변 리뷰 ${unansweredCount}건`}
          >
            <Bell className="size-4.5" aria-hidden="true" />
            {unansweredCount > 0 && (
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
            )}
          </button>
          <div className="flex items-center gap-2 pl-2">
            <div
              className="size-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold"
              aria-hidden="true"
            >
              김
            </div>
            <div className="hidden md:block leading-tight">
              <p className="text-sm font-semibold">김사장님</p>
              <p className="text-xs text-muted-foreground">게스트 체험 중</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="size-9 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground transition"
            aria-label="로그아웃"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
