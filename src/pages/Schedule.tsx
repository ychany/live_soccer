import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFixturesByDate } from '../api/football';
import { MatchCard } from '../components/MatchCard';
import { Loading, EmptyState } from '../components/common';
import { MAJOR_LEAGUE_IDS, TOP_5_LEAGUES, EUROPEAN_COMPETITIONS, K_LEAGUES } from '../constants/leagues';
import type { FixtureResponse } from '../types/football';
import styles from './Schedule.module.css';

// 리그 필터 목록
const LEAGUE_FILTERS: { id: string; name: string; logo?: string }[] = [
  { id: 'all', name: '전체' },
  { id: 'major', name: '주요' },
  ...TOP_5_LEAGUES.map(l => ({ id: String(l.id), name: l.name, logo: l.logo })),
  ...EUROPEAN_COMPETITIONS.map(c => ({ id: String(c.id), name: c.name, logo: c.logo })),
  ...K_LEAGUES.map(l => ({ id: String(l.id), name: l.name, logo: l.logo })),
];

// 경기를 리그별로 그룹화
function groupByLeague(matches: FixtureResponse[]): Map<number, { league: FixtureResponse['league']; matches: FixtureResponse[] }> {
  const grouped = new Map<number, { league: FixtureResponse['league']; matches: FixtureResponse[] }>();

  matches.forEach(match => {
    const leagueId = match.league.id;
    if (!grouped.has(leagueId)) {
      grouped.set(leagueId, { league: match.league, matches: [] });
    }
    grouped.get(leagueId)!.matches.push(match);
  });

  return grouped;
}

type CalendarFormat = 'week' | 'month';

