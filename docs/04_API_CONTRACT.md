# LocalMate API 계약 (초안) v1.1

**최초 베이스:** FastAPI `/api/v1` + OpenAPI 자동 생성. 클라이언트는 이 문서와 OpenAPI가 일치하는지 계약 테스트를 돌립니다. **API는 아직 구현되지 않았습니다.** 요청/응답은 예시이며 결정 승인 후 변경은 계약 PR로만 허용.

## 1. 공통 규칙
- Base `/api/v1`; Content-Type `application/json` (CSV만 `multipart/form-data`).
- 인증 `Authorization: Bearer <access_token>`. 서버에서 서명·만료·sub 확인. API 키는 프론트에 없음.
- 주요 사업장 경로 `/businesses/{business_id}`. 서버는 사용자-사업장 Membership을 검사. 잘못된 다른 tenant 자원은 404 반환.
- ID는 UUID 문자열; UTC ISO 8601 응답 (`2026-10-22T12:00:00Z`), 한국 시간 표시만 UI에서.
- 목록은 `limit`(기본 20, 최대 100) + `cursor?`, 응답 `items`, `next_cursor`.
- 결과 예: `status` enum. 에러는 `{ "error": {"code":"...", "message":"...", "request_id":"..."}}`.
- 보안: 원문 리뷰가 모델에 전달되는 최소 필드와 사용자 식별정보는 분리; 입력 데이터는 메시지/명령으로 신뢰하지 않음.

## 2. P0 엔드포인트 목록
| Method | Path | 요청 | 응답·주요 조건 | 요구사항 |
|---|---|---|---|---|
| POST | `/auth/login` | email,password | access_token, expires_in, user. 레이트리밋 권장 | FR-001 |
| GET | `/me` | - | id, memberships, display name | FR-002 |
| GET | `/businesses` | - | 현재 user의 사업장만 | FR-002 |
| GET | `/businesses/{bid}` | - | business/policy/region/type | FR-003 |
| PATCH | `/businesses/{bid}/policy` | policy + version | 새 정책 버전, 낙관적 잠금 | FR-003 |
| GET | `/businesses/{bid}/feedback` | from,to,kind,status,cursor | 리뷰 목록; 원문은 Owner만 | FR-005 |
| POST | `/businesses/{bid}/feedback` | kind,body,occurred_at? | feedback_id, PENDING | FR-006 |
| POST | `/businesses/{bid}/imports/{kind}` | CSV file; kind=feedback/sales/bookings | import batch, accepted/rejected counts | FR-007/011/013 |
| POST | `/businesses/{bid}/feedback/{fid}/analyze` | - | analysis_status, analysis_id | FR-008 |
| GET | `/businesses/{bid}/feedback/{fid}/analysis` | - | result/evidence/errors | FR-008/009 |
| GET | `/businesses/{bid}/feedback/summary` | from,to | 서버 집계, numerator,denominator, evidence_ids | FR-010 |
| GET | `/businesses/{bid}/operations/sales-summary` | from,to | 카페 전용, 금액/수량/시간대 | FR-012/015 |
| GET | `/businesses/{bid}/operations/booking-summary` | from,to | 미용실 전용, 시술/상태/시간대 | FR-014/015 |
| GET | `/businesses/{bid}/insights` | from,to | rule, numerator,denominator,evidence_ids | FR-018 |
| POST | `/businesses/{bid}/conversations` | optional title | conversation_id | FR-016 |
| GET | `/businesses/{bid}/conversations/{cid}/messages` | cursor | messages list | FR-016 |
| POST | `/businesses/{bid}/conversations/{cid}/messages` | message | answer, evidence_refs, optional proposal_id | FR-016/017/021 |
| POST | `/businesses/{bid}/draft-previews` | kind, prompt, feedback_id? | 미리보기 텍스트+검증 경고; 저장 없음 | FR-019/020 |
| GET | `/businesses/{bid}/proposals/{pid}` | - | 미리보기+고정 tool/args/hash/state | FR-021 |
| POST | `/businesses/{bid}/proposals/{pid}/approve` | expected_plan_sha256 | approval result + execution id/status | FR-022~025 |
| POST | `/businesses/{bid}/proposals/{pid}/reject` | optional reason | REJECTED; 실행 없음 | FR-022 |
| GET | `/businesses/{bid}/proposals` | state,cursor | 제안 목록 | FR-025 |
| GET | `/businesses/{bid}/executions/{eid}` | - | 상태/결과/오류/승인 주체/시간 | FR-025 |
| GET | `/businesses/{bid}/tasks` | state,cursor | 완료 작업 포함 | FR-023/025 |
| GET | `/businesses/{bid}/drafts` | kind,cursor | 내부에 실제 저장된 초안 | FR-023/025 |

