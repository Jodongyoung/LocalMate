# 최소 스캐폴딩 작업 보고 — 2026-10-22

## 후속 설치·실행 검증 — 2026-10-22

이 절은 아래의 최초 작성 시점 미설치·미검증 상태를 갱신한다. 사용자가 명세에 있는 의존성 설치를 승인했고 D-07/08/09는 DRAFT로 유지했다. 적용 범위는 ST-01/02 최소 골격 및 FR-029/T-CI 검증 기반이다.

### 설치와 실행 명령

LocalMate 루트의 PowerShell에서 실행했다. npm PowerShell shim 대신 `npm.cmd`를 사용했다.

```powershell
node --version
npm.cmd --version
npm.cmd --prefix frontend install --cache .npm-cache --offline=false
New-Item -ItemType Directory -Force .tmp
$env:TEMP = Join-Path (Get-Location) '.tmp'
$env:TMP = $env:TEMP
python -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install --cache-dir .pip-cache -e './backend[dev]'
npm.cmd --prefix frontend run build
backend/.venv/Scripts/python.exe -m pytest backend/tests -v
backend/.venv/Scripts/python.exe -m pip check
```

TEMP/TMP는 해당 명령 프로세스에만 적용했다. 시스템 PATH나 전역 패키지를 변경하지 않았다. Python 가상환경은 `backend/.venv`에 생성했다.

| 항목 | 실제 설치/확인 결과 |
|---|---|
| 도구 | Node.js 24.20.0, npm 11.19.0, Python 3.14.0 |
| FE | react/react-dom 19.3.1, @types/react/react-dom 19.3.0, TypeScript 5.9.3, Vite 7.3.7 |
| BE | FastAPI 0.159.1, Pydantic 2.14.1, pydantic-core 2.50.1, Uvicorn 0.54.0 |
| BE 테스트 | pytest 9.1.1, httpx 0.28.1, Starlette 1.9.0 |
| npm 설치 | 21 packages 추가, 22 packages 감사, 취약점 0건 |
| pip 설치 | editable localmate-backend 및 명세의 의존성과 전이 의존성 설치 성공 |
| Python 3.14 | Windows amd64용 pydantic-core cp314 wheel 설치 성공, 소스 빌드나 버전 변경 불필요 |

### 검증 결과 및 실패 조사

| 검증 | 결과 |
|---|---|
| TypeScript + Vite production build | PASS, 28 modules, dist 출력 생성 |
| pytest | PASS, 1 passed |
| pip check | PASS, No broken requirements found |
| 실제 Uvicorn HTTP | PASS, `http://127.0.0.1:18763/health` → 200, application/json, `{"status":"ok"}` |

실제 HTTP 검증은 Python subprocess로 `python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 18763`을 실행하고 urllib.request로 요청·검증한 뒤 finally에서 해당 프로세스를 종료했다. 검증 서버 종료를 확인했다.

- 초기 npm 설치는 sandbox의 캐시 전용 접근 때문에 ENOTCACHED로 실패했다. 다운로드 허용 실행에서 동일 명세 설치를 완료했다.
- 초기 venv 생성은 시스템 임시 폴더 PermissionError로 ensurepip가 실패했다. 프로젝트 내부 `.tmp`로 임시 경로를 지정한 재시도로 완료했다. Python 버전 호환성 실패가 아니었다.
- 최초 Vite 빌드는 sandbox의 자식 프로세스 실행 제한으로 spawn EPERM이 발생했다. 허용된 실행에서 같은 빌드 명령이 통과했다. 코드 수정은 필요하지 않았다.
- pytest는 Starlette의 httpx TestClient 폐기 예정 경고를 출력했다. 테스트는 통과했으며 불필요한 신규 `httpx2` 추가나 의존성 버전 변경을 하지 않았다. 향후 테스트 도구 변경은 별도 검토가 필요하다.
- pytest 캐시 생성 권한 경고도 발생했다. 테스트 판정에는 영향이 없었다.
- 캐시 경고 확인을 위해 `backend/.venv/Scripts/python.exe -m pytest backend/tests -v -p no:cacheprovider`로 재실행: 1 passed, TestClient 폐기 예정 경고 1개만 남았다.
- 최종 `git diff --check`는 PASS(추적 중인 변경 대상), `git check-ignore`로 캐시·node_modules·dist·.venv 제외를 확인했다.
- npm은 esbuild postinstall 승인 정책 안내를 출력했다. 추가 승인 설정을 변경하지 않았고 실제 빌드가 통과했다.

### 변경 파일과 남은 한계

