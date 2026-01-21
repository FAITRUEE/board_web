# Board Client

React + TypeScript + Vite로 구축한 게시판 프론트엔드 애플리케이션입니다.

<img 
  src="https://github.com/FAITRUEE/board_web/blob/main/Animation.gif?raw=true"
  width="600"
/>

## 기술 스택

- **React** 18.x
- **TypeScript** 5.x
- **Vite** 5.x
- **Tailwind CSS** 3.x
- **TanStack Query (React Query)** - 서버 상태 관리
- **Lucide React** - 아이콘

---

## 🎯 주요 기능

### 1️⃣ JWT 인증
- 회원가입 시 비밀번호 BCrypt 암호화
- 로그인 시 JWT 토큰 발급 (24시간 유효)
- 모든 보호된 API에 토큰 자동 포함
- 프론트엔드 localStorage에 토큰 저장
- 인증 상태에 따른 라우팅 보호

### 2️⃣ 게시글 CRUD
- **목록**: 페이지네이션 (10개씩), 다중 정렬 (최신순/오래된순/조회순/좋아요순)
- **상세**: 조회수 자동 증가, 첨부파일 다운로드
- **작성**: 로그인 필요, 파일 업로드, 그림 그리기, AI 작성 도우미
- **수정/삭제**: 작성자만 가능
- **검색**: 제목/내용 실시간 검색

### 3️⃣ 카테고리 시스템 ✨
- **카테고리 관리**: 생성/수정/삭제 (UI에서 직접 관리)
- **카테고리 속성**: 이름, 색상, 아이콘, 설명
- **필터링**: 카테고리별 게시글 필터링
- **시각화**: 색상 + 아이콘 Badge로 표시
- **카테고리별 라벨**: 목록 및 상세 페이지에 표시

### 4️⃣ 파일 업로드
- **파일 첨부**: 다중 파일 업로드 지원
- **그림 그리기**: 캔버스에서 직접 그림 그려서 첨부
- **이미지 미리보기**: 
  - 목록: 썸네일 표시 (24x24)
  - 상세: 큰 이미지로 미리보기
- **파일 다운로드**: 첨부파일 다운로드 기능

### 5️⃣ 비밀글 기능 🔒
- **비밀번호 설정**: 게시글 작성 시 비밀번호 지정
- **접근 제어**: 비밀번호 입력 후 열람 가능
- **작성자 우선**: 작성자는 비밀번호 없이 접근 가능
- **시각적 표시**: 비밀글 아이콘 및 라벨

### 6️⃣ Rich Text Editor
- **WYSIWYG 에디터**: Quill.js 기반
- **다양한 포맷**: 굵기, 기울임, 밑줄, 색상 등
- **HTML 렌더링**: 작성한 형식 그대로 표시

### 7️⃣ AI 작성 도우미
- **Ollama 연동**: 로컬 LLM 활용
- **자동 생성**: 주제 입력 시 제목/내용 자동 생성
- **한국어 지원**: EXAONE 모델 사용

### 8️⃣ 댓글 시스템
- 게시글별 댓글 목록
- 실시간 댓글 수 표시
- 작성/수정/삭제 (작성자만)
- 댓글 작성자 표시

### 9️⃣ 좋아요 기능
- 좋아요/취소 토글
- 사용자당 게시글당 1개만 가능 (DB Unique 제약)
- 실시간 좋아요 수 업데이트
- 현재 사용자의 좋아요 상태 표시 (하트 색상)

### 🔟 페이지네이션
- 10개씩 페이지 분할
- 페이지 번호 클릭으로 이동
- Ellipsis(...) 처리
- 이전/다음 버튼

### 1️⃣1️⃣ 보안
- CORS 설정 (localhost:3000, 5173 허용)
- Spring Security 권한 관리
- 비인증 API: 목록 조회, 상세 조회
- 인증 필요 API: 작성, 수정, 삭제, 좋아요, 댓글

