# Live Soccer 미니앱 기획서

> 토스 앱인토스 미니앱 - FootHub 기반 축구 라이브 스코어 앱

## 📋 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | Live Soccer |
| **플랫폼** | 토스 앱인토스 미니앱 |
| **기술스택** | React + TypeScript |
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

## 📱 화면 구조

### 1. 홈 화면
- 라이브 스코어 섹션 (실시간 경기)
- 5대 리그 빠른 접근 버튼
- 즐겨찾기 팀 일정
- 국가대표팀 섹션

### 2. 라이브 경기 화면
- 30초마다 자동 스코어 갱신
- 리그 우선순위 정렬
  - 1순위: 5대 리그 (EPL, 라리가, 세리에A, 분데스리가, 리그앙)
  - 2순위: 유럽대회 (UCL, UEL, UECL)
  - 3순위: K리그, 국가대항전
  - 4순위: 기타 리그
- 리그별 필터링
- 깜빡이는 LIVE 인디케이터
- 경기 진행 시간 표시

### 3. 경기 상세 화면 (5개 탭)

| 탭 | 내용 |
|---|---|
| **비교** | 팀 스타일 레이더 차트, 상대전적(H2H), 최근 폼 |
| **통계** | 점유율, 슈팅, 패스 등 + 타임라인(골/카드/교체) |
| **라인업** | 피치뷰 포메이션 + 선수 사진/평점 + 교체선수 IN/OUT |
| **순위** | 리그 순위표 |
| **예측** | 경기 예측 + 배당률 |

### 4. 팀 상세 화면 (6개 탭)

| 탭 | 내용 |
|---|---|
| **정보** | 팀 기본정보 (창단년도, 홈구장, 수용인원) |
| **순위** | 리그별 순위 |
| **통계** | 시즌 통계 |
| **일정** | 최근/예정 경기 |
| **스쿼드** | 포지션별 선수 명단 |
| **이적** | 이적 내역 |

### 5. 선수 상세 화면 (4개 탭)

| 탭 | 내용 |
|---|---|
| **프로필** | 기본정보 (사진, 포지션, 국적, 나이), 부상이력 |
| **경기** | 출전 경기 기록 (최근 15경기) |
| **시즌통계** | 멀티시즌 통계 (최근 5시즌) |
| **커리어** | 이적 기록, 트로피 |

### 6. 리그 상세 화면 (3개 탭)

| 탭 | 내용 |
|---|---|
| **순위** | 리그 순위표 + 우승팀/준우승팀 카드 |
| **일정** | 경기 일정 (캘린더뷰) |
| **통계** | 득점왕, 어시스트왕, 경고/퇴장 순위 |

### 7. 국가대표 화면
- 응원 국가 선택 (2026 월드컵 참가국)
- 국가대표팀 일정/정보/선수단
- 2026 월드컵 카운트다운
- 최근 폼 (W/D/L) 표시

### 8. 즐겨찾기 화면
- 팀/선수 검색 및 등록
- 즐겨찾기 팀 경기 일정

---

## 🔄 네비게이션 플로우

```
[홈]
  ├── [라이브 경기] → [경기 상세]
  │                       ├── 팀 클릭 → [팀 상세]
  │                       └── 선수 클릭 → [선수 상세]
  │
  ├── [리그 상세] (5대 리그 버튼)
  │       ├── 팀 클릭 → [팀 상세]
  │       └── 선수 클릭 → [선수 상세]
  │
  ├── [국가대표]
  │       └── 선수 클릭 → [선수 상세]
  │
  └── [즐겨찾기]
          ├── 팀 클릭 → [팀 상세]
          └── 선수 클릭 → [선수 상세]
```

---

## 🎨 공유 컴포넌트

| 컴포넌트 | 용도 |
|---------|------|
| `PitchView` | 라인업 피치뷰 (축구장 + 선수 배치) |
| `TeamComparison` | 팀 비교 레이더 차트 |
| `StandingsTable` | 리그 순위표 |
| `TournamentBracket` | 컵대회 대진표 |
| `MatchCard` | 경기 카드 (라이브/예정/종료) |
| `Timeline` | 경기 이벤트 타임라인 |
| `PlayerCard` | 선수 카드 (사진, 포지션, 평점) |

---

## 📊 API-Football 엔드포인트

### 라이브 & 경기
```
GET /fixtures?live=all                    # 라이브 경기 목록
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
GET /odds/live?fixture={id}               # 실시간 배당률
```

### 팀
```
GET /teams?id={id}                        # 팀 기본정보
GET /teams/statistics?team={id}&season=&league=  # 팀 시즌 통계
GET /players/squads?team={id}             # 스쿼드
GET /transfers?team={id}                  # 팀 이적 내역
GET /injuries?team={id}                   # 부상/결장 선수
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
│   │   ├── common/                  # 공통 UI (Button, Card, Tab 등)
│   │   ├── PitchView.tsx            # 포메이션 피치뷰
│   │   ├── TeamComparison.tsx       # 레이더 차트
│   │   ├── StandingsTable.tsx       # 순위표
│   │   ├── TournamentBracket.tsx    # 대진표
│   │   ├── Timeline.tsx             # 경기 타임라인
│   │   ├── MatchCard.tsx            # 경기 카드
│   │   └── PlayerCard.tsx           # 선수 카드
│   │
│   ├── pages/
│   │   ├── Home.tsx                 # 홈
│   │   ├── LiveMatches.tsx          # 라이브 경기
│   │   ├── MatchDetail.tsx          # 경기 상세 (5탭)
│   │   ├── TeamDetail.tsx           # 팀 상세 (6탭)
│   │   ├── PlayerDetail.tsx         # 선수 상세 (4탭)
│   │   ├── LeagueDetail.tsx         # 리그 상세 (3탭)
│   │   ├── NationalTeam.tsx         # 국가대표
│   │   └── Favorites.tsx            # 즐겨찾기
│   │
│   ├── hooks/
│   │   ├── useLiveMatches.ts        # 30초 자동갱신
│   │   ├── useMatchDetail.ts
│   │   ├── useTeam.ts
│   │   ├── usePlayer.ts
│   │   └── useLeague.ts
│   │
│   ├── types/
│   │   └── football.ts              # TypeScript 타입 정의
│   │
│   ├── constants/
│   │   └── leagues.ts               # 리그 ID, 우선순위 매핑
│   │
│   ├── utils/
│   │   └── format.ts                # 날짜, 시간 포맷
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── PLANNING.md
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

## 📅 개발 우선순위

### Phase 1: 핵심 기능
1. 프로젝트 초기 설정 (Vite + React + TypeScript)
2. API-Football 서비스 연동
3. 라이브 경기 목록 (30초 자동갱신)
4. 경기 상세 (기본 정보 + 라인업)

### Phase 2: 상세 기능
5. 경기 상세 탭 전체 구현 (비교, 통계, 순위, 예측)
6. 팀 상세 화면
7. 선수 상세 화면
8. 피치뷰 시각화

### Phase 3: 확장 기능
9. 리그 상세 화면
10. 국가대표 화면
11. 즐겨찾기 기능 (LocalStorage)
12. 홈 화면 완성

### Phase 4: 마무리
13. 토스 디자인 시스템 적용
14. 반응형 최적화
15. 에러 핸들링 & 로딩 상태
16. 테스트 & QA

---

## 🔗 참고 자료

- [FootHub GitHub](https://github.com/ychany/FootHub)
- [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/)
- [앱인토스 예제](https://github.com/toss/apps-in-toss-examples)
- [API-Football 문서](https://www.api-football.com/documentation-v3)
