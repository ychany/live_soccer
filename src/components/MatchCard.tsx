import { Link } from 'react-router-dom';
import type { FixtureResponse } from '../types/football';
import { LIVE_STATUSES, FINISHED_STATUSES } from '../constants/leagues';
import { formatTime } from '../utils/format';
import styles from './MatchCard.module.css';

interface MatchCardProps {
  match: FixtureResponse;
}

export function MatchCard({ match }: MatchCardProps) {
  const { fixture, teams, goals } = match;
  const isLive = LIVE_STATUSES.has(fixture.status.short);
  const isFinished = FINISHED_STATUSES.has(fixture.status.short);

  return (
    <Link to={`/match/${fixture.id}`} className={styles.card}>
      {/* 상단: 시간 */}
      <div className={styles.header}>
        <div className={`${styles.timeBox} ${isLive ? styles.live : ''}`}>
          {isLive ? (
            <span className={styles.liveTime}>
              {fixture.status.elapsed}'
            </span>
          ) : isFinished ? (
            <span className={styles.finishedTime}>종료</span>
          ) : (
            <span className={styles.time}>{formatTime(fixture.date)}</span>
          )}
        </div>
        {isLive && <span className={styles.liveDot} />}
      </div>

      {/* 중앙: 팀 + 스코어 */}
      <div className={styles.matchContent}>
        {/* 홈팀 */}
        <div className={styles.team}>
          <img src={teams.home.logo} alt="" className={styles.teamLogo} />
          <span className={`${styles.teamName} ${teams.home.winner ? styles.winner : ''}`}>
            {teams.home.name}
          </span>
        </div>

        {/* 스코어 또는 VS */}
        <div className={styles.scoreBox}>
          {(isLive || isFinished) ? (
            <div className={styles.score}>
              <span className={teams.home.winner ? styles.winner : ''}>{goals.home ?? 0}</span>
              <span className={styles.scoreDivider}>:</span>
              <span className={teams.away.winner ? styles.winner : ''}>{goals.away ?? 0}</span>
            </div>
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
    </Link>
  );
}

