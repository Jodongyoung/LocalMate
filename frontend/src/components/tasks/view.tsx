import { useState } from 'react'
import { AiSummary } from './ai-summary'

export function TasksView() {
  const [pendingProposals, setPendingProposals] = useState([
    {
      id: '1',
      title: '혼잡 시간대 주문 동선 점검 및 피크타임 인력 보강',
      source: '배민 리뷰 68건 분석 (대기시간 불만 24% 기반)',
      planHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb...',
      status: 'pending'
    }
  ])
  
  const [internalTasks, setInternalTasks] = useState([
    {
      id: '1',
      status: 'in-progress',
      content: '피크타임 조리 인력 추가 배치',
      source: '승인 대기 제안',
      createdAt: '2026-11-01 10:30'
    },
    {
      id: '2',
      status: 'completed',
      content: '주문 동선 점검',
      source: '승인 대기 제안',
      createdAt: '2026-11-01 09:15'
    }
  ])

  const handleApprove = (id: string) => {
    // 승인 로직
    const proposal = pendingProposals.find(p => p.id === id)
    if (proposal) {
      // 새로운 업무 추가
      const newTask = {
        id: (internalTasks.length + 1).toString(),
        status: 'in-progress',
        content: proposal.title,
        source: '승인 대기 제안',
        createdAt: new Date().toLocaleString('ko-KR', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
      
      setInternalTasks([newTask, ...internalTasks])
      
      // 승인된 제안 제거
      setPendingProposals(pendingProposals.filter(p => p.id !== id))
    }
  }

  const handleReject = (id: string) => {
    // 반려 로직
    setPendingProposals(pendingProposals.filter(p => p.id !== id))
  }

  const toggleTaskStatus = (id: string) => {
    setInternalTasks(internalTasks.map(task => 
      task.id === id 
        ? { ...task, status: task.status === 'in-progress' ? 'completed' : 'in-progress' } 
        : task
    ))
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 flex flex-col gap-6 pb-28">
        {/* 승인 대기 제안 섹션 */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">승인 대기 제안</h2>
          <p className="text-xs text-muted-foreground mt-0.5">제안된 업무를 검토하고 승인 또는 반려하세요</p>
          
          <div className="mt-4 space-y-4">
            {pendingProposals.map((proposal) => (
              <div key={proposal.id} className="border rounded-xl p-4">
                <h3 className="font-medium">{proposal.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{proposal.source}</p>
                
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs bg-muted px-2 py-1 rounded">플랜 검증 해시</span>
                  <span className="text-xs text-muted-foreground truncate">{proposal.planHash}</span>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleReject(proposal.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition"
                  >
                    반려
                  </button>
                  <button
                    onClick={() => handleApprove(proposal.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
                  >
                    승인 및 업무 등록
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 등록된 내부 업무 목록 섹션 */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">등록된 내부 업무 목록</h2>
          <p className="text-xs text-muted-foreground mt-0.5">등록된 내부 업무를 확인하고 관리하세요</p>
          
          <div className="mt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-xs font-medium text-muted-foreground">상태</th>
                  <th className="text-left py-3 text-xs font-medium text-muted-foreground">업무 내용</th>
                  <th className="text-left py-3 text-xs font-medium text-muted-foreground">제안 출처</th>
                  <th className="text-left py-3 text-xs font-medium text-muted-foreground">등록 일시</th>
                </tr>
              </thead>
              <tbody>
                {internalTasks.map((task) => (
                  <tr key={task.id} className="border-b last:border-b-0">
                    <td className="py-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          onChange={() => toggleTaskStatus(task.id)}
                          className="rounded border-muted-foreground"
                        />
                        <span className="text-xs">
                          {task.status === 'completed' ? '완료' : '진행중'}
                        </span>
                      </label>
                    </td>
                    <td className="py-3 text-sm">{task.content}</td>
                    <td className="py-3 text-sm text-muted-foreground">{task.source}</td>
                    <td className="py-3 text-sm text-muted-foreground">{task.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}