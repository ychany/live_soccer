import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  usePlayerInfo,
  usePlayerTransfers,
  usePlayerTrophies,
  usePlayerSidelined,
  usePlayerMultiSeasonStats,
} from '../hooks/usePlayer';
import { Header, Loading, Tabs, EmptyState } from '../components/common';
import { formatDate, getPositionText, formatNumber } from '../utils/format';
import { User, Activity, ClipboardList, Trophy } from 'lucide-react';
import styles from './PlayerDetail.module.css';

const TABS = [
  { id: 'profile', label: '프로필' },
  { id: 'matches', label: '경기' },
  { id: 'seasons', label: '시즌통계' },
  { id: 'career', label: '커리어' },
];

export function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const playerId = parseInt(id || '0');
  const [activeTab, setActiveTab] = useState('profile');

  const { data: player, isLoading } = usePlayerInfo(playerId);

  if (isLoading) {
    return (
      <div className="page">
        <Header title="선수 정보" />
        <Loading />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="page">
        <Header title="선수 정보" />
        <EmptyState icon={<User size={48} />} message="선수 정보를 찾을 수 없습니다" />
      </div>
    );
  }

  const { player: info, statistics } = player;
  const currentStats = statistics[0];

  return (
    <div className="page">
      <Header title="선수 정보" />

      {/* Player Header */}
      <div className={styles.playerHeader}>
        <img src={info.photo} alt={info.name} className={styles.playerPhoto} />
        <div className={styles.playerInfo}>
          <h1 className={styles.playerName}>{info.name}</h1>
          <div className={styles.playerMeta}>
            <span>{info.nationality}</span>
            <span>·</span>
            <span>{info.age}세</span>
            {currentStats && (
              <>
                <span>·</span>
                <span>{getPositionText(currentStats.games.position)}</span>
              </>
            )}
          </div>
          {currentStats && (
            <Link to={`/team/${currentStats.team.id}`} className={styles.playerTeam}>
              <img src={currentStats.team.logo} alt="" className={styles.teamLogo} />
              <span>{currentStats.team.name}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'profile' && <ProfileTab player={player} />}
        {activeTab === 'matches' && <MatchesTab playerId={playerId} />}
        {activeTab === 'seasons' && <SeasonsTab playerId={playerId} />}
        {activeTab === 'career' && <CareerTab playerId={playerId} />}
      </div>
    </div>
  );
}

// 프로필 탭
function ProfileTab({ player }: { player: NonNullable<ReturnType<typeof usePlayerInfo>['data']> }) {
  const { player: info, statistics } = player;
  const currentStats = statistics[0];
  const { data: sidelined } = usePlayerSidelined(info.id);

  return (
    <div className={styles.profile}>
      {/* 기본 정보 */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>기본 정보</h3>
        <div className={styles.infoList}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>이름</span>
            <span className={styles.infoValue}>
              {info.firstname} {info.lastname}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>생년월일</span>
            <span className={styles.infoValue}>
              {info.birth.date} ({info.age}세)
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>출생지</span>
            <span className={styles.infoValue}>
              {info.birth.place || '-'}, {info.birth.country}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>국적</span>
            <span className={styles.infoValue}>{info.nationality}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>신장</span>
            <span className={styles.infoValue}>{info.height || '-'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>체중</span>
            <span className={styles.infoValue}>{info.weight || '-'}</span>
          </div>
          {info.injured && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>상태</span>
              <span className={`${styles.infoValue} ${styles.injured}`}>부상</span>
            </div>
          )}
        </div>
      </div>

      {/* 현재 시즌 통계 */}
      {currentStats && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            {currentStats.league.season} 시즌 통계
          </h3>
          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <span className={styles.statValue}>
                {formatNumber(currentStats.games.appearences)}
              </span>
              <span className={styles.statLabel}>출전</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>
                {formatNumber(currentStats.goals.total)}
              </span>
              <span className={styles.statLabel}>골</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>
                {formatNumber(currentStats.goals.assists)}
              </span>
              <span className={styles.statLabel}>도움</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>
                {currentStats.games.rating
                  ? parseFloat(currentStats.games.rating).toFixed(1)
                  : '-'}
              </span>
              <span className={styles.statLabel}>평점</span>
            </div>
          </div>
        </div>
      )}

      {/* 부상 이력 */}
      {sidelined && sidelined.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>부상/결장 이력</h3>
          <div className={styles.sidelinedList}>
            {sidelined.slice(0, 5).map((item, index) => (
              <div key={index} className={styles.sidelinedItem}>
                <span className={styles.sidelinedType}>{item.type}</span>
                <span className={styles.sidelinedDate}>
                  {item.start} ~ {item.end || '진행 중'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 경기 탭
function MatchesTab(_props: { playerId: number }) {
  return (
    <div className={styles.matches}>
      <EmptyState icon={<Activity size={48} />} message="출전 경기 정보를 불러오는 중..." />
    </div>
  );
}

// 시즌 통계 탭
function SeasonsTab({ playerId }: { playerId: number }) {
  const { data: seasons, isLoading } = usePlayerMultiSeasonStats(playerId);

  if (isLoading) return <Loading />;

  if (!seasons || seasons.length === 0) {
    return <EmptyState icon={<Activity size={48} />} message="시즌 통계가 없습니다" />;
  }

  return (
    <div className={styles.seasons}>
      {seasons.map((seasonData) => {
        if (!seasonData) return null;
        const { season, data } = seasonData;
        return data.statistics.map((stat, index) => (
          <div key={`${season}-${index}`} className={styles.card}>
            <div className={styles.seasonHeader}>
              <div className={styles.seasonTeam}>
                <img src={stat.team.logo} alt="" className={styles.teamLogoSm} />
                <span>{stat.team.name}</span>
              </div>
              <span className={styles.seasonYear}>{stat.league.season}</span>
            </div>
            <div className={styles.seasonLeague}>
              <img src={stat.league.logo} alt="" className={styles.leagueLogo} />
              <span>{stat.league.name}</span>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span className={styles.statValue}>
                  {formatNumber(stat.games.appearences)}
                </span>
                <span className={styles.statLabel}>출전</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>
                  {formatNumber(stat.goals.total)}
                </span>
                <span className={styles.statLabel}>골</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>
                  {formatNumber(stat.goals.assists)}
                </span>
                <span className={styles.statLabel}>도움</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>
                  {stat.games.rating
                    ? parseFloat(stat.games.rating).toFixed(1)
                    : '-'}
                </span>
                <span className={styles.statLabel}>평점</span>
              </div>
            </div>
          </div>
        ));
      })}
    </div>
  );
}

// 커리어 탭
function CareerTab({ playerId }: { playerId: number }) {
  const { data: transfers, isLoading: transfersLoading } = usePlayerTransfers(playerId);
  const { data: trophies, isLoading: trophiesLoading } = usePlayerTrophies(playerId);

  if (transfersLoading || trophiesLoading) return <Loading />;

  return (
    <div className={styles.career}>
      {/* 이적 기록 */}
      {transfers && transfers.transfers.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>이적 기록</h3>
          <div className={styles.transferList}>
            {transfers.transfers.slice(0, 10).map((transfer, index) => (
              <div key={index} className={styles.transferItem}>
                <span className={styles.transferDate}>{formatDate(transfer.date)}</span>
                <div className={styles.transferTeams}>
                  <img src={transfer.teams.out.logo} alt="" className={styles.teamLogoSm} />
                  <span className={styles.transferArrow}>→</span>
                  <img src={transfer.teams.in.logo} alt="" className={styles.teamLogoSm} />
                </div>
                <span className={styles.transferType}>{transfer.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 트로피 */}
      {trophies && trophies.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>트로피</h3>
          <div className={styles.trophyList}>
            {trophies
              .filter((t) => t.place === 'Winner')
              .slice(0, 20)
              .map((trophy, index) => (
                <div key={index} className={styles.trophyItem}>
                  <Trophy className={styles.trophyIcon} />
                  <div className={styles.trophyInfo}>
                    <span className={styles.trophyName}>{trophy.league}</span>
                    <span className={styles.trophyMeta}>
                      {trophy.season} · {trophy.country}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {(!transfers || transfers.transfers.length === 0) &&
        (!trophies || trophies.length === 0) && (
          <EmptyState icon={<ClipboardList size={48} />} message="커리어 정보가 없습니다" />
        )}
    </div>
  );
}
