import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useTeamInfo,
  useTeamSquad,
  useTeamFixtures,
  useTeamTransfers,
  useTeamLeagues,
  useTeamStatistics,
  useTeamStandings,
} from '../hooks/useTeam';
import { Header, Loading, Tabs, EmptyState } from '../components/common';
import { MatchCard } from '../components/MatchCard';
import { formatDate, getPositionText } from '../utils/format';
import { FINISHED_STATUSES } from '../constants/leagues';
import styles from './TeamDetail.module.css';

const TABS = [
  { id: 'info', label: '정보' },
  { id: 'standings', label: '순위' },
  { id: 'stats', label: '통계' },
  { id: 'schedule', label: '일정' },
  { id: 'squad', label: '스쿼드' },
  { id: 'transfers', label: '이적' },
];

export function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const teamId = parseInt(id || '0');
  const [activeTab, setActiveTab] = useState('info');

  const { data: team, isLoading } = useTeamInfo(teamId);

  if (isLoading) {
    return (
      <div className="page">
        <Header title="팀 정보" />
        <Loading />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="page">
        <Header title="팀 정보" />
        <EmptyState icon="🛡️" message="팀 정보를 찾을 수 없습니다" />
      </div>
    );
  }

  return (
    <div className="page">
      <Header title="팀 정보" />

      {/* Team Header */}
      <div className={styles.teamHeader}>
        <img src={team.logo} alt={team.name} className={styles.teamLogo} />
        <h1 className={styles.teamName}>{team.name}</h1>
        {team.country && (
          <span className={styles.teamCountry}>{team.country}</span>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'info' && <InfoTab team={team} />}
        {activeTab === 'standings' && <StandingsTab teamId={teamId} />}
        {activeTab === 'stats' && <StatsTab teamId={teamId} />}
        {activeTab === 'schedule' && <ScheduleTab teamId={teamId} />}
        {activeTab === 'squad' && <SquadTab teamId={teamId} />}
        {activeTab === 'transfers' && <TransfersTab teamId={teamId} />}
      </div>
    </div>
  );
}

