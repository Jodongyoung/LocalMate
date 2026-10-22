# LocalMate 첫 실행 가이드 (Windows / VS Code)

## 1. 두 묶음의 역할
- `LocalMate_Team_Share_v1.2.zip`: 사람에게 보낼 Word/PPT 문서 묶음. Git 저장소에 올리지 않음.
- `LocalMate_Repo_Bootstrap_v1.2.zip`: 실제 저장소에 풀어 넣는 Markdown/설정/폴더 뼈대.

## 2. 저장소 내려받기
PowerShell 또는 VS Code Terminal에서:

```powershell
git clone https://github.com/Lee-seung-hun398/LocalMate.git
cd LocalMate
git switch -c chore/bootstrap
```

그 후 **Repo_Bootstrap ZIP 내용물 자체**(`AGENTS.md`, `docs/`, `frontend/`, ...)를 `LocalMate/` 루트에 복사합니다. `LocalMate_Repo_Bootstrap_v1.2`라는 폴더를 루트 안에 중첩시키지 마세요. 기존 GitHub README는 패키지의 README로 대체할 수 있습니다. `.git` 폴더는 건드리지 않습니다.

```powershell
git status --short
git diff --check
```

`git diff --check`는 아직 Git이 추적하지 않는 새 파일 내용까지 검사하지 않으므로, 전체 검증은 Codex 보고 및 추가 스크립트 확인까지 진행합니다.

## 3. Codex부터 실행
공식 Codex CLI는 별도 설치/로그인이 필요합니다. 프로젝트 폴더를 VS Code에서 연 뒤 터미널에서:

```powershell
npm install -g @openai/codex
codex
```

ChatGPT 로그인 선택 후 `docs/13_CODEX_BOOTSTRAP_TASK.md`의 지시를 전달합니다. 별도 API 과금 방식 대신 사용할 수 있는 ChatGPT 로그인 경로를 먼저 확인합니다. Codex 실행·로그인 여부는 이 문서가 보증하지 않습니다.

## 4. Qwen Code 연결
[공식 Qwen Code 인증 문서](https://github.com/QwenLM/qwen-code/blob/main/docs/users/configuration/auth.md) 기준 Node.js 22+ 필요:

```powershell
node --version
npm install -g @qwen-code/qwen-code@latest
qwen
```

실행 후 `/auth` → `Custom Provider` → Open AI Service Hub의 OpenAI-compatible API로 설정. **공식 공개 주소는 `https://open.hasa.re.kr/v1`, 모델 ID는 `qwen3-coder`입니다.** 개인 `sk-dev-*` 개발키는 직접 발급받아야 합니다. 설정/유효성 검사는 `docs/14_QWEN_SETUP.md`와 `.qwen/settings.example.json` 참고.

Qwen OAuth 무료 계정 로그인 경로는 2026-04-15 중단된 것으로 공식 문서에 나옵니다. 'Qwen이므로 무료'라고 가정하지 마세요.

## 5. 개발 브랜치
- `main`: 검증된 안정 버전
- `dev`: 팀 통합 브랜치 (초기 구조 리뷰·머지 후 생성 권장)
- `feat/<story-id>-...`: 담당자별 단기 작업 브랜치

첫 bootstrap은 `chore/bootstrap`의 변경 사항을 Codex로 검증하고, 사용자가 확인한 후 커밋/PR·머지합니다. `main`에 무검증 커밋 금지.

## 6. 팀원에게 전달
팀 공유 ZIP → PPT와 Word 요구사항 명세·API 계약·UI 화면·버튼 명세를 검토 → 서로 다른 브랜치에서 작업. Qwen은 `AGENTS.md` 및 docs를 읽고 SRS ID별 작은 작업을 진행합니다.
