# Board Client

React + TypeScript + Vite로 구축한 게시판 프론트엔드 애플리케이션입니다.

## 기술 스택

- **React** 18.x
- **TypeScript** 5.x
- **Vite** 5.x
- **Tailwind CSS** 3.x

## 주요 기능

- ✅ 게시글 목록 조회
- ✅ 게시글 상세 조회
- ✅ 게시글 작성
- ✅ 게시글 수정
- ✅ 게시글 삭제

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

### 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 프로젝트 구조

```
src/
├── components/     # 재사용 가능한 컴포넌트
├── pages/          # 페이지 컴포넌트
├── hooks/          # 커스텀 훅
├── services/       # API 서비스
├── types/          # TypeScript 타입 정의
├── utils/          # 유틸리티 함수
└── App.tsx         # 메인 앱 컴포넌트
```

## 개발 가이드

### 코드 스타일

- ESLint + Prettier 사용
- TypeScript strict mode 활성화

### 커밋 컨벤션

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드
- `chore`: 빌드 업무 수정

## 라이선스

MIT
