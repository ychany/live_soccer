import { Link } from 'react-router-dom';
import { TOP_5_LEAGUES, EUROPEAN_COMPETITIONS, K_LEAGUES } from '../constants/leagues';
import styles from './Leagues.module.css';

const LEAGUE_GROUPS = [
  { title: '5대 리그', leagues: TOP_5_LEAGUES },
  { title: '유럽 대회', leagues: EUROPEAN_COMPETITIONS.map(c => ({ ...c, name: c.fullName })) },
  { title: 'K리그', leagues: K_LEAGUES.map(l => ({ ...l, name: l.fullName })) },
];

export function Leagues() {
  return (
    <div className="page">
      {/* 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.title}>리그</h1>
      </header>

      {/* 리그 목록 */}
      <div className={styles.content}>
        {LEAGUE_GROUPS.map((group) => (
          <section key={group.title} className={styles.section}>
            <h2 className={styles.sectionTitle}>{group.title}</h2>
            <div className={styles.leagueList}>
              {group.leagues.map((league) => (
                <Link
                  key={league.id}
                  to={`/league/${league.id}`}
                  className={styles.leagueItem}
                >
                  <span className={styles.leagueFlag}>{league.flag}</span>
                  <span className={styles.leagueName}>{league.name}</span>
                  <span className={styles.arrow}>›</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
