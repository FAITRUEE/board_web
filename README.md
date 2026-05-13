# 통합 협업 + AI 작성 도우미 게시판 플랫폼 - Frontend

React + TypeScript + Vite 기반 통합 협업 플랫폼 프론트엔드입니다.
**게시판**, **칸반 보드**, **팀 공동 편집**, **AI 도우미**를 하나의 플랫폼에 통합하여 팀 협업 효율을 극대화합니다.

<img 
  src="https://github.com/FAITRUEE/board_web/blob/main/Animation.gif?raw=true"
  width="600"
/>

---

## 🎯 핵심 기능

### 📝 게시판 시스템
- **JWT 인증**: 안전한 회원가입/로그인
- **게시글 CRUD**: 작성/수정/삭제 (작성자만)
- **카테고리 시스템**: 색상/아이콘 커스터마이징
- **태그 시스템**: 게시글 분류 및 필터 검색
- **파일 업로드**: 이미지 미리보기, 다중 파일 지원
- **그림 그리기**: 캔버스로 직접 그림 첨부
- **비밀글**: 비밀번호로 보호
- **Rich Text Editor**: WYSIWYG 에디터 (Quill.js)
- **AI 작성 도우미**: Ollama 연동
- **댓글 시스템**: 작성/수정/삭제
- **좋아요**: 사용자당 게시글당 1회
- **페이지네이션**: 10개씩 페이징
- **정렬**: 최신순/오래된순/조회순/좋아요순
- **검색**: 제목/내용 실시간 검색

### 🤝 공동 편집 방 (Room-First 협업)
- **방 만들기**: 팀 선택 후 공동 편집 방 생성
- **실시간 동시 편집**: WebSocket(STOMP) 기반 팀원간 즉시 동기화
- **에코 루프 방지**: `isRemoteUpdateRef`로 자신이 보낸 변경사항 재수신 차단
- **자동 저장**: 1초 디바운스로 백엔드에 자동 저장
- **활성 편집자 표시**: 접속 중인 팀원 아바타 실시간 표시
- **게시글 발행**: 완성된 공동 편집 내용을 게시글로 발행 (카테고리/태그 선택)

### 📊 칸반 보드 시스템
- **팀 기반 작업 관리**: 팀별 독립적인 워크스페이스
- **드래그 앤 드롭**: @dnd-kit 활용한 직관적인 카드 이동
- **카드 관리**: TODO/IN_PROGRESS/DONE 상태 관리
- **우선순위**: LOW/MEDIUM/HIGH/URGENT 4단계
- **체크리스트**: 작업 세부 사항 추적
- **카드 댓글**: 카드별 댓글 작성/삭제
- **담당자 지정**: 팀원 할당
- **마감일 관리**: 일정 추적 및 상태 표시
- **실시간 동기화**: WebSocket + React Query 낙관적 업데이트

---

## 🛠️ 기술 스택

### Core
- **React** 18.x
- **TypeScript** 5.x
- **Vite** 5.x

### 상태 관리
- **TanStack Query (React Query)** — 서버 상태 관리, 캐시 무효화
- **React Context** — 전역 인증 상태

### 실시간 통신
- **@stomp/stompjs** + **sockjs-client** — WebSocket/STOMP 공동 편집
- `vite.config.ts`의 `define: { global: 'globalThis' }` 로 Node.js 전역 변수 호환

### 스타일링
- **Tailwind CSS** 3.x
- **shadcn/ui** — UI 컴포넌트
- **Lucide React** — 아이콘

### 주요 라이브러리
- **React Router v6** — 라우팅
- **@dnd-kit** — 드래그 앤 드롭
- **Quill.js** — Rich Text Editor
- **date-fns** — 날짜 처리

---

