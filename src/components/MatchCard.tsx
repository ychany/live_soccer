import { Link } from 'react-router-dom';
import type { FixtureResponse } from '../types/football';
import { LIVE_STATUSES, FINISHED_STATUSES } from '../constants/leagues';
import { formatTime, formatMatchTime } from '../utils/format';
import styles from './MatchCard.module.css';

interface MatchCardProps {
  match: FixtureResponse;
  hideLeague?: boolean;
}

export function MatchCard({ match, hideLeague = false }: MatchCardProps) {
  const { fixture, teams, goals, league } = match;
  const isLive = LIVE_STATUSES.has(fixture.status.short);
  const isFinished = FINISHED_STATUSES.has(fixture.status.short);

  return (
    <Link to={`/match/${fixture.id}`} className={styles.card}>
      <div className={styles.header}>
        {!hideLeague && (
          <div className={styles.league}>
            <img src={league.logo} alt={league.name} className={styles.leagueLogo} />
            <span>{league.name}</span>
          </div>
        )}
        <div className={`${styles.status} ${hideLeague ? styles.statusFull : ''}`}>
          {isLive && (
            <>
              <span className="live-dot" />
              <span className={styles.liveTime}>
                {formatMatchTime(fixture.status.elapsed, fixture.status.short)}
              </span>
            </>
          )}
          {!isLive && !isFinished && (
            <span className={styles.time}>{formatTime(fixture.date)}</span>
          )}
          {isFinished && (
            <span className={styles.finished}>종료</span>
          )}
        </div>
      </div>

      <div className={styles.teams}>
        <div className={styles.team}>
          <img src={teams.home.logo} alt={teams.home.name} className="team-logo" />
          <span className={styles.teamName}>{teams.home.name}</span>
        </div>

        <div className={styles.score}>
          {(isLive || isFinished) ? (
            <>
              <span className={teams.home.winner ? styles.winner : ''}>{goals.home ?? 0}</span>
              <span className={styles.divider}>-</span>
              <span className={teams.away.winner ? styles.winner : ''}>{goals.away ?? 0}</span>
            </>
          ) : (
            <span className={styles.vs}>VS</span>
          )}
        </div>

        <div className={styles.team}>
          <img src={teams.away.logo} alt={teams.away.name} className="team-logo" />
          <span className={styles.teamName}>{teams.away.name}</span>
        </div>
      </div>
    </Link>
  );
}
