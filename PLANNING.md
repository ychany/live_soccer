# Live Soccer 미니앱 기획서

> 토스 앱인토스 미니앱 - FootHub 기반 축구 라이브 스코어 앱

## 📋 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | Live Soccer |
| **플랫폼** | 토스 앱인토스 미니앱 |
| **기술스택** | React + TypeScript + Vite |
| **상태관리** | @tanstack/react-query |
| **라우팅** | react-router-dom |
| **외부 API** | API-Football |
| **참고 프로젝트** | [FootHub](https://github.com/ychany/FootHub) |

### 제외 기능
- ❌ 직관 일기 작성/조회
- ❌ 직관 통계
- ❌ 경기별 댓글
- ❌ 커뮤니티 피드
- ❌ 사용자 신고/차단
- ❌ 인증 (로그인/회원가입)
- ❌ 푸시 알림

---

## ✅ 구현 현황

### 완료된 기능

| 기능 | 상태 | 설명 |
|------|------|------|
| 하단 네비게이션 | ✅ | 홈, 일정, 리그, 순위 4개 탭 |
| 홈 화면 | ✅ | 라이브 경기 카드, 주요 경기 일정 (7일), 리그 바로가기 |
| 일정 화면 | ✅ | 주간/월간 달력, 리그 필터, 경기 목록 |
| 리그 목록 화면 | ✅ | 5대 리그, 유럽 대회, K리그 목록 |
| 순위 화면 | ✅ | 순위/득점/도움/통계 4개 탭 |
| 라이브 경기 | ✅ | 30초 자동 갱신, 리그 우선순위 정렬 |
| 경기 상세 | ✅ | 비교, 통계, 라인업, 순위, 예측 탭 |
| 팀 상세 | ✅ | 정보, 순위, 통계, 일정, 스쿼드, 이적 탭 |
| 선수 상세 | ✅ | 프로필, 경기, 시즌통계, 커리어 탭 |
| 리그 상세 | ✅ | 순위(득점/도움), 일정, 통계 탭 |

### 미구현 기능

| 기능 | 상태 | 비고 |
|------|------|------|
| 국가대표 화면 | ❌ | 2026 월드컵 관련 |
| 즐겨찾기 | ❌ | LocalStorage 기반 |
| 토너먼트 대진표 | ❌ | 컵 대회용 |

---

## 📱 화면 구조

### 하단 네비게이션
```
[🏠 홈] [📅 일정] [🏆 리그] [📊 순위]
```

### 1. 홈 화면 (`/`)
- **리그 바로가기**: 5대 리그 + 유럽 대회 + K리그 (가로 스크롤, 구분선)
- **라이브 경기**: 작은 카드 형태 가로 스크롤 (최대 10경기)
- **주요 경기 일정**: 7일간 일정, 날짜별 → 리그별 그룹화

### 2. 일정 화면 (`/schedule`)
- **달력**: 주간/월간 토글, 날짜 선택
- **리그 필터**: 전체, 주요, 5대 리그, 유럽 대회, K리그
- **경기 목록**: 리그별 그룹화, MatchCard 사용

### 3. 리그 목록 화면 (`/leagues`)
- 5대 리그 섹션
- 유럽 대회 섹션
- K리그 섹션

### 4. 순위 화면 (`/standings`)
- **리그 선택**: 가로 스크롤 버튼
- **탭**: 순위 | 득점 | 도움 | 통계
  - 순위: UCL/UEL 진출권, 강등권 색상 표시
  - 득점/도움: 선수 순위 (금/은/동 배지)
  - 통계: 리그 개요, 1위/꼴찌 팀, 최근 폼, TOP 5 선수

### 5. 라이브 경기 화면 (`/live`)
- 30초 자동 갱신
- 리그 우선순위 정렬
- 깜빡이는 LIVE 인디케이터

### 6. 경기 상세 화면 (`/match/:id`)

| 탭 | 내용 |
|---|---|
| **비교** | 팀 스타일 레이더 차트, 상대전적(H2H), 최근 폼 |
| **통계** | 점유율, 슈팅, 패스 등 + 타임라인(골/카드/교체) |
| **라인업** | 피치뷰 포메이션 + 선수 사진/평점 + 교체선수 IN/OUT |
| **순위** | 리그 순위표 (현재 팀 하이라이트) |
| **예측** | 경기 예측 + 배당률 |

### 7. 팀 상세 화면 (`/team/:id`)

| 탭 | 내용 |
|---|---|
| **정보** | 팀 기본정보 (창단년도, 홈구장, 수용인원) |
| **순위** | 리그별 순위 (리그 선택 가능) |
| **통계** | 시즌 통계 (폼, 경기기록, 골, 홈/원정, 포메이션) |
| **일정** | 최근/예정 경기 |
| **스쿼드** | 포지션별 선수 명단 |
| **이적** | 이적 내역 |

### 8. 선수 상세 화면 (`/player/:id`)

| 탭 | 내용 |
|---|---|
| **프로필** | 기본정보 (사진, 포지션, 국적, 나이), 부상이력 |
| **경기** | 출전 경기 기록 (최근 15경기) |
| **시즌통계** | 멀티시즌 통계 (최근 5시즌) |
| **커리어** | 이적 기록, 트로피 |

### 9. 리그 상세 화면 (`/league/:id`)

| 탭 | 서브탭/내용 |
|---|---|
| **순위** | 순위 \| 득점 \| 도움 서브탭 |
| **일정** | 예정/결과/전체 필터 |
| **통계** | 리그 개요, 1위/꼴찌, 최근 폼, 득점/도움 TOP 5 |

---

## 🔄 네비게이션 플로우

```
[하단 네비게이션]
  ├── [홈] ─────────────────────────────────────┐
  │     ├── 리그 클릭 → [리그 상세]              │
  │     ├── 라이브 카드 클릭 → [경기 상세]       │
  │     └── 경기 카드 클릭 → [경기 상세]         │
  │                                              │
  ├── [일정] ───────────────────────────────────┤
  │     ├── 리그 헤더 클릭 → [리그 상세]         │
  │     └── 경기 카드 클릭 → [경기 상세]         │
  │                                              │
  ├── [리그] ───────────────────────────────────┤
  │     └── 리그 클릭 → [리그 상세]              │
  │                                              │
  └── [순위] ───────────────────────────────────┤
        ├── 팀 클릭 → [팀 상세]                  │
        └── 선수 클릭 → [선수 상세]              │
                                                 │
[경기 상세] ←────────────────────────────────────┤
  ├── 팀 클릭 → [팀 상세]                        │
  └── 선수 클릭 → [선수 상세]                    │
                                                 │
[팀 상세] ←──────────────────────────────────────┤
  └── 선수 클릭 → [선수 상세]                    │
                                                 │
[리그 상세] ←────────────────────────────────────┘
  ├── 팀 클릭 → [팀 상세]
  └── 선수 클릭 → [선수 상세]
```

---

## 🗂️ 프로젝트 구조

```
live-soccer/
├── public/
│   └── index.html
│
├── src/
│   ├── api/
│   │   └── football.ts              # API-Football 서비스
│   │
│   ├── components/
│   │   ├── common/                  # 공통 UI
│   │   │   ├── Header.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── index.ts
│   │   ├── BottomNav.tsx            # 하단 네비게이션
│   │   ├── BottomNav.module.css
│   │   ├── MatchCard.tsx            # 경기 카드
│   │   └── MatchCard.module.css
│   │
│   ├── pages/
│   │   ├── Home.tsx                 # 홈
│   │   ├── Home.module.css
│   │   ├── Schedule.tsx             # 일정 (달력)
│   │   ├── Schedule.module.css
│   │   ├── Leagues.tsx              # 리그 목록
│   │   ├── Leagues.module.css
│   │   ├── Standings.tsx            # 순위
│   │   ├── Standings.module.css
│   │   ├── LiveMatches.tsx          # 라이브 경기
│   │   ├── LiveMatches.module.css
│   │   ├── MatchDetail.tsx          # 경기 상세
│   │   ├── MatchDetail.module.css
│   │   ├── TeamDetail.tsx           # 팀 상세
│   │   ├── TeamDetail.module.css
│   │   ├── PlayerDetail.tsx         # 선수 상세
│   │   ├── PlayerDetail.module.css
│   │   ├── LeagueDetail.tsx         # 리그 상세
│   │   └── LeagueDetail.module.css
│   │
│   ├── hooks/
│   │   ├── useLiveMatches.ts        # 라이브 경기 + 주요 경기
│   │   ├── useMatchDetail.ts        # 경기 상세
│   │   ├── useTeam.ts               # 팀 관련 훅들
│   │   ├── usePlayer.ts             # 선수 관련 훅들
│   │   └── useLeague.ts             # 리그 관련 훅들
│   │
│   ├── types/
│   │   └── football.ts              # TypeScript 타입 정의
│   │
│   ├── constants/
│   │   └── leagues.ts               # 리그 ID, 우선순위, 상태값
│   │
│   ├── utils/
│   │   └── format.ts                # 날짜, 시간 포맷
│   │
│   ├── App.tsx                      # 라우터 설정
│   ├── index.css                    # 글로벌 스타일
│   └── main.tsx                     # 엔트리
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── PLANNING.md
```

---

## 🎨 디자인 시스템

### 색상
```css
--primary: #2563EB;        /* 메인 파란색 */
--primary-light: #DBEAFE;  /* 연한 파란색 */
--success: #10B981;        /* 승리/긍정 */
--warning: #F59E0B;        /* 무승부/주의 */
--danger: #EF4444;         /* 패배/라이브 */
--live: #EF4444;           /* 라이브 표시 */

--text-primary: #111827;
--text-secondary: #6B7280;
--text-tertiary: #9CA3AF;

--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;
--bg-tertiary: #F3F4F6;

--border: #E5E7EB;
--border-light: #F3F4F6;
```

### 간격
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 20px;
--spacing-2xl: 24px;
```

### Border Radius
```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

### 폰트 크기
```css
--font-xs: 11px;
--font-sm: 12px;
--font-md: 14px;
--font-lg: 16px;
--font-xl: 18px;
--font-2xl: 20px;
```

---

## 🎯 리그 ID 상수 (API-Football)

```typescript
// 5대 리그
const PREMIER_LEAGUE = 39;
const LA_LIGA = 140;
const SERIE_A = 135;
const BUNDESLIGA = 78;
const LIGUE_1 = 61;

// 유럽 대회
const CHAMPIONS_LEAGUE = 2;
const EUROPA_LEAGUE = 3;
const CONFERENCE_LEAGUE = 848;

// K리그
const K_LEAGUE_1 = 292;
const K_LEAGUE_2 = 293;

// 국가대항전
const WORLD_CUP = 1;
const EURO = 4;
const AFCON = 6;
const COPA_AMERICA = 9;
const AFC_ASIAN_CUP = 17;

// 컵 대회
const FA_CUP = 45;
const EFL_CUP = 48;
const COPA_DEL_REY = 143;
const DFB_POKAL = 81;
const COPPA_ITALIA = 137;
const COUPE_DE_FRANCE = 66;
```

---

## 📊 API-Football 엔드포인트

### 라이브 & 경기
```
GET /fixtures?live=all                    # 라이브 경기 목록
GET /fixtures?date={YYYY-MM-DD}           # 날짜별 경기
GET /fixtures?id={id}                     # 경기 상세
GET /fixtures/lineups?fixture={id}        # 라인업
GET /fixtures/statistics?fixture={id}     # 경기 통계
GET /fixtures/events?fixture={id}         # 타임라인 이벤트
GET /fixtures/players?fixture={id}        # 선수별 경기 스탯
GET /fixtures/headtohead?h2h={t1}-{t2}    # 상대전적
```

### 예측 & 배당
```
GET /predictions?fixture={id}             # 경기 예측
GET /odds?fixture={id}                    # 배당률
```

### 팀
```
GET /teams?id={id}                        # 팀 기본정보
GET /teams/statistics?team={id}&season=&league=  # 팀 시즌 통계
GET /players/squads?team={id}             # 스쿼드
GET /transfers?team={id}                  # 팀 이적 내역
GET /leagues?team={id}&season={year}      # 팀 참가 리그 목록
```

### 선수
```
GET /players?id={id}&season={year}        # 선수 상세 + 시즌 통계
GET /transfers?player={id}                # 선수 이적 기록
GET /trophies?player={id}                 # 선수 트로피
GET /sidelined?player={id}                # 부상/출전정지 이력
```

### 리그 & 순위
```
GET /leagues?id={id}                      # 리그 정보
GET /standings?league={id}&season={year}  # 순위표
GET /fixtures?league={id}&season={year}   # 리그 경기 일정
GET /players/topscorers?league=&season=   # 득점 순위
GET /players/topassists?league=&season=   # 도움 순위
GET /players/topyellowcards?league=&season=  # 경고 순위
GET /players/topredcards?league=&season=  # 퇴장 순위
```

---

## 🔗 참고 자료

- [FootHub GitHub](https://github.com/ychany/FootHub)
- [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/)
- [앱인토스 예제](https://github.com/toss/apps-in-toss-examples)
- [API-Football 문서](https://www.api-football.com/documentation-v3)