## 📁 프로젝트 구조
```
src/
├── components/
│   ├── board/
│   │   ├── CommentList.tsx
│   │   ├── CategorySelect.tsx
│   │   ├── TagInput.tsx
│   │   ├── RichTextEditor.tsx
│   │   ├── DrawingCanvas.tsx
│   │   ├── AIWritingAssistant.tsx
│   │   └── SecretPasswordDialog.tsx
│   ├── kanban/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── KanbanCard.tsx
│   │   ├── CardModal.tsx
│   │   └── CardDetailModal.tsx       # 카드 상세 (댓글 포함)
│   ├── layout/
│   │   ├── Layout.tsx
│   │   └── Header.tsx
│   └── ui/                           # shadcn/ui 컴포넌트
│
├── pages/
│   ├── Auth.tsx                      # 로그인/회원가입
│   ├── PostListPage.tsx              # 게시글 목록
│   ├── PostDetailPage.tsx            # 게시글 상세
│   ├── PostCreatePage.tsx            # 게시글 작성
│   ├── PostEditPage.tsx              # 게시글 수정
│   ├── CategoryManagePage.tsx        # 카테고리 관리
│   ├── CollabRoomListPage.tsx        # 공동 편집 방 목록
│   ├── CollabRoomPage.tsx            # 공동 편집 방 (실시간 편집)
│   ├── TeamList.tsx                  # 팀 목록
│   ├── KanbanList.tsx                # 칸반 보드 목록
│   ├── KanbanBoard.tsx               # 칸반 보드 상세
│   └── NotFound.tsx
│
├── hooks/
│   ├── usePosts.ts
│   ├── useComments.ts
│   ├── useCategories.ts
│   ├── useTags.ts
│   ├── useTeam.ts
│   ├── useKanban.ts
│   ├── useCollabRoom.ts              # 공동 편집 방 CRUD
│   ├── useCollabRoomEdit.ts          # 방 전용 WebSocket 훅
│   └── useWebSocket.ts              # STOMP 연결 기반 훅
│
├── services/
│   ├── authService.ts
│   ├── postService.ts
│   ├── commentService.ts
│   ├── categoryService.ts
│   ├── tagService.ts
│   └── collabRoomService.ts         # 공동 편집 방 API
│
├── contexts/
│   └── AuthContext.tsx
│
├── types/
│   ├── auth.ts
│   ├── post.ts
│   ├── comment.ts
│   ├── category.ts
│   ├── tag.ts
│   └── collabRoom.ts                # 공동 편집 방 타입
│
├── App.tsx
└── main.tsx
```

---

## 🗺️ 라우트

| 경로 | 페이지 | 인증 |
|------|--------|------|
| `/` | 게시글 목록 | |
| `/posts/:id` | 게시글 상세 | |
| `/posts/create` | 게시글 작성 | ✅ |
| `/posts/:id/edit` | 게시글 수정 | ✅ |
| `/collab` | 공동 편집 방 목록 | ✅ |
| `/collab/:roomId` | 공동 편집 방 | ✅ |
| `/teams` | 팀 목록 | ✅ |
| `/kanban` | 칸반 보드 목록 | |
| `/kanban/:boardId` | 칸반 보드 상세 | |
| `/categories/manage` | 카테고리 관리 | |
| `/auth` | 로그인/회원가입 | |

---

## 🚀 시작하기

### 필수 요구사항
- **Node.js** 18.x 이상
- 백엔드 API 서버 실행 필요 (`http://localhost:8080`)

### 설치 및 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 프리뷰
```

### 환경 변수

`.env` 파일 생성:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## ⚡ 실시간 협업 구조

```
타이핑
  │
  ├─ setContent()           → UI 즉시 반영
  ├─ broadcastContentChange() → WS 300ms 디바운스 브로드캐스트
  │       └─ /app/collab-room/{roomId}/edit
  │               └─ /topic/collab-room/{roomId} → 팀원 수신
  └─ saveDebounceRef         → 1000ms 후 PUT /api/collab-rooms/{id}/content
```

에코 루프 방지: 원격 변경 수신 시 `isRemoteUpdateRef = true` 설정 → `broadcastContentChange` 조기 종료

---

## 🔐 보안

- JWT Bearer 토큰 (localStorage)
- 토큰 만료 시 자동 로그아웃
- Protected Routes로 인증 필요 페이지 보호
- CORS: `http://localhost:8080`

---

## 👨‍💻 개발자
- **이름**: 이성진
- **기간**: 2026.01 ~
- **역할**: Full-Stack Developer

---

## 📄 라이선스
MIT License
