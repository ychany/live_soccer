import { Link } from 'react-router-dom';
import type { StandingsResponse } from '../types/football';
import styles from './GroupStandings.module.css';

interface GroupStandingsProps {
  standings: StandingsResponse;
  teamId?: number; // 특정 팀 하이라이트용
}

export function GroupStandings({ standings, teamId }: GroupStandingsProps) {
  const groups = standings.league.standings;

  if (!groups || groups.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>순위 정보가 없습니다</p>
      </div>
    );
  }

  // 단일 리그 (리그 페이즈) vs 조별리그 판별
  // 2024-25 시즌부터 챔스는 36팀 단일 리그 (리그 페이즈)
  const isSingleLeague = groups.length === 1;

  if (isSingleLeague) {
    // 리그 페이즈 (단일 리그) - 챔스 새 포맷
    return <LeaguePhaseStandings teams={groups[0]} teamId={teamId} leagueName={standings.league.name} />;
  }

  // 기존 조별리그 형식
  const groupsWithNames = groups.map((group, index) => {
    const groupName = group[0]?.group || `Group ${String.fromCharCode(65 + index)}`;
    return { name: groupName, teams: group };
  });

  return (
    <div className={styles.groupStandings}>
      {groupsWithNames.map((group) => (
        <div key={group.name} className={styles.groupCard}>
          <div className={styles.groupHeader}>
            <span className={styles.groupName}>{formatGroupName(group.name)}</span>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.rankCol}>#</th>
                <th className={styles.teamCol}>팀</th>
                <th>경기</th>
                <th>승</th>
                <th>무</th>
                <th>패</th>
                <th>득실</th>
                <th>승점</th>
              </tr>
            </thead>
            <tbody>
              {group.teams.map((team) => {
                const isCurrentTeam = team.team.id === teamId;
                const isQualified = team.rank <= 2;

                return (
                  <tr
                    key={team.team.id}
                    className={`
                      ${isCurrentTeam ? styles.currentTeam : ''}
                      ${isQualified ? styles.qualified : ''}
                    `}
                  >
                    <td className={styles.rankCol}>
                      <span className={`${styles.rank} ${isQualified ? styles.qualifiedRank : ''}`}>
                        {team.rank}
                      </span>
                    </td>
                    <td className={styles.teamCol}>
                      <Link to={`/team/${team.team.id}`} className={styles.teamCell}>
                        <img
                          src={team.team.logo}
                          alt=""
                          className={styles.teamLogo}
                        />
                        <span className={styles.teamName}>{team.team.name}</span>
                      </Link>
                    </td>
                    <td>{team.all.played}</td>
                    <td>{team.all.win}</td>
                    <td>{team.all.draw}</td>
                    <td>{team.all.lose}</td>
                    <td>{team.goalsDiff > 0 ? `+${team.goalsDiff}` : team.goalsDiff}</td>
                    <td className={styles.points}>{team.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// 리그 페이즈 순위표 (챔스 새 포맷)
function LeaguePhaseStandings({
  teams,
  teamId,
  leagueName
}: {
  teams: StandingsResponse['league']['standings'][0];
  teamId?: number;
  leagueName: string;
}) {
  return (
    <div className={styles.leaguePhase}>
      <div className={styles.groupCard}>
        <div className={styles.groupHeader}>
          <span className={styles.groupName}>{leagueName}</span>
        </div>

        {/* 범례 */}
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.directQualify}`}></span>
            16강 직행 (1-8위)
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.playoff}`}></span>
            플레이오프 (9-24위)
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.eliminated}`}></span>
            탈락 (25위 이하)
          </span>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.rankCol}>#</th>
              <th className={styles.teamCol}>팀</th>
              <th>경기</th>
              <th>승</th>
              <th>무</th>
              <th>패</th>
              <th>득실</th>
              <th>승점</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => {
              const isCurrentTeam = team.team.id === teamId;
              const isDirectQualify = team.rank <= 8; // 16강 직행
              const isPlayoff = team.rank >= 9 && team.rank <= 24; // 플레이오프
              const isEliminated = team.rank >= 25; // 탈락

              return (
                <tr
                  key={team.team.id}
                  className={`
                    ${isCurrentTeam ? styles.currentTeam : ''}
                    ${isDirectQualify ? styles.directQualify : ''}
                    ${isPlayoff ? styles.playoff : ''}
                    ${isEliminated ? styles.eliminatedRow : ''}
                  `}
                >
                  <td className={styles.rankCol}>
                    <span className={`${styles.rank} ${
                      isDirectQualify ? styles.directQualifyRank :
                      isPlayoff ? styles.playoffRank :
                      isEliminated ? styles.eliminatedRank : ''
                    }`}>
                      {team.rank}
                    </span>
                  </td>
                  <td className={styles.teamCol}>
                    <Link to={`/team/${team.team.id}`} className={styles.teamCell}>
                      <img
                        src={team.team.logo}
                        alt=""
                        className={styles.teamLogo}
                      />
                      <span className={styles.teamName}>{team.team.name}</span>
                    </Link>
                  </td>
                  <td>{team.all.played}</td>
                  <td>{team.all.win}</td>
                  <td>{team.all.draw}</td>
                  <td>{team.all.lose}</td>
                  <td>{team.goalsDiff > 0 ? `+${team.goalsDiff}` : team.goalsDiff}</td>
                  <td className={styles.points}>{team.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatGroupName(name: string): string {
  // "Group A" -> "A조"
  const match = name.match(/group\s+([a-z])/i);
  if (match) {
    return `${match[1].toUpperCase()}조`;
  }
  return name;
}
