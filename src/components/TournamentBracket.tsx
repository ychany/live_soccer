import { Link } from 'react-router-dom';
import type { FixtureResponse } from '../types/football';
import { getRoundNameKo, getRoundOrder, FINISHED_STATUSES } from '../constants/leagues';
import { formatShortDate } from '../utils/format';
import styles from './TournamentBracket.module.css';

interface TournamentRound {
  name: string;
  nameKo: string;
  order: number;
  fixtures: FixtureResponse[];
}

interface TeamAdvancement {
  teamId: number;
  teamName: string;
  teamLogo: string;
  advanced: boolean;
  goalsFor: number;
  goalsAgainst: number;
  isPenaltyWin: boolean;
  opponentName: string;
}

interface TournamentBracketProps {
  fixtures: FixtureResponse[];
  teamId?: number; // 특정 팀 하이라이트용
}

export function TournamentBracket({ fixtures, teamId }: TournamentBracketProps) {
  // 라운드별로 경기 그룹화
  const rounds = groupByRound(fixtures);

  // 메인 라운드만 필터링 (32강 이상)
  const mainRounds = rounds.filter(r => r.order >= 40);

  if (mainRounds.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>토너먼트 정보가 없습니다</p>
      </div>
    );
  }

  return (
    <div className={styles.bracket}>
      {mainRounds.map((round) => (
        <RoundSection key={round.name} round={round} teamId={teamId} />
      ))}
    </div>
  );
}

function RoundSection({ round, teamId }: { round: TournamentRound; teamId?: number }) {
  const advancements = extractAdvancements(round);
  const advanced = advancements.filter(a => a.advanced);
  const eliminated = advancements.filter(a => !a.advanced);
  const pendingMatches = round.fixtures.filter(
    f => !FINISHED_STATUSES.has(f.fixture.status.short)
  );

  const isFinal = round.order >= 100;

  return (
    <div className={`${styles.roundSection} ${isFinal ? styles.finalRound : ''}`}>
      {/* 라운드 헤더 */}
      <div className={styles.roundHeader}>
        <h3 className={`${styles.roundName} ${isFinal ? styles.final : ''}`}>
          {isFinal && '🏆 '}{round.nameKo}
        </h3>
        <div className={styles.roundStats}>
          {advanced.length > 0 && (
            <span className={styles.advancedCount}>✓ {advanced.length}</span>
          )}
          {eliminated.length > 0 && (
            <span className={styles.eliminatedCount}>✗ {eliminated.length}</span>
          )}
          {pendingMatches.length > 0 && (
            <span className={styles.pendingCount}>⏳ {pendingMatches.length}</span>
          )}
        </div>
      </div>

      {/* 진출팀 목록 */}
      {advanced.length > 0 && (
        <div className={styles.teamList}>
          <div className={styles.teamListHeader}>진출</div>
          {advanced.map((team) => (
            <Link
              key={team.teamId}
              to={`/team/${team.teamId}`}
              className={`${styles.teamItem} ${styles.advanced} ${team.teamId === teamId ? styles.highlighted : ''}`}
            >
              <img src={team.teamLogo} alt="" className={styles.teamLogo} />
              <span className={styles.teamName}>{team.teamName}</span>
              <span className={styles.teamScore}>
                {team.goalsFor}-{team.goalsAgainst}
                {team.isPenaltyWin && ' (PK)'}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* 탈락팀 목록 */}
      {eliminated.length > 0 && (
        <div className={styles.teamList}>
          <div className={styles.teamListHeader}>탈락</div>
          {eliminated.map((team) => (
            <Link
              key={team.teamId}
              to={`/team/${team.teamId}`}
              className={`${styles.teamItem} ${styles.eliminated} ${team.teamId === teamId ? styles.highlighted : ''}`}
            >
              <img src={team.teamLogo} alt="" className={styles.teamLogo} />
              <span className={styles.teamName}>{team.teamName}</span>
              <span className={styles.opponentInfo}>vs {team.opponentName}</span>
            </Link>
          ))}
        </div>
      )}

      {/* 예정된 경기 */}
      {pendingMatches.length > 0 && (
        <div className={styles.pendingMatches}>
          <div className={styles.teamListHeader}>예정된 경기</div>
          {pendingMatches.map((match) => (
            <Link
              key={match.fixture.id}
              to={`/match/${match.fixture.id}`}
              className={styles.pendingMatch}
            >
              <div className={styles.matchTeams}>
                <div className={`${styles.matchTeam} ${match.teams.home.id === teamId ? styles.highlighted : ''}`}>
                  <img src={match.teams.home.logo} alt="" className={styles.teamLogo} />
                  <span>{match.teams.home.name}</span>
                </div>
                <span className={styles.vs}>vs</span>
                <div className={`${styles.matchTeam} ${match.teams.away.id === teamId ? styles.highlighted : ''}`}>
                  <img src={match.teams.away.logo} alt="" className={styles.teamLogo} />
                  <span>{match.teams.away.name}</span>
                </div>
              </div>
              <span className={styles.matchDate}>
                {formatShortDate(match.fixture.date)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByRound(fixtures: FixtureResponse[]): TournamentRound[] {
  const grouped: Record<string, FixtureResponse[]> = {};

  for (const fixture of fixtures) {
    const roundName = fixture.league.round || 'Unknown';
    if (!grouped[roundName]) {
      grouped[roundName] = [];
    }
    grouped[roundName].push(fixture);
  }

  const rounds: TournamentRound[] = Object.entries(grouped).map(([name, fixtures]) => ({
    name,
    nameKo: getRoundNameKo(name),
    order: getRoundOrder(name),
    fixtures,
  }));

  // 결승에 가까운 순서대로 정렬 (높은 order가 먼저)
  rounds.sort((a, b) => b.order - a.order);

  return rounds;
}

function extractAdvancements(round: TournamentRound): TeamAdvancement[] {
  const advancements: TeamAdvancement[] = [];

  for (const fixture of round.fixtures) {
    const isFinished = FINISHED_STATUSES.has(fixture.fixture.status.short);

    if (isFinished) {
      const homeWinner = fixture.teams.home.winner === true;
      const awayWinner = fixture.teams.away.winner === true;
      const isPenalty = fixture.fixture.status.short === 'PEN';

      // 홈팀
      advancements.push({
        teamId: fixture.teams.home.id,
        teamName: fixture.teams.home.name,
        teamLogo: fixture.teams.home.logo,
        advanced: homeWinner,
        goalsFor: fixture.goals.home ?? 0,
        goalsAgainst: fixture.goals.away ?? 0,
        isPenaltyWin: isPenalty && homeWinner,
        opponentName: fixture.teams.away.name,
      });

      // 원정팀
      advancements.push({
        teamId: fixture.teams.away.id,
        teamName: fixture.teams.away.name,
        teamLogo: fixture.teams.away.logo,
        advanced: awayWinner,
        goalsFor: fixture.goals.away ?? 0,
        goalsAgainst: fixture.goals.home ?? 0,
        isPenaltyWin: isPenalty && awayWinner,
        opponentName: fixture.teams.home.name,
      });
    }
  }

  return advancements;
}