- `frontend/package-lock.json`: 실제 해석된 FE 의존성 잠금 파일 생성.
- `.gitignore`: 프로젝트 내부 `.npm-cache/`, `.pip-cache/`, `.tmp/` 제외 추가.
- 이 보고서: 설치 결과와 실제 검증 기록 추가. 기존 소스 및 의존성 명세는 변경하지 않았다.
- `node_modules`, `dist`, `.venv` 및 설치 캐시는 로컬 생성물이며 Git 제외 대상이다.
- 브라우저 화면·모바일·E2E 및 제품 동작은 미검증이다. FE는 여전히 BE를 호출하지 않는다. DB/모델 준비 상태는 `/health` 검증 범위 밖이다.
- Python 환경 전체 버전 잠금은 아직 도입하지 않았다. 현 pyproject 범위로 향후 설치 시 전이 의존성이 달라질 수 있다.
- 기능 개발, commit, push, PR 생성, 브랜치 전환 및 main 변경은 수행하지 않았다.

## 범위와 결정 상태

- 브랜치: `chore/bootstrap`. 초기 미추적 파일은 부트스트랩 문서와 `.gitkeep` 폴더 구성에 해당했고 충돌 표시는 없었다.
- 사용자가 최소 골격 작성을 승인했다. 의존성 설치는 명시적으로 보류했다.
- D-07(스택), D-08(API), D-09(화면)는 DRAFT 유지. D-10/11/12(모델/외부 데이터/운영 DB·배포)는 OPEN 유지.
- 적용 범위: ST-01/BE-01, ST-02/FE-01의 최소 부분 및 FR-029/T-CI의 검증 기반. 제품 요구사항의 수용 완료를 의미하지 않는다. NFR-02/14에 따라 키·고객 데이터는 추가하지 않았다.
- 인증, 사업장, DB, migration, 합성 데이터 생성, 비즈니스 기능, 외부 API, LLM, 배포, CI는 구현하지 않았다. 기존 모의 데이터 폴더는 유지했다.

## 문서 정합성

- 필수 문서 00/02/03/04/05/06/11/13과 AGENTS.md를 읽었다. 00~14 문서와 frontend/backend/data/scripts/tests 폴더가 존재한다.
- AGENTS.md 및 docs의 명시적 `docs/...md` 참조 검사에서 누락 0건. 모든 자연어 참조의 완전한 검증을 의미하지 않는다.
- 기존 README는 제목뿐이었다. 실행 안내 링크를 추가했다.
- 상세설계의 권장 폴더는 향후 제품 구조의 예시다. 현재 최소 골격에 없는 모듈을 구현된 것으로 취급하지 않는다.
- 로드맵 ST-01의 migration 및 ST-02의 라우터·메뉴는 이번 지시서의 최소 범위 밖이다.
- 부트스트랩 지시서가 요구한 `GET /health`는 API 초안 목록에 없다. 이번 구현은 프로세스 생존 확인용 `200 {"status":"ok"}`만 제공한다. DB·모델 준비 상태를 보장하지 않으며 `/api/v1` 제품 계약을 변경하지 않았다. 정식 계약 반영은 팀 합의가 필요하다.
- API 계약 잠금 체크리스트는 미완료: 전체 요청/응답 스키마·enum, 오류 envelope, pagination, 인증 세부사항, OpenAPI snapshot/타입 생성 또는 런타임 검증 전략 확정 필요.
- UI 문서의 알려진 갭(독립 초안 저장, 업무 상태 수정, 사업장 프로필 수정, 대화 목록 API)은 그대로 유지한다.
- 분석 상태는 상세설계에 `NEEDS_REVIEW` 가능성이 언급되지만 UI는 PENDING/SUCCEEDED/FAILED/STALE을 사용한다. 팀이 enum과 처리 방식을 통일해야 한다.
- 루트 `.env.example`은 향후 설정 예시다. 현재 코드는 환경 파일을 읽거나 DB/CORS/모델/인증 설정을 적용하지 않는다. FE는 BE를 호출하지 않으므로 CORS 설정도 추가하지 않았다.

## 생성·수정 파일

| 파일 | 내용 |
|---|---|
| `frontend/package.json` | React/TS/Vite 의존성 제안 및 dev/build/preview 명령 |
| `frontend/tsconfig.json` | strict TypeScript 설정 |
| `frontend/index.html` | 한국어 HTML 진입점 |
| `frontend/src/main.tsx`, `frontend/src/style.css` | 준비 중 화면, 미연결 상태 표시, 기본 유동 레이아웃 |
| `backend/pyproject.toml` | 패키지 메타데이터, 실행/개발 의존성 및 pytest 설정 |
| `backend/app/__init__.py`, `backend/app/main.py` | FastAPI 및 Pydantic 생존 응답 |
| `backend/tests/test_health.py` | TestClient를 통한 HTTP 상태·응답 검사 1개 |
| `README.md`, 이 문서 | 실행 안내 및 미확정 사항·검증 보고 |

## 필요한 설치 항목 — 아직 설치하지 않음

패키지 범위는 초기 제안이며 호환성 검증·잠금이 완료되지 않았다. 설치 승인 후 생성되는 package-lock.json과 Python 환경의 실제 버전을 검토해야 한다.