export function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState('major');
  const [calendarFormat, setCalendarFormat] = useState<CalendarFormat>('week');

  const dateStr = selectedDate.toISOString().split('T')[0];

  const { data: matches, isLoading } = useQuery({
    queryKey: ['schedule', dateStr],
    queryFn: () => getFixturesByDate(dateStr),
  });

  // 필터 적용
  const filteredMatches = useMemo(() => {
    if (!matches) return [];
    if (selectedLeagueFilter === 'all') return matches;
    if (selectedLeagueFilter === 'major') {
      return matches.filter(m => MAJOR_LEAGUE_IDS.has(m.league.id));
    }
    // 특정 리그 필터
    const leagueId = parseInt(selectedLeagueFilter);
    return matches.filter(m => m.league.id === leagueId);
  }, [matches, selectedLeagueFilter]);

  // 리그별 그룹화
  const leagueGroups = filteredMatches ? groupByLeague(filteredMatches) : new Map();

  const goToToday = () => setSelectedDate(new Date());

  return (
    <div className="page">
      {/* 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.title}>일정</h1>
        <div className={styles.headerActions}>
          <button className={styles.todayBtn} onClick={goToToday}>
            오늘
          </button>
          <button
            className={styles.formatBtn}
            onClick={() => setCalendarFormat(f => f === 'week' ? 'month' : 'week')}
          >
            {calendarFormat === 'week' ? '📅' : '📆'}
          </button>
        </div>
      </header>

      {/* 달력 */}
      <Calendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        format={calendarFormat}
      />

      {/* 리그 필터 */}
      <div className={styles.leagueFilterRow}>
        {LEAGUE_FILTERS.map((league) => (
          <button
            key={league.id}
            className={`${styles.leagueFilterBtn} ${selectedLeagueFilter === league.id ? styles.active : ''}`}
            onClick={() => setSelectedLeagueFilter(league.id)}
          >
            {league.logo ? (
              <img src={league.logo} alt="" className={styles.leagueFilterLogo} />
            ) : (
              <span className={styles.leagueFilterIcon}>{league.id === 'all' ? '🌐' : '⭐'}</span>
            )}
            <span className={styles.leagueFilterName}>{league.name}</span>
          </button>
        ))}
      </div>

      {/* 경기 목록 */}
      <div className={styles.content}>
        {isLoading ? (
          <Loading />
        ) : leagueGroups.size === 0 ? (
          <EmptyState icon="📅" message="해당 날짜에 경기가 없습니다" />
        ) : (
          Array.from(leagueGroups.values()).map(({ league, matches: leagueMatches }) => (
            <div key={league.id} className={styles.leagueGroup}>
              <Link to={`/league/${league.id}`} className={styles.leagueHeader}>
                <img src={league.logo} alt="" className={styles.leagueLogo} />
                <span className={styles.leagueName}>{league.name}</span>
                <span className={styles.leagueCountry}>{league.country}</span>
              </Link>
              <div className={styles.matchList}>
                {leagueMatches.map((match) => (
                  <MatchCard key={match.fixture.id} match={match} hideLeague />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 달력 컴포넌트
interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  format: CalendarFormat;
}

function Calendar({ selectedDate, onSelectDate, format }: CalendarProps) {
  const [focusedDate, setFocusedDate] = useState(selectedDate);
  const today = new Date();

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isToday = (date: Date) => isSameDay(date, today);

  // 주간 달력용 날짜 생성
  const getWeekDates = (centerDate: Date): Date[] => {
    const dates: Date[] = [];
    const startOfWeek = new Date(centerDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // 월간 달력용 날짜 생성
  const getMonthDates = (centerDate: Date): Date[] => {
    const dates: Date[] = [];
    const year = centerDate.getFullYear();
    const month = centerDate.getMonth();

    // 해당 월의 첫 날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 시작 요일 계산 (일요일 = 0)
    const startDay = firstDay.getDay();

    // 이전 달 날짜 채우기
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      dates.push(date);
    }

    // 현재 달 날짜 채우기
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push(new Date(year, month, i));
    }

    // 다음 달 날짜 채우기 (6주 맞추기)
    const remaining = 42 - dates.length;
    for (let i = 1; i <= remaining; i++) {
      dates.push(new Date(year, month + 1, i));
    }

    return dates;
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(focusedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setFocusedDate(newDate);
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(focusedDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setFocusedDate(newDate);
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const monthYear = `${focusedDate.getFullYear()}년 ${focusedDate.getMonth() + 1}월`;

  if (format === 'week') {
    const weekDates = getWeekDates(focusedDate);

    return (
      <div className={styles.calendar}>
        <div className={styles.calendarHeader}>
          <button onClick={() => navigateWeek(-1)} className={styles.navBtn}>‹</button>
          <span className={styles.monthYear}>{monthYear}</span>
          <button onClick={() => navigateWeek(1)} className={styles.navBtn}>›</button>
        </div>
        <div className={styles.weekRow}>
          {weekDates.map((date, idx) => (
            <button
              key={date.toISOString()}
              className={`${styles.dayCell} ${isSameDay(date, selectedDate) ? styles.selected : ''} ${isToday(date) ? styles.today : ''}`}
              onClick={() => onSelectDate(date)}
            >
              <span className={styles.dayOfWeek}>{weekDays[idx]}</span>
              <span className={styles.dayNumber}>{date.getDate()}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 월간 달력
  const monthDates = getMonthDates(focusedDate);
  const currentMonth = focusedDate.getMonth();

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        <button onClick={() => navigateMonth(-1)} className={styles.navBtn}>‹</button>
        <span className={styles.monthYear}>{monthYear}</span>
        <button onClick={() => navigateMonth(1)} className={styles.navBtn}>›</button>
      </div>
      <div className={styles.weekDaysHeader}>
        {weekDays.map(day => (
          <span key={day} className={styles.weekDayLabel}>{day}</span>
        ))}
      </div>
      <div className={styles.monthGrid}>
        {monthDates.map((date) => {
          const isCurrentMonth = date.getMonth() === currentMonth;
          return (
            <button
              key={date.toISOString()}
              className={`${styles.monthDayCell} ${isSameDay(date, selectedDate) ? styles.selected : ''} ${isToday(date) ? styles.today : ''} ${!isCurrentMonth ? styles.otherMonth : ''}`}
              onClick={() => onSelectDate(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
