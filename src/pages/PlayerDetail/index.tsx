import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePlayerInfo } from '../../hooks/usePlayer';
import { Header, Tabs, EmptyState } from '../../components/common';
import { getPositionText } from '../../utils/format';
import { User } from 'lucide-react';
import styles from './PlayerDetail.module.css';
import { ProfileTab } from './tabs/ProfileTab';
import { MatchesTab } from './tabs/MatchesTab';
import { SeasonsTab } from './tabs/SeasonsTab';
import { CareerTab } from './tabs/CareerTab';

const TABS = [
  { id: 'profile', label: '프로필' },
  { id: 'matches', label: '경기' },
  { id: 'seasons', label: '시즌통계' },
  { id: 'career', label: '커리어' },
];

import { SkeletonPage } from '../../components/skeletons/SkeletonPage';

export function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const playerId = parseInt(id || '0');
  const [activeTab, setActiveTab] = useState('profile');

  const { data: player, isLoading } = usePlayerInfo(playerId);

  if (isLoading) {
    return <SkeletonPage title="선수 정보" />;
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
        {activeTab === 'matches' && (
          <MatchesTab
            playerId={playerId}
            teamId={currentStats?.team.id}
            teamName={currentStats?.team.name}
          />
        )}
        {activeTab === 'seasons' && <SeasonsTab playerId={playerId} />}
        {activeTab === 'career' && <CareerTab playerId={playerId} />}
      </div>
    </div>
  );
}
