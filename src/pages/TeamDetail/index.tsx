import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTeamInfo } from '../../hooks/useTeam';
import { Header, Loading, Tabs, EmptyState } from '../../components/common';
import styles from './TeamDetail.module.css';
import { Shield } from 'lucide-react';
import { InfoTab } from './tabs/InfoTab';
import { StandingsTab } from './tabs/StandingsTab';
import { StatsTab } from './tabs/StatsTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { SquadTab } from './tabs/SquadTab';
import { TransfersTab } from './tabs/TransfersTab';

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
        <EmptyState icon={<Shield size={48} />} message="팀 정보를 찾을 수 없습니다" />
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
