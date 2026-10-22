# LocalMate 상세설계서 v1.1

**성격:** 개발 시작을 위한 구체적 설계 **제안**. `docs/00_DECISIONS.md`의 DRAFT가 합의되면 확정. 기존 Freesia 프로젝트의 운영 검증을 의미하지 않음.

## 1. 아키텍처/배포 경계
```
Chrome desktop / mobile browser
  └─ React + TS + Vite (UI, 상태/요청; 모델 API 키 없음)
      └─ HTTPS /api/v1 (인증 Bearer, 사업장 scoping)
          └─ FastAPI monolith (비즈니스 경계)
              ├─ auth/membership: 모든 사업장 ID 접근 검증
              ├─ feedback: 리뷰 저장, LLM 분석 요청, 근거 보존
              ├─ operations: 카페 판매 / 미용실 예약 서버 통계
              ├─ insights: 분석 결과+통계 기반 서버 룰
              ├─ agent: read-only tool→응답/제안 JSON
              ├─ workflow: 제안/승인/실행 트랜잭션
              ├─ marketing: 내부 초안 미리보기/보관
              ├─ provider-adapters: school hub / HCX / mock
              └─ SQLAlchemy → SQLite dev/demo (Alembic migration)
```
**핵심 경계:** React는 모델 공급자를 직접 호출하지 않습니다. FastAPI만 API 키를 읽습니다. AI 모델에 DB 접속권/임의 SQL·코드 실행권을 주지 않습니다.

## 2. 권장 레포 구조
```
localmate/
  README.md  AGENTS.md  docs/
  frontend/
    src/{app,pages,components,features,api,types,styles}/
    tests/e2e/
    package.json  .env.example
  backend/
    app/
      main.py  core/{config,security,errors}.py
      db/{session,models,base}.py
      modules/{auth,business,feedback,operations,insights,agent,workflow,marketing}/
      services/{llm_provider,tool_registry,importer}.py
      schemas/  tests/{unit,integration,contract}/
    alembic/  alembic.ini  pyproject.toml  .env.example
  data/
    synthetic/{cafe,salon}/  seeds/  README.md
  scripts/{seed_demo,run_checks}/
  .github/workflows/
```
경로는 예시이며 실제 구조를 바꿀 때 동일 역할 경계를 유지하고 ADR 기록.

## 3. 인증·사업장 데이터 격리
- 데모용 최소 2계정, 카페 Owner 1명과 미용실 Owner 1명. 사업장 전환 기능 확인용 추가 계정은 두 사업장 회원 자격 부여 가능.
- `POST /auth/login` → 검증된 접근 토큰 발급; 비밀번호 해시 저장. 토큰의 `sub`는 서버 검증 후 user_id. 브라우저 영속 저장을 전제로 하지 않음. 향후 배포 인증은 재설계 가능.
- 각 사업장 API는 `/{business_id}`를 명시하되, 요청 body의 사업장 ID만 신뢰하지 않음. auth 주체 membership 검증 후 tenant-scoped query 실행.
- 자료/제안/작업의 ID를 알고 있어도 부모 business_id가 다르면 404(존재 노출 최소화) 반환.
- JWT 비밀키 dev `.env`로만 공급; 짧은 만료 설정, 테스트에서는 고정 테스트 키 별도 사용. 데모 초기 계정 비밀번호는 README 공개 저장 금지.

## 4. DB 논리 설계 (최초 migration 전에 팀 리뷰)
**관계:** `users 1-N business_memberships N-1 businesses`; 각 사업장 N feedback/sales/bookings/insights/conversations/proposals/tasks/drafts/executions.

