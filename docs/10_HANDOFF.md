# LocalMate 2인·Qwen·Codex 개발 인수인계 v1.2

## 읽는 순서
1. `docs/00_DECISIONS.md` — DRAFT/OPEN 확인
2. `docs/01_PRD.md` — 목표·범위
3. `docs/02_SRS.md` — 요구사항/수용 기준 ID
4. `docs/03_DETAILED_DESIGN.md` — 구조·권한·상태 머신
5. `docs/04_API_CONTRACT.md` — FE/BE 통신 계약
6. `docs/11_UI_FUNCTIONAL_SPEC.md` — 화면별 버튼·동작 (디자인은 FE 자유)
7. `docs/05_ROADMAP.md`, `docs/06_QA_PLAN.md`, `AGENTS.md` — 담당·테스트·에이전트 규칙

## 구현 소유권
- A: 인증/멤버십, 백엔드·DB, AI 프로바이더·Agent, 승인/실행 및 감사 기록.
- B: React 화면 전체, Mock API 상태에서 화면 골격, 실제 API 연결, Playwright; A가 허용한 읽기 전용 API 보조.
- 프론트와 백엔드의 계약 불일치는 코드를 임의 추가하지 말고 API 문서를 공동 수정하여 승인합니다.

## 시작 절차
- 새 LocalMate 레포에서 문서만 초기 커밋. 프론트와 백엔드 부트스트랩 PR 분리.
- 우선 카페 시나리오의 로그인 → 리뷰 입력 → 분석 → 제안 → 승인 → 실제 업무 등록을 수직으로 완성합니다.
- 업종 확장과 UI 세부 다듬기는 카페 골든패스가 실제 통합 테스트를 통과한 다음 진행합니다.
- Qwen 작업 프롬프트에는 Story/FR ID, 변경 허용 파일, API 계약, 실행할 테스트를 명시합니다.
- Codex는 독립 감사로 사용하고, 실패/미실행 테스트를 PASS라고 서술하지 않습니다.

## DoD
- pytest/Playwright 실측 결과, 수정 파일 목록, API 변경 여부, 권한 테스트, 승인 멱등성 테스트, DB 상태 증거를 PR에 남깁니다.