---

## 📝 특이사항

- **조회수 중복 방지**: useEffect 의존성 배열 최적화
- **좋아요 중복 방지**: DB에 (post_id, user_id) Unique 제약
- **댓글 수, 좋아요 수**: Post 엔티티에 역정규화하여 성능 최적화
- **React Query**: 서버 상태 관리 (자동 캐싱, 리페칭)
- **이미지 최적화**: lazy loading 적용
- **카테고리 필터**: 서버 사이드 필터링으로 성능 최적화

## 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- 백엔드 API 서버 실행 필요

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프리뷰
npm run preview
```

### 환경 변수

`.env` 파일 생성:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 📁 프론트엔드 파일 구조

### 🎨 Types (타입 정의)
**src/types/**

- `auth.ts` - 인증 관련 타입
- `post.ts` - 게시글 타입 (category 포함)
- `comment.ts` - 댓글 타입
- `category.ts` - 카테고리 타입 ✨

### 🌐 Services (API 호출)
**src/services/**

- `authService.ts` - 인증 API
- `postService.ts` - 게시글 API (categoryId 포함)
- `commentService.ts` - 댓글 API
- `categoryService.ts` - 카테고리 API ✨

### 🎣 Hooks (커스텀 훅)
**src/hooks/**

- `usePosts.ts` - 게시글 관련 React Query 훅 (카테고리 필터 포함)
- `useComments.ts` - 댓글 관련 훅
- `useCategories.ts` - 카테고리 관련 훅 ✨

### 🌍 Context (전역 상태)
**src/contexts/**

- `AuthContext.tsx` - 인증 상태 관리

### 📄 Pages (페이지)
**src/pages/**

- `Auth.tsx` - 로그인/회원가입
- `PostListPage.tsx` - 게시글 목록 (카테고리 필터, 썸네일) ✨
- `PostDetailPage.tsx` - 게시글 상세 (이미지 미리보기, 카테고리 표시) ✨
- `PostCreatePage.tsx` - 게시글 작성 (파일/그림 업로드, AI 도우미, 카테고리 선택) ✨
- `PostEditPage.tsx` - 게시글 수정 (카테고리 수정) ✨
- `CategoryManagePage.tsx` - 카테고리 관리 ✨
- `NotFound.tsx` - 404 페이지

### 🧩 Components (컴포넌트)
**src/components/board/**

- `CommentList.tsx` - 댓글 목록
- `Pagination.tsx` - 페이지네이션
- `CategorySelect.tsx` - 카테고리 선택 컴포넌트 ✨
- `DrawingCanvas.tsx` - 그림 그리기 캔버스
- `RichTextEditor.tsx` - Rich Text 에디터
- `AIWritingAssistant.tsx` - AI 작성 도우미
- `SecretPasswordDialog.tsx` - 비밀글 비밀번호 입력

**src/components/ui/** - shadcn/ui 컴포넌트들

---

## 🎨 카테고리 시스템 사용법

### 1. 카테고리 관리
메인 페이지 → **카테고리 관리** 버튼 클릭

### 2. 카테고리 생성
- 이름 입력 (예: 여행, IT, 음식)
- 아이콘 선택 (✈️, 💻, 🍔 등)
- 색상 선택 (팔레트 또는 직접 입력)
- 설명 입력

### 3. 게시글에 카테고리 적용
- 게시글 작성/수정 시 카테고리 선택
- 목록에서 카테고리 Badge 확인
- 카테고리 필터로 게시글 분류

---

## 개발 가이드

### 커밋 컨벤션

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드
- `chore`: 빌드 업무 수정

---

## 📸 스크린샷

- 게시글 목록 (카테고리 필터, 썸네일)
- 게시글 상세 (이미지 미리보기, 카테고리)
- 카테고리 관리 페이지
- 게시글 작성 (AI 도우미, 그림 그리기)