## 3. 객체 예시 및 비고
### 3.1 리뷰 저장
```json
POST /api/v1/businesses/biz-cafe/feedback
{"kind":"review","body":"음료는 맛있는데 주문 후 오래 기다렸어요.","occurred_at":"2026-10-21T04:00:00Z"}
```
반환 예:
```json
{"id":"fb-001","business_id":"biz-cafe","analysis_status":"PENDING","source_kind":"manual"}
```
문서의 `biz-cafe`/`fb-001`은 사람이 읽기 쉬운 **설명용 별칭**입니다. 실제 API 구현에서는 UUID 형식으로 일관되게 변경합니다.

### 3.2 AI 분석 출력
```json
{
  "id":"an-001","feedback_id":"fb-001","feedback_version":1,
  "status":"SUCCEEDED","polarity":"mixed",
  "aspects":[{"name":"wait_time","sentiment":"negative"}],
  "intents":["complaint"],
  "evidence":[{"quote":"오래 기다렸어요","feedback_id":"fb-001"}],
  "summary":"대기 시간 불만 포함", "model_id":"provider/model/version",
  "analyzed_at":"2026-10-22T12:00:00Z"
}
```
실패 시 `status="FAILED"`, `error_code`만 제공하고 **중립 분류로 대체하지 않음**.

### 3.3 근거 포함 집계
```json
{"business_id":"biz-cafe","window":{"start":"2026-09-22","end":"2026-10-22"},
 "rule":"wait_time_negative","numerator":5,"denominator":20,"ratio":0.25,
 "evidence_ids":["fb-001","fb-003"],"computed_at":"2026-10-22T12:00:00Z"}
```
실제 `evidence_ids`는 수용 기준에 따라 충분한 개수 또는 pagination 참조 제공. 숫자와 ID 목록 수가 왜 다른지 설명할 수 있어야 함.

### 3.4 작업 제안 (승인 전)
```json
{
 "id":"prop-001","business_id":"biz-cafe","state":"PENDING_APPROVAL",
 "tool_name":"create_task",
 "args":{"title":"혼잡 시간 주문 동선 점검","description":"12~13시 주문 단계 점검"},
 "plan_sha256":"<64 hex chars>","plan_version":1,
 "evidence_refs":["fb-001","ins-001"],"expires_at":"2026-10-23T12:00:00Z"
}
```
**읽기 요청만으로 task 저장 금지.** 서버가 tool과 args를 고정해 산출한 plan_sha256을 읽음.

### 3.5 승인 후 실행
```json
POST /api/v1/businesses/biz-cafe/proposals/prop-001/approve
{"expected_plan_sha256":"<64 hex chars>"}
```
```json
{"proposal_id":"prop-001","approval_state":"APPROVED", "execution":{
 "id":"exec-001","state":"SUCCEEDED","result_type":"task","result_id":"task-001"}}
```
반복 요청도 **같은 결과 식별자**를 반환하도록 설계. 이미 REJECTED/EXPIRED 또는 다른 hash이면 `409`.

### 3.6 업무 상태 조회
```json
{"id":"task-001","business_id":"biz-cafe","title":"혼잡 시간 주문 동선 점검",
 "state":"OPEN","source_proposal_id":"prop-001","created_at":"2026-10-22T12:00:00Z"}
```

## 4. HTTP / 오류 계약
| Status | error.code | 설명·프론트 처리 |
|---|---|---|
| 400 | INVALID_INPUT | 파일/필드 형식 오류, 수정 요청 |
| 401 | UNAUTHENTICATED | 토큰 없음/만료 → 로그인 |
| 403 | FORBIDDEN | 권한 부족; 자원 존재 노출 금지 정책 병행 |
| 404 | NOT_FOUND | 해당 tenant에 없는 자원, 다른 tenant의 ID도 여기로 |
| 409 | CONFLICT/STALE_PROPOSAL | 중복 상태/계획 변경; UI 새로고침 |
| 422 | VALIDATION_FAILED | Pydantic 필드 오류 |
| 429 | MODEL_RATE_LIMIT | 공급자 쿼터; 재시도 안내 |
| 502 | MODEL_RESPONSE_INVALID | AI JSON/schema/근거 검증 실패 |
| 503 | MODEL_UNAVAILABLE | 공급자 장애; 로컬 데이터 및 승인 처리 영향 최소화 |
| 504 | MODEL_TIMEOUT | 모델 응답 시간 초과 |

## 5. 계약 잠금 체크리스트
- [ ] FE/BE 공동 회의에서 모든 엔드포인트의 영문 이름·필드·상태 enum 확정.
- [ ] FastAPI `openapi.json`을 코드 저장소에 snapshot 관리 또는 타입 생성에 사용.
- [ ] TypeScript 타입 생성 또는 Zod 런타임 검증 전략 확정.
- [ ] Auth 경로와 바디에 business_id 위조 테스트, 다른 tenant의 제안 ID 승인 테스트.
- [ ] 프론트는 서버가 반환한 승인·실행 상태만 신뢰.
