# ⚽ Kickoff (킥오프)

실시간 축구 경기 정보를 제공하는 토스 스타일의 미니앱입니다.

🔗 **Demo**: https://live-soccer-orpin.vercel.app

## 주요 기능

- **홈** - 라이브 경기 현황 및 주요 경기 일정
- **일정** - 날짜별/리그별 경기 일정 조회 (주간/월간 달력)
- **순위** - 주요 리그 순위표, 득점/도움 순위, 최근 폼
- **리그** - 5대 리그, 유럽 대회, K리그 바로가기
- **경기 상세** - 라인업, 실시간 이벤트, 통계, H2H 정보

## 지원 리그

### 5대 리그
- 프리미어리그 (잉글랜드)
- 라리가 (스페인)
- 분데스리가 (독일)
- 세리에A (이탈리아)
- 리그앙 (프랑스)

### 유럽 대회
- UEFA 챔피언스리그
- UEFA 유로파리그

### K리그
- K리그1
- K리그2

## 기술 스택

- **React 19** + **TypeScript**
- **Vite** - 빌드 도구
- **React Router** - 라우팅
- **TanStack Query** - 서버 상태 관리
- **CSS Modules** - 스타일링
- **API-Football** - 축구 데이터 API

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 환경 변수

`.env` 파일에 API 키를 설정하세요:

```
VITE_API_FOOTBALL_KEY=your_api_key_here
```

## 프로젝트 구조

```
src/
├── api/          # API 호출 함수
├── components/   # 재사용 컴포넌트
├── constants/    # 상수 정의
├── hooks/        # 커스텀 훅
├── pages/        # 페이지 컴포넌트
├── types/        # TypeScript 타입
└── utils/        # 유틸리티 함수
```

## 참고

- UI/UX 디자인: [FootHub](https://github.com/ychany/FootHub) 참고
- 데이터: [API-Football](https://www.api-football.com/)