| 테이블 | 주요 컬럼(대표 타입) | 키·제약/비고 |
|---|---|---|
| users | id UUID/string, email unique, password_hash, is_active, created_at | email normalized; 실제 개인정보 테스트 금지 |
| businesses | id, name, type ENUM[cafe,salon], region_label, address_optional, created_at | 지역 라벨은 공식 상권 통계 아님 |
| business_memberships | id, user_id, business_id, role, active | UNIQUE(user_id,business_id), 양쪽 FK |
| business_policies | id, business_id, tone, refund_policy, prohibited_claims JSON, version | UNIQUE(business_id,version), 최신 표시 |
| feedback | id, business_id, kind, body, occurred_at?, imported_at, source_kind, source_key?, body_version | UNIQUE(business_id,source_kind,source_key) where source_key exists |
| feedback_analyses | id, business_id, feedback_id, feedback_version, status, polarity?, aspects JSON, intents JSON, evidence JSON, model_id?, analyzed_at?, error_code? | 동일 원문 버전 재분석 정책; 실패 상태 분리 |
| sales_records | id, business_id, sold_at, menu_key, qty INTEGER, revenue_krw INTEGER, import_batch_id? | qty>0, revenue_krw>=0 |
| booking_records | id, business_id, start_at, service_key, duration_min, status, import_batch_id? | duration>0, 상태 enum |
| import_batches | id, business_id, dataset_type, sha256, status, accepted_rows, rejected_rows, imported_at | UNIQUE(business_id,dataset_type,sha256), 원본 비공개 |
| conversations | id, business_id, user_id, created_at | 사업장 격리 |
| messages | id, business_id, conversation_id, role, content, created_at, evidence_refs_json | 서버 저장과 provider 맥락 별개 |
| insights | id, business_id, rule_key, window_start, window_end, evidence_version, numerator, denominator, summary, status, created_at | UNIQUE(business_id,rule_key,window_start,window_end,evidence_version) |
| proposals | id, business_id, created_by, tool_name, canonical_args_json, plan_sha256, plan_version, state, created_at, expires_at, approved_by?, approved_at? | 1 proposal : 1 mutation tool (MVP 제안) |
| tool_executions | id, business_id, proposal_id, idempotency_key, state, result_type?, result_id?, error_code?, started_at?, finished_at? | UNIQUE(proposal_id), UNIQUE(idempotency_key) |
| tasks | id, business_id, title, description, state, source_proposal_id?, created_at, updated_at | UNIQUE(source_proposal_id) where non-null |
| draft_artifacts | id, business_id, kind, content, feedback_id?, source_proposal_id?, status, created_at | UNIQUE(source_proposal_id) where non-null |

**DB 공통:** 모든 행의 timestamp는 UTC; 금액 정수 KRW; FOREIGN KEY 활성화; migration 자동 생성 검토 없이 적용 금지; 삭제보다 soft archive/상태 유지. 주요 인덱스 `(business_id,created_at)`, `(business_id,occurred_at)`, `(business_id,started_at)`.

## 5. 업무 제안과 실행 상태 머신
```
Proposal: PENDING_APPROVAL -> APPROVED -> (실행 상태 별도)
                           -> REJECTED
                           -> EXPIRED
Execution: NONE -> RUNNING -> SUCCEEDED | FAILED | UNKNOWN
```
- 승인 이전: 제안 자체는 DB에 보관 가능, `tasks`/`draft_artifacts`에 변경 없음.
- `canonical_args_json` 정렬/고정 serialize → SHA256; DB에 고정. 승인 시 화면의 plan_sha256이 서버의 현재 값과 일치해야 함.
- `POST .../approve`: membership 확인 → 상태/만료/해시 검사 → DB 트랜잭션으로 승인+실행(내부 DB만) 처리 → 실행 결과 반환.
- `create_task`/`save_reply_draft` 등 **허용 목록** 도구만 실행. 사용자 입력을 SQL, shell, URL fetch 경로로 해석하지 않음.
- 같은 proposal에 다중 승인 HTTP가 도달해도 `UNIQUE(source_proposal_id)`와 `UNIQUE(proposal_id)`로 하나만 생성. SQLite write serialization 충돌 시 재시도 후 동일 결과 조회, 미확인 시 UNKNOWN.
- 승인 도중 실패: 실행 state FAILED, 정상 결과 ID 없음; 작업 생성과 성공 기록을 가능한 하나의 트랜잭션에 둠. 실패 기록은 별도 안전 트랜잭션으로 남기되 중복 효과 없음 재확인.
- 새로운 내용이 필요하면 이전 proposal 수정 금지; 새 proposal 생성·재승인.
- `update_task_status`는 테스트 범위 검토 후 추가, 승인 없는 자동 상태 변경 금지.

