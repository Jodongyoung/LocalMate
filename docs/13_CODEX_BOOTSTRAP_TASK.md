# Codex 첫 작업 — LocalMate 프로젝트 스캐폴딩

## 전제
- GitHub: `Lee-seung-hun398/LocalMate` (Private)
- 실행 위치: 로컬 clone의 저장소 루트
- 현재 브랜치: `chore/bootstrap` (확인 후, 아니면 작업 중단)
- 저장소: 초기 README만 있었으며 이 ZIP의 기획 문서/폴더가 배치된 상태
- 이번 작업 범위: 프로젝트 초기 구조 + 최소 실행 가능한 기술 스캐폴딩, 제품 비즈니스 로직 구현 금지

## 프롬프트 — 아래 내용을 Codex에 그대로 전달

LocalMate 프로젝트 초기 개발 환경을 구축해 주세요.

1. 먼저 `git status`, `git branch --show-current`, 기존 파일 트리를 읽어 작업 환경을 확인하고, 미확인 충돌 또는 뜻밖의 변경이 있으면 편집을 중단해 보고합니다. 브랜치는 반드시 `chore/bootstrap`이어야 합니다.
2. `AGENTS.md`, `docs/00_DECISIONS.md`, `docs/02_SRS.md`, `docs/03_DETAILED_DESIGN.md`, `docs/04_API_CONTRACT.md`, `docs/05_ROADMAP.md`, `docs/06_QA_PLAN.md`, `docs/11_UI_FUNCTIONAL_SPEC.md`를 먼저 읽고 스택의 DRAFT 사항을 명시합니다. DRAFT를 합의된 결정으로 조작하지 마세요.
3. 현재 폴더 배치와 필수 문서 목록을 확인해 빠진 문서/누락된 참조/모순을 우선 보고합니다. 임의로 제품 범위를 확대하지 마세요.
4. 합의된 기본 제안 스택 React + TypeScript + Vite / FastAPI + Python / 로컬 SQLite를 기준으로 **최소 실행 가능한 frontend/backend 골격**을 만듭니다. 단, 설치에 필요한 정확한 명령과 패키지 목록을 먼저 보고하고 승인받으세요. 임의의 대형 UI, 고객 데이터, 비즈니스 로직, 로그인, 외부 API, 실제 LLM 호출은 구현하지 마세요.
5. FE: 시작 가능한 최소 화면과 상태 표시(예: LocalMate 준비 중), 빌드 명령. BE: `/health` GET 및 기본 테스트 1개. 필요시 `.env.example`을 문서와 정합되게 업데이트합니다.
6. 모의 데이터 폴더 유지. 비용이 발생할 수 있는 네이버클라우드/학교 LLM API, 외부 게시, 데이터 크롤링, 배포는 금지합니다.
7. 가능하면 backend pytest, frontend TypeScript build와 `git diff --check`를 실행합니다. 실제로 실행하지 못한 테스트는 PASS라고 말하지 마세요.
8. 작업 파일 목록, 설치한 도구, 테스트 명령 및 실제 결과, 앞으로 필요한 결정 사항을 표로 보고합니다.
9. `git commit`, `git push`, PR 생성, `main` 변경은 하지 말고 제 승인을 기다리세요. 원본 Freesia 파일에는 접근하지 마세요.

**완료 기준:** 문서·폴더 정합성, 최소 FE 화면, BE /health, 테스트 근거, 사용자 확인 전 원격 변경 없음.