| 구분 | 항목 |
|---|---|
| 도구 | Node.js: Vite 요구 조건 20.19+ 또는 22.12+ 충족 버전 및 npm. 구체 버전은 팀 확정 필요 |
| FE 실행 | react ^19.0.0, react-dom ^19.0.0 |
| FE 개발 | @types/react ^19.0.0, @types/react-dom ^19.0.0, typescript ~5.9.0, vite ^7.0.0 |
| BE 실행 | fastapi >=0.119,<1; pydantic >=2.12,<3; uvicorn >=0.38,<1 |
| BE 개발 | pytest >=8.4,<10; httpx >=0.28,<1 |
| BE 빌드 | setuptools >=77 (pip의 빌드 격리 환경에서 필요) |

설치 승인 후 LocalMate 루트에서 PowerShell로 실행할 명령:

```powershell
node --version
npm --version
npm --prefix frontend install
python -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -e './backend[dev]'
```

환경 생성 및 패키지 설치 명령은 이번 작업에서 실행하지 않았다. 전역 도구 설치도 수행하지 않았다.

## 환경 진단과 호환성

- `Get-Command node,npm -All`에서 인식되는 명령이 없었다. 현재 프로세스 PATH에 Node.js 설치 경로가 없고 `C:/Program Files/nodejs/node.exe` 및 사용자 npm shim 기본 경로도 없었다. 따라서 미설치 또는 다른 위치 설치/IDE의 오래된 PATH 가능성이 있다. 시스템 전체 미설치를 단정하지 않는다.
- 사용자 확인 후 Node.js 설치 또는 기존 설치 경로를 PATH에 반영하고 IDE/터미널을 다시 열어 버전을 확인해야 한다. 시스템 설정은 이번에 수정하지 않았다.
- Python은 3.14.0, pip 패키지 조회상 fastapi/pydantic/uvicorn/pytest/httpx는 미설치다.
- [Pydantic 2.12 공식 안내](https://pydantic.dev/articles/pydantic-v2-12-release)는 Python 3.14 지원과 지연 annotation의 일부 제한을 설명한다. 이 골격은 Pydantic v2만 사용하며 복잡한 forward annotation은 사용하지 않는다.
- [FastAPI 패키지 메타데이터](https://pypi.org/project/fastapi/) 및 [공식 프로젝트 설정](https://github.com/fastapi/fastapi/blob/master/pyproject.toml)은 Python 3.14 지원을 명시한다. 오래된 FastAPI/Pydantic 조합을 그대로 재사용하지 않아야 한다.
- Python 3.14에서 pydantic-core 등 네이티브 의존성의 OS/아키텍처별 wheel 가용성은 실제 설치 전 미검증이다. 맞는 wheel이 없으면 소스 빌드 도구가 필요할 수 있다. 설치 후 테스트로 확인해야 한다.
- [Vite 공식 가이드](https://vite.dev/guide/)의 Node.js 최소 조건을 확인했다. 패키지 실제 해석·빌드 호환성은 미검증이다.

## 실제 검증 결과

| 검증/명령 | 결과 | 한계 |
|---|---|---|
| Python 표준 라이브러리 json.loads / tomllib.loads | PASS | package.json, tsconfig.json, pyproject.toml 구문만 검사 |
| Python ast.parse | PASS | backend Python 3개 파일 문법만 검사, import/동작 미검증 |
| 문서 `docs/...md` 참조 존재 검사 | PASS | 누락 0건, 의미적 완전성 보장 아님 |
| `python -m pytest backend/tests` | 실행 실패 / 테스트 미검증 | No module named pytest |
| `npm --prefix frontend run build` | 미실행 / 미검증 | Node.js/npm 미인식 및 의존성 미설치 |
| `git diff --check` | PASS | 추적 중인 변경만 검사. README의 LF→CRLF 안내 발생 |
| 신규 파일 trailing whitespace 및 충돌 표식 검사 | PASS | 변경 대상 11개 파일 검사, 문제 0건 |
| 브라우저·실제 HTTP 기동·모바일·E2E | 미검증 | 의존성 설치 보류 |

## 승인 후 다음 실행 절차

1. Node.js/npm 인식 확인 및 위 의존성 설치. DRAFT 확정은 별도 팀 결정이다.
2. `backend/.venv/Scripts/python.exe -m pytest backend/tests` 및 `npm --prefix frontend run build` 실행.
3. 별도 터미널에서 아래 두 서버를 실행한다.

```powershell
backend/.venv/Scripts/python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
npm --prefix frontend run dev
```

4. `http://127.0.0.1:5173` 화면과 `http://127.0.0.1:8000/health` 응답 및 `/docs`를 확인한다. 포트 충돌 시 Vite가 안내한 실제 주소를 따른다.
5. 실제 설치 버전·테스트 결과를 기록하고 팀이 계약/스택을 검토한다. 제품 기능 개발은 별도 승인 범위다.

Commit, push, PR 생성, 브랜치 전환, main 변경은 수행하지 않았다.
