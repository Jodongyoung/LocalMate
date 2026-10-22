# Qwen Code 연결 — Open AI Service Hub (공식 공개 설정 확인)

## 확인된 허브 정보
- 허브: https://open.hasa.re.kr
- API Base URL: `https://open.hasa.re.kr/v1`
- 개발용 모델 ID: `qwen3-coder` (카탈로그에서 실제 API 상태 확인)
- 네이버 모델 후보: `hyperclovax-seed-32b` (카탈로그에서 API Endpoint Available로 표시)
- 무료 개발키: 회원가입 → 이메일 인증 → 개발키 관리에서 `sk-dev-*` 발급. **일일 호출/토큰 제한이 있으며 실고객 대상 서비스 운영은 불가**.
- 공식 참조: https://open.hasa.re.kr/guide, https://open.hasa.re.kr/docs, https://github.com/QwenLM/qwen-code/blob/main/docs/users/configuration/auth.md

## Windows 설치
1. Node.js 22+, Git, VS Code 확인.
2. PowerShell에서:

```powershell
node --version
npm install -g @qwen-code/qwen-code@latest
qwen --version
```

3. `https://open.hasa.re.kr` 회원가입/인증 후 `https://open.hasa.re.kr/account/dev-keys`에서 개인 개발키 발급. 남에게 공유하지 말고 로컬에만 저장.

## Qwen Code 인증 연결
1. 이 저장소 `.qwen/settings.example.json`을 **사용자 PC의 프로젝트 `.qwen/settings.json`**으로 복사.
2. 이 저장소 `.qwen/.env` 파일을 새로 만들고 아래 형식으로 기록합니다. `sk-dev-...`는 실제 사용자 키로 바꾸세요. `.qwen/.env`는 `.gitignore`로 제외됩니다.

```dotenv
HASAHUB_API_KEY=sk-dev-발급받은-실제-키
```

3. 프로젝트 루트에서 `qwen`을 실행하고 모델이 `qwen3-coder`로 표시되는지, 인증/도구 호출이 가능한지 확인합니다. 설정 메뉴가 뜨면 `/auth`의 Custom Provider(OpenAI-compatible)를 이용할 수 있습니다. `/doctor`로 진단합니다.

4. 확인 프롬프트: `AGENTS.md와 docs/02_SRS.md를 읽고 FR 요구사항 ID 5개를 열거해 줘. 파일을 수정하지 마.`

> **주의:** Qwen Code가 학교 허브의 Chat Completions 응답을 받아도 에이전트의 파일 편집/도구 호출까지 정상이라는 뜻은 아닙니다. 초기 테스트에서 실제로 `git diff`, file reads, tool calling을 검증한 뒤 개발을 맡기세요. 환경별 지원 차이로 설정 구문이 달라지면 공식 Qwen Code 문서를 우선합니다.

## LocalMate 제품 내 AI 연결과 분리
- Qwen Code 자체는 개발용 코딩 에이전트.
- LocalMate 제품 AI는 서버 측 `LLM_BASE_URL=https://open.hasa.re.kr/v1`, `LLM_MODEL=hyperclovax-seed-32b` 등으로 별도 설정해 모델 연동을 검증할 수 있습니다. `LLM_PROVIDER=mock`에서 임의로 활성 전환하지 마세요.
- **네이버의 모델을 Open AI Service Hub에서 호스팅한 것으로, NAVER Cloud CLOVA Studio 유료 API 계정을 발급받았다는 뜻은 아닙니다.** API 서비스와 사용 조건이 다릅니다.
- 사용하려는 모델이 도구 호출/구조화 JSON을 지원하는지 직접 검사하고, 불가능하면 서버가 도구 실행을 통제하는 스키마 검증 루틴으로 설계하세요.

## 비용 및 데이터
- 개발키는 무료/한도 제한/PoC 전용이며 실제 영업 서비스 운영에 사용 불가.
- 테스트 요청에 실제 고객 개인정보와 실매출 자료 입력 금지.
- `HASAHUB_API_KEY`, 운영키, Qwen 개인 설정(`.qwen/.env`, `.qwen/settings.json`)을 GitHub에 커밋하지 마세요.
- Qwen OAuth의 무료 로그인 방식은 2026-04-15 중단됨. 이번 경로는 Qwen OAuth가 아니라 허브 API 키 이용입니다.