## 6. Agent / AI 분석 구조
1. FastAPI가 로그인·사업장 소유권을 확인.
2. 백엔드의 **읽기 전용** 도구가 입력 근거를 수집. 지역/업종과 상관없는 도구 차단.
3. Provider adapter는 제한된 data + 정책 + system instructions를 모델로 전달(고객 데이터 최소화).
4. 모델은 **JSON schema**에 맞는 후보 결과만 반환. Tool calling 모델 기능이 없어도 동작하게 계획 JSON 방식 지원.
5. 서버는 JSON 파싱·schema 검사·허용된 tool_name 검사·근거 원문 매칭·사업장 재검사. 숫자는 서버가 계산한 통계만 사용.
6. 비업무 텍스트 답변/초안은 미리보기로 반환. 업무 변경 희망 시 Proposal 저장→승인 UI.
7. 승인 후 workflow executor가 DB 변경. 모델 응답에는 실행 권한이 없다.

**분석 출력(예시):** `polarity ∈ {positive,negative,mixed,neutral}`, `aspects[]`, `intents[]`, `evidence[{quote,start?,end?}]`, `summary`, `model_id`. 원문 인용 없으면 result `FAILED` 또는 `NEEDS_REVIEW`, 허구 인용은 표시하지 않음.

**프롬프트 주입 방어:** 외부 리뷰는 낮은 신뢰 데이터. 모델이 '관리자 기능 열어달라'고 출력해도 tool registry/approval/backend auth가 차단. 가게 소유자의 실제 정책과 데이터 없이는 할인·환불·시간 약속 금지.

## 7. 선제 인사이트와 집계
- 분석/CSV 업로드 종료 시 사업장별 집계 재계산; 필요하면 대시보드 진입 시 재평가. 백그라운드 스케줄러는 초기 필수 아님.
- 최근 30일 `SUCCEEDED` 분석 리뷰 중 동일한 negative aspect 3건 이상 + 전체 성공 분석 리뷰 대비 비율 20% 이상을 후보로 표시(조정 가능 config).
- 집계의 날짜 구간, 분자, 분모, 근거 리뷰 IDs, generated_at/version을 묶어 보관.
- 판매/예약 집중 시간대는 서버 통계로만 제시. '원인' 확정 금지.

## 8. 주요 사용자 화면 및 로딩 상태
- 대시보드: 최근 문제, 수치와 근거, 제안/대기, 데이터 출처 라벨.
- AI 비서: 읽기 전용 답변, 증거 링크, 변화가 생길 도구의 미리보기+승인 카드.
- 고객: 리뷰 분석 상태 4종(`PENDING`,`SUCCEEDED`,`FAILED`,`STALE`), 응대 초안 제안.
- 운영: 업종별 매출/예약; 비해당 업종 기능 노출하지 않음.
- 업무: 제안/반려/성공/실패/이력, 작업 원본 ID, 승인한 사용자.
- 공통 UI: 빈 상태, 데이터 부족, 모델 장애, 권한 오류, 복구 요청을 분리.

## 9. API·공급자·코딩 규칙 참조
- API 표준은 `docs/04_API_CONTRACT.md`; 프론트는 생성된 OpenAPI TS 타입과 함수/계약을 이용.
- 실제 모델 및 비용/데이터 출처는 `docs/08_DATA_AI_PROVIDER.md`.
- 자동 QA는 `docs/06_QA_PLAN.md`.
- AI 구현자는 `AGENTS.md`를 최우선 운영 규칙으로 참조.

## 10. 주요 위험과 완화
| 위험 | 완화 |
|---|---|
| 모델 API 무료 접근 불명 | Provider adapter + mock fixture, 유료 자동 전환 금지 |
| 네이버 리뷰 API 불가 | 사용자 제공/합성 입력 우선, 외부 읽기 P1 |
| 2인팀이 전체 기능 지연 | 데모 골든패스 먼저, 부가 화면/정기 브리핑 제거 |
| 승인 경쟁 상태 | proposal 1:1 mutation, unique constraints, 통합 테스트 |
| 데이터 유출/권한 오류 | business scoped query + 타 tenant 공격 테스트 |
| 외부 호출 실패 | 분리된 실패 상태, 로컬 사전 분석+라이브 신규 1건 |
| 발표 인터넷 문제 | 오프라인 녹화본 및 데이터 초기화 스크립트 |
