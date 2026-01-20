# Board Client

React + TypeScript + Vite로 구축한 게시판 프론트엔드 애플리케이션입니다.

<img 
  src="https://github.com/FAITRUEE/board_web/blob/main/%EA%B2%8C%EC%8B%9C%ED%8C%90%20%EC%9B%B9%EC%82%AC%EC%9D%B4%ED%8A%B8.png?raw=true"
  width="600"
/>

## 기술 스택

- **React** 18.x
- **TypeScript** 5.x
- **Vite** 5.x
- **Tailwind CSS** 3.x

---

## 🎯 주요 기능 상세

### 1️⃣ JWT 인증
- 회원가입 시 비밀번호 BCrypt 암호화
- 로그인 시 JWT 토큰 발급 (24시간 유효)
- 모든 보호된 API에 토큰 자동 포함
- 프론트엔드 localStorage에 토큰 저장

### 2️⃣ 게시글 CRUD
- 목록: 페이지네이션 (10개씩), 최신순 정렬
- 상세: 조회수 자동 증가 (중복 방지)
- 작성: 로그인 필요
- 수정/삭제: 작성자만 가능

### 3️⃣ 댓글 시스템
- 게시글별 댓글 목록
- 실시간 댓글 수 표시
- 작성/수정/삭제 (작성자만)

### 4️⃣ 좋아요 기능
- 좋아요/취소 토글
- 사용자당 게시글당 1개만 가능 (DB Unique 제약)
- 실시간 좋아요 수 업데이트
- 현재 사용자의 좋아요 상태 표시 (하트 색상)

### 5️⃣ 페이지네이션
- 10개씩 페이지 분할
- 페이지 번호 클릭으로 이동
- Ellipsis(...) 처리
- 이전/다음 버튼

### 6️⃣ 보안
- CORS 설정 (localhost:3000, 5173 허용)
- Spring Security 권한 관리
- 비인증 API: 목록 조회, 상세 조회
- 인증 필요 API: 작성, 수정, 삭제, 좋아요, 댓글

---

## 📝 특이사항

- 조회수 중복 증가 방지: useEffect 의존성 배열에서 post 제거
- 좋아요 중복 방지: DB에 (post_id, user_id) Unique 제약
- 댓글 수, 좋아요 수: Post 엔티티에 역정규화하여 성능 최적화
- React Query로 서버 상태 관리 (자동 캐싱, 리페칭)

## 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn

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

---

## 📁 프론트엔드 파일 구조 및 설명

### 🎨 Types (타입 정의)
**src/types/**

- `auth.ts` - 인증 관련 타입 (User, LoginRequest, SignupRequest, AuthResponse)
- `post.ts` - 게시글 타입 (Post, CreatePostRequest, UpdatePostRequest, PostListResponse)
- `comment.ts` - 댓글 타입 (Comment, CreateCommentRequest, UpdateCommentRequest)

### 🌐 Services (API 호출)
**src/services/**

- `authService.ts` - 인증 API (로그인, 회원가입, 토큰 관리, JWT 디코딩)
- `postService.ts` - 게시글 API (CRUD, 조회수, 좋아요)
- `commentService.ts` - 댓글 API (CRUD)

### 🎣 Hooks (커스텀 훅)
**src/hooks/**

- `usePosts.ts` - 게시글 관련 React Query 훅
  - `usePosts()` - 게시글 목록 조회
  - `usePost()` - 게시글 상세 조회
  - `useCreatePost()` - 게시글 작성
  - `useUpdatePost()` - 게시글 수정
  - `useDeletePost()` - 게시글 삭제
  - `useIncrementViews()` - 조회수 증가
  - `useToggleLike()` - 좋아요 토글
  
- `useComments.ts` - 댓글 관련 React Query 훅
  - `useComments()` - 댓글 목록 조회
  - `useCreateComment()` - 댓글 작성
  - `useUpdateComment()` - 댓글 수정
  - `useDeleteComment()` - 댓글 삭제

### 🌍 Context (전역 상태)
**src/contexts/**

- `AuthContext.tsx` - 인증 상태 관리 (user, login, signup, logout)

### 📄 Pages (페이지)
**src/pages/**

- `Auth.tsx` - 로그인/회원가입 페이지
- `PostListPage.tsx` - 게시글 목록 (검색, 페이지네이션, 좋아요 표시)
- `PostDetailPage.tsx` - 게시글 상세 (좋아요 버튼, 댓글 섹션)
- `PostCreatePage.tsx` - 게시글 작성 (인증 필요)
- `PostEditPage.tsx` - 게시글 수정 (작성자만)
- `NotFound.tsx` - 404 페이지

### 🧩 Components (컴포넌트)
**src/components/board/**

- `CommentList.tsx` - 댓글 목록 컴포넌트
  - 댓글 작성 폼
  - 댓글 목록 표시
  - 댓글 수정/삭제 (작성자만)
  
- `Pagination.tsx` - 페이지네이션 컴포넌트
  - 이전/다음 버튼
  - 페이지 번호 표시
  - Ellipsis (...) 처리

**src/components/ui/** - shadcn/ui 컴포넌트들
- Button, Card, Input, Textarea, Badge, Separator, Toast 등

### 🎯 App & Main
**src/**

- `App.tsx` - 라우팅 설정, AuthProvider, QueryClient 설정
- `main.tsx` - React 앱 진입점

### ⚙️ 설정 파일
**루트 디렉토리**

- `.env` - 환경 변수 (VITE_API_BASE_URL=http://localhost:8080/api)
- `vite.config.ts` - Vite 설정 (포트 3000)
- `package.json` - 의존성 관리
- `tailwind.config.js` - Tailwind CSS 설정

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