// 정보 탭
function InfoTab({ team }: { team: NonNullable<ReturnType<typeof useTeamInfo>['data']> }) {
  return (
    <div className={styles.info}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>기본 정보</h3>
        <div className={styles.infoList}>
          {team.founded && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>창단년도</span>
              <span className={styles.infoValue}>{team.founded}년</span>
            </div>
          )}
          {team.country && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>국가</span>
              <span className={styles.infoValue}>{team.country}</span>
            </div>
          )}
          {team.national !== undefined && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>유형</span>
              <span className={styles.infoValue}>
                {team.national ? '국가대표팀' : '클럽팀'}
              </span>
            </div>
          )}
        </div>
      </div>

      {team.venue && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>홈 경기장</h3>
          {team.venue.image && (
            <img
              src={team.venue.image}
              alt={team.venue.name}
              className={styles.venueImage}
            />
          )}
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>경기장명</span>
              <span className={styles.infoValue}>{team.venue.name}</span>
            </div>
            {team.venue.city && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>도시</span>
                <span className={styles.infoValue}>{team.venue.city}</span>
              </div>
            )}
            {team.venue.capacity && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>수용 인원</span>
                <span className={styles.infoValue}>
                  {team.venue.capacity.toLocaleString()}명
                </span>
              </div>
            )}
            {team.venue.surface && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>잔디</span>
                <span className={styles.infoValue}>{team.venue.surface}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 순위 탭
function StandingsTab({ teamId }: { teamId: number }) {
  const { data: leagues, isLoading: leaguesLoading } = useTeamLeagues(teamId);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);

  // 첫 번째 리그 자동 선택
  const leagueId = selectedLeagueId || leagues?.[0]?.league.id;
  const { data: standingsData, isLoading: standingsLoading } = useTeamStandings(
    teamId,
    leagueId || 0
  );

  if (leaguesLoading) return <Loading />;

  if (!leagues || leagues.length === 0) {
    return <EmptyState icon="📊" message="참가 중인 리그 정보가 없습니다" />;
  }

  const isLoading = standingsLoading;
  const teamStanding = standingsData?.standing;
  const allStandings = standingsData?.allStandings;

  return (
    <div className={styles.standings}>
      {/* 리그 선택 */}
      <div className={styles.leagueSelector}>
        {leagues.map((l) => (
          <button
            key={l.league.id}
            className={`${styles.leagueBtn} ${leagueId === l.league.id ? styles.active : ''}`}
            onClick={() => setSelectedLeagueId(l.league.id)}
          >
            <img src={l.league.logo} alt="" className={styles.leagueLogo} />
            {l.league.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loading />
      ) : !teamStanding ? (
        <EmptyState icon="📊" message="순위 정보가 없습니다" />
      ) : (
        <>
          {/* 팀 순위 카드 */}
          <div className={styles.rankCard}>
            <div className={styles.rankNumber}>
              {teamStanding.rank}
              <span className={styles.rankSuffix}>위</span>
            </div>
            <div className={styles.rankLabel}>
              {standingsData.league.name}
            </div>
            <div className={styles.rankStats}>
              <div className={styles.rankStat}>
                <span className={styles.rankStatValue}>{teamStanding.points}</span>
                <span className={styles.rankStatLabel}>승점</span>
              </div>
              <div className={styles.rankStat}>
                <span className={styles.rankStatValue}>{teamStanding.all.win}</span>
                <span className={styles.rankStatLabel}>승</span>
              </div>
              <div className={styles.rankStat}>
                <span className={styles.rankStatValue}>{teamStanding.all.draw}</span>
                <span className={styles.rankStatLabel}>무</span>
              </div>
              <div className={styles.rankStat}>
                <span className={styles.rankStatValue}>{teamStanding.all.lose}</span>
                <span className={styles.rankStatLabel}>패</span>
              </div>
            </div>
          </div>

          {/* 전체 순위표 */}
          {allStandings && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>리그 순위표</h3>
              <table className={styles.standingsTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th style={{ textAlign: 'left' }}>팀</th>
                    <th>경기</th>
                    <th>승점</th>
                    <th>득실</th>
                  </tr>
                </thead>
                <tbody>
                  {allStandings.map((s) => (
                    <tr
                      key={s.team.id}
                      className={s.team.id === teamId ? styles.currentTeam : ''}
                    >
                      <td>{s.rank}</td>
                      <td>
                        <Link to={`/team/${s.team.id}`} className={styles.teamCell}>
                          <img
                            src={s.team.logo}
                            alt=""
                            className={styles.standingsTeamLogo}
                          />
                          <span className={styles.standingsTeamName}>
                            {s.team.name}
                          </span>
                        </Link>
                      </td>
                      <td>{s.all.played}</td>
                      <td>{s.points}</td>
                      <td>{s.goalsDiff > 0 ? `+${s.goalsDiff}` : s.goalsDiff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 통계 탭
function StatsTab({ teamId }: { teamId: number }) {
  const { data: leagues, isLoading: leaguesLoading } = useTeamLeagues(teamId);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);

  // 첫 번째 리그 자동 선택
  const leagueId = selectedLeagueId || leagues?.[0]?.league.id;
  const { data: stats, isLoading: statsLoading } = useTeamStatistics(
    teamId,
    leagueId || 0
  );

  if (leaguesLoading) return <Loading />;

  if (!leagues || leagues.length === 0) {
    return <EmptyState icon="📈" message="참가 중인 리그 정보가 없습니다" />;
  }

  const isLoading = statsLoading;

  return (
    <div className={styles.stats}>
      {/* 리그 선택 */}
      <div className={styles.leagueSelector}>
        {leagues.map((l) => (
          <button
            key={l.league.id}
            className={`${styles.leagueBtn} ${leagueId === l.league.id ? styles.active : ''}`}
            onClick={() => setSelectedLeagueId(l.league.id)}
          >
            <img src={l.league.logo} alt="" className={styles.leagueLogo} />
            {l.league.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loading />
      ) : !stats ? (
        <EmptyState icon="📈" message="통계 정보가 없습니다" />
      ) : (
        <>
          {/* 최근 폼 */}
          {stats.form && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>최근 경기 폼</h3>
              <div className={styles.formRow}>
                {stats.form.split('').slice(-10).map((result, idx) => (
                  <span
                    key={idx}
                    className={`${styles.formBadge} ${
                      result === 'W' ? styles.win : result === 'D' ? styles.draw : styles.lose
                    }`}
                  >
                    {result === 'W' ? '승' : result === 'D' ? '무' : '패'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 경기 기록 */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>경기 기록</h3>
            <div className={styles.statGrid}>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{stats.fixtures.played.total}</div>
                <div className={styles.statLabel}>총 경기</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{stats.fixtures.wins.total}</div>
                <div className={styles.statLabel}>승리</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{stats.fixtures.draws.total}</div>
                <div className={styles.statLabel}>무승부</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{stats.fixtures.loses.total}</div>
                <div className={styles.statLabel}>패배</div>
              </div>
            </div>
          </div>

          {/* 골 통계 */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>골 통계</h3>
            <div className={styles.statRow}>
              <span className={styles.statRowLabel}>총 득점</span>
              <span className={styles.statRowValue}>{stats.goals.for.total.total}골</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statRowLabel}>총 실점</span>
              <span className={styles.statRowValue}>{stats.goals.against.total.total}골</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statRowLabel}>경기당 득점</span>
              <span className={styles.statRowValue}>{stats.goals.for.average.total}골</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statRowLabel}>경기당 실점</span>
              <span className={styles.statRowValue}>{stats.goals.against.average.total}골</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statRowLabel}>클린시트</span>
              <span className={styles.statRowValue}>{stats.clean_sheet.total}경기</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statRowLabel}>무득점 경기</span>
              <span className={styles.statRowValue}>{stats.failed_to_score.total}경기</span>
            </div>
          </div>

          {/* 홈/원정 통계 */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>홈 / 원정</h3>
            <div className={styles.homeAwayGrid}>
              <div className={styles.homeAwayCard}>
                <div className={styles.homeAwayTitle}>🏠 홈</div>
                <div className={styles.homeAwayStats}>
                  <div className={styles.homeAwayStat}>
                    <span className={styles.homeAwayStatLabel}>경기</span>
                    <span className={styles.homeAwayStatValue}>{stats.fixtures.played.home}</span>
                  </div>
                  <div className={styles.homeAwayStat}>
                    <span className={styles.homeAwayStatLabel}>승</span>
                    <span className={styles.homeAwayStatValue}>{stats.fixtures.wins.home}</span>
                  </div>
                  <div className={styles.homeAwayStat}>
                    <span className={styles.homeAwayStatLabel}>무</span>
                    <span className={styles.homeAwayStatValue}>{stats.fixtures.draws.home}</span>
                  </div>
                  <div className={styles.homeAwayStat}>
                    <span className={styles.homeAwayStatLabel}>패</span>
                    <span className={styles.homeAwayStatValue}>{stats.fixtures.loses.home}</span>
                  </div>
                  <div className={styles.homeAwayStat}>
                    <span className={styles.homeAwayStatLabel}>득점</span>
                    <span className={styles.homeAwayStatValue}>{stats.goals.for.total.home}</span>
                  </div>
                  <div className={styles.homeAwayStat}>
                    <span className={styles.homeAwayStatLabel}>실점</span>
                    <span className={styles.homeAwayStatValue}>{stats.goals.against.total.home}</span>
                  </div>
                </div>
              </div>
              <div className={styles.homeAwayCard}>
                <div className={styles.homeAwayTitle}>✈️ 원정</div>
                <div className={styles.homeAwayStats}>
                  <div className={styles.homeAwayStat}>
                    <span className={styles.homeAwayStatLabel}>경기</span>
                    <span className={styles.homeAwayStatValue}>{stats.fixtures.played.away}</span>
                  </div>
                  <div className={styles.homeAwayStat}>
                    <span className={styles.homeAwayStatLabel}>승</span>
                    <span className={styles.homeAwayStatValue}>{stats.fixtures.wins.away}</span>
                  </div>
                  <div className={styles.homeAwayStat}>
                    <span className={styles.homeAwayStatLabel}>무</span>
                    <span className={styles.homeAwayStatValue}>{stats.fixtures.draws.away}</span>
                  </div>
                  <div className={styles.homeAwayStat}>
                    <span className={styles.homeAwayStatLabel}>패</span>
                    <span className={styles.homeAwayStatValue}>{stats.fixtures.loses.away}</span>
                  </div>
                  <div className={styles.homeAwayStat}>
                    <span className={styles.homeAwayStatLabel}>득점</span>
                    <span className={styles.homeAwayStatValue}>{stats.goals.for.total.away}</span>
                  </div>
                  <div className={styles.homeAwayStat}>
                    <span className={styles.homeAwayStatLabel}>실점</span>
                    <span className={styles.homeAwayStatValue}>{stats.goals.against.total.away}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 가장 많이 사용한 포메이션 */}
          {stats.lineups && stats.lineups.length > 0 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>주요 포메이션</h3>
              {stats.lineups.slice(0, 3).map((lineup, idx) => (
                <div key={idx} className={styles.statRow}>
                  <span className={styles.statRowLabel}>{lineup.formation}</span>
                  <span className={styles.statRowValue}>{lineup.played}경기</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 일정 탭
function ScheduleTab({ teamId }: { teamId: number }) {
  const { data: fixtures, isLoading } = useTeamFixtures(teamId);

  if (isLoading) return <Loading />;

  if (!fixtures || fixtures.length === 0) {
    return <EmptyState icon="📅" message="경기 일정이 없습니다" />;
  }

  // 날짜순 정렬 (최신 먼저)
  const sortedFixtures = [...fixtures].sort(
    (a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime()
  );

  // 종료된 경기와 예정된 경기 분리
  const now = new Date();
  const pastMatches = sortedFixtures.filter(
    (f) => FINISHED_STATUSES.has(f.fixture.status.short)
  ).slice(0, 10);
  const upcomingMatches = sortedFixtures
    .filter((f) => new Date(f.fixture.date) > now && !FINISHED_STATUSES.has(f.fixture.status.short))
    .reverse()
    .slice(0, 10);

  return (
    <div className={styles.schedule}>
      {upcomingMatches.length > 0 && (
        <div className={styles.scheduleSection}>
          <h3 className={styles.sectionTitle}>예정된 경기</h3>
          {upcomingMatches.map((match) => (
            <MatchCard key={match.fixture.id} match={match} />
          ))}
        </div>
      )}

      {pastMatches.length > 0 && (
        <div className={styles.scheduleSection}>
          <h3 className={styles.sectionTitle}>최근 경기</h3>
          {pastMatches.map((match) => (
            <MatchCard key={match.fixture.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}

// 스쿼드 탭
function SquadTab({ teamId }: { teamId: number }) {
  const { data: squad, isLoading } = useTeamSquad(teamId);

  if (isLoading) return <Loading />;

  if (!squad || !squad.players || squad.players.length === 0) {
    return <EmptyState icon="👥" message="스쿼드 정보가 없습니다" />;
  }

  // 포지션별 그룹핑
  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];
  const groupedPlayers = positions.map((pos) => ({
    position: pos,
    players: squad.players.filter((p) => p.position === pos),
  }));

  return (
    <div className={styles.squad}>
      {groupedPlayers.map(({ position, players }) => (
        players.length > 0 && (
          <div key={position} className={styles.card}>
            <h3 className={styles.cardTitle}>{getPositionText(position)}</h3>
            <div className={styles.playerList}>
              {players.map((player) => (
                <Link
                  key={player.id}
                  to={`/player/${player.id}`}
                  className={styles.playerItem}
                >
                  <img
                    src={player.photo}
                    alt={player.name}
                    className={styles.playerPhoto}
                  />
                  <div className={styles.playerInfo}>
                    <span className={styles.playerName}>{player.name}</span>
                    <span className={styles.playerMeta}>
                      {player.number && `#${player.number}`}
                      {player.age && ` · ${player.age}세`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}

// 이적 탭
function TransfersTab({ teamId }: { teamId: number }) {
  const { data: transfers, isLoading } = useTeamTransfers(teamId);

  if (isLoading) return <Loading />;

  if (!transfers || transfers.length === 0) {
    return <EmptyState icon="🔄" message="이적 정보가 없습니다" />;
  }

  // 최근 이적만 표시 (최근 20개)
  const recentTransfers = transfers
    .flatMap((t) =>
      t.transfers.map((transfer) => ({
        player: t.player,
        ...transfer,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  // 영입/방출 분리
  const incoming = recentTransfers.filter((t) => t.teams.in.id === teamId);
  const outgoing = recentTransfers.filter((t) => t.teams.out.id === teamId);

  return (
    <div className={styles.transfers}>
      {incoming.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>영입</h3>
          <div className={styles.transferList}>
            {incoming.slice(0, 10).map((transfer, index) => (
              <Link
                key={index}
                to={`/player/${transfer.player.id}`}
                className={styles.transferItem}
              >
                <div className={styles.transferPlayer}>
                  <span className={styles.transferName}>{transfer.player.name}</span>
                  <span className={styles.transferDate}>{formatDate(transfer.date)}</span>
                </div>
                <div className={styles.transferTeams}>
                  <img src={transfer.teams.out.logo} alt="" className={styles.transferLogo} />
                  <span>→</span>
                  <img src={transfer.teams.in.logo} alt="" className={styles.transferLogo} />
                </div>
                <span className={styles.transferType}>{transfer.type}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {outgoing.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>방출</h3>
          <div className={styles.transferList}>
            {outgoing.slice(0, 10).map((transfer, index) => (
              <Link
                key={index}
                to={`/player/${transfer.player.id}`}
                className={styles.transferItem}
              >
                <div className={styles.transferPlayer}>
                  <span className={styles.transferName}>{transfer.player.name}</span>
                  <span className={styles.transferDate}>{formatDate(transfer.date)}</span>
                </div>
                <div className={styles.transferTeams}>
                  <img src={transfer.teams.out.logo} alt="" className={styles.transferLogo} />
                  <span>→</span>
                  <img src={transfer.teams.in.logo} alt="" className={styles.transferLogo} />
                </div>
                <span className={styles.transferType}>{transfer.type}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
