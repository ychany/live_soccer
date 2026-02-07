import { Link } from 'react-router-dom';
import type { FixtureResponse } from '../types/football';
import { LIVE_STATUSES, FINISHED_STATUSES } from '../constants/leagues';
import { formatTime, formatShortDate } from '../utils/format';
import styles from './MatchCard.module.css';

interface MatchCardProps {
  match: FixtureResponse;
  showDate?: boolean; // 날짜 표시 여부
}

export function MatchCard({ match, showDate = false }: MatchCardProps) {
  const { fixture, teams, goals } = match;
  const isLive = LIVE_STATUSES.has(fixture.status.short);
  const isFinished = FINISHED_STATUSES.has(fixture.status.short);

  return (
    <Link to={`/match/${fixture.id}`} className={styles.card}>
      {/* 상단: 날짜/시간 */}
      <div className={styles.header}>
        <div className={styles.timeBox}>
          {showDate && <span className={styles.dateText}>{formatShortDate(fixture.date)}</span>}
          <span>{formatTime(fixture.date)}</span>
        </div>
      </div>

      {/* 중앙: 팀 + 스코어 + 상태 */}
      <div className={styles.matchContent}>
        {/* 홈팀 */}
        <div className={styles.team}>
          <img src={teams.home.logo} alt="" className={styles.teamLogo} />
          <span className={`${styles.teamName} ${teams.home.winner ? styles.winner : ''}`}>
            {teams.home.name}
          </span>
        </div>

        {/* 스코어 & 상태 (중앙 배치) */}
        <div className={`${styles.scoreBox} ${isLive ? styles.liveBox : ''}`}>
          {(isLive || isFinished) ? (
            <>
              {isLive && (
                <div className={styles.liveBadge}>
                  <span className={styles.liveDot} />
                  <span>{fixture.status.elapsed}'</span>
                </div>
              )}
              <div className={`${styles.score} ${isLive ? styles.liveScore : ''}`}>
                <span className={teams.home.winner ? styles.winner : ''}>{goals.home ?? 0}</span>
                <span className={styles.scoreDivider}>-</span>
                <span className={teams.away.winner ? styles.winner : ''}>{goals.away ?? 0}</span>
              </div>
              {isFinished && (
                <div className={styles.finishedBadge}>종료</div>
              )}
            </>
          ) : (
            <span className={styles.vs}>VS</span>
          )}
        </div>

        {/* 원정팀 */}
        <div className={styles.team}>
          <img src={teams.away.logo} alt="" className={styles.teamLogo} />
          <span className={`${styles.teamName} ${teams.away.winner ? styles.winner : ''}`}>
            {teams.away.name}
          </span>
        </div>
      </div>

      {/* 경기장 정보 */}
      {fixture.venue.name && (
        <div className={styles.venueInfo}>
          <span className={styles.venueIcon}>📍</span>
          <span className={styles.venueName}>{fixture.venue.name}</span>
        </div>
      )}
    </Link>
  );
}


