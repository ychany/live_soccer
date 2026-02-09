# Kickoff (킥오프)

실시간 축구 경기 정보를 제공하는 토스 앱인토스 미니앱입니다.

**Demo**: https://kickoff-live.vercel.app

**토스 앱인토스**: `intoss://kickoff`

## 주요 기능

### 홈
- 실시간 라이브 경기 현황 (스코어, 경기 시간)
- 주요 리그별 경기 일정 및 결과
- 토스 공유 / 클립보드 복사

### 순위
- 주요 리그 순위표 (승점, 득실, 최근 폼)
- 유럽 대회 리그 페이즈 순위 + 토너먼트 대진표
- 득점/도움 순위
- 리그 통계 (경기당 골, 팀 비교, 폼 차트)

### 일정
- 날짜별 경기 일정 조회
- 리그별 필터링

### 리그 상세
- 순위표 (일반 리그: 순위/득점/도움, 유럽 대회: 리그 페이즈/토너먼트)
- 경기 일정
- 리그 통계

### 팀 상세
- 팀 개요 및 스쿼드
- 시즌 통계 (경기 기록, 골, 홈/원정, 포메이션)
- 참가 대회 순위표 (유럽 대회: 리그 페이즈/토너먼트)
- 최근 경기 결과

### 선수 상세
- 선수 프로필 및 시즌 통계
- 출전 경기 기록 (실제 출전 경기만 필터링)

### 경기 상세
- 실시간 스코어 및 경기 이벤트 (골, 카드, 교체)
- 라인업 및 포메이션
- 경기 통계
- H2H (상대 전적)

## 지원 리그

| 구분 | 리그 |
|------|------|
| 5대 리그 | 프리미어리그, 라리가, 세리에A, 분데스리가, 리그앙 |
| 유럽 대회 | UEFA 챔피언스리그, 유로파리그, 컨퍼런스리그 |
| K리그 | K리그1, K리그2 |

## 기술 스택

- **React 19** + **TypeScript**
- **Vite 7** - 빌드 도구
- **React Router v7** - 라우팅
- **TanStack React Query** - 서버 상태 관리
- **CSS Modules** - 스타일링
- **Framer Motion** - 애니메이션
- **Lucide React** - 아이콘
- **Recharts** - 차트
- **@apps-in-toss/web-framework** - 토스 앱인토스 연동
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
├── api/            # API 호출 함수 (API-Football)
├── assets/         # 정적 리소스
├── components/     # 공통 컴포넌트
│   ├── common/     # Loading, Header, Tabs, Toast 등
│   ├── skeletons/  # 스켈레톤 로딩 UI
│   ├── BottomNav   # 하단 플로팅 탭바
│   ├── MatchCard   # 경기 카드
│   ├── GroupStandings    # 순위표 (조별리그/리그 페이즈)
│   └── TournamentBracket # 토너먼트 대진표
├── constants/      # 리그 ID, 상태값 등 상수
├── hooks/          # React Query 커스텀 훅
├── pages/          # 페이지 컴포넌트
│   ├── Home        # 홈 (실시간 경기)
│   ├── Standings   # 순위
│   ├── Schedule    # 일정
│   ├── Leagues     # 리그 목록
│   ├── LeagueDetail/   # 리그 상세 (탭: 순위/일정/통계)
│   ├── TeamDetail/     # 팀 상세 (탭: 개요/통계/순위/경기)
│   ├── PlayerDetail/   # 선수 상세 (탭: 개요/경기)
│   └── MatchDetail/    # 경기 상세 (탭: 이벤트/라인업/통계/H2H)
├── types/          # TypeScript 타입 정의
└── utils/          # 유틸리티 함수
```

## 배포

```bash
# 토스 앱인토스 배포
npx granite deploy
```

## 참고

- 데이터: [API-Football](https://www.api-football.com/)
- 플랫폼: [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/)
