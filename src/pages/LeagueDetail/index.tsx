import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLeagueInfo } from '../../hooks/useLeague';
import { Header, Loading, Tabs, EmptyState } from '../../components/common';
import styles from './LeagueDetail.module.css';
import { Trophy } from 'lucide-react';
import { StandingsTab } from './tabs/StandingsTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { StatsTab } from './tabs/StatsTab';

const TABS = [
  { id: 'standings', label: '순위' },
  { id: 'schedule', label: '일정' },
  { id: 'stats', label: '통계' },
  { id: 'rank', label: '테이블' },
];

export function LeagueDetail() {
  const { id } = useParams<{ id: string }>();
  const leagueId = parseInt(id || '0');
  const [activeTab, setActiveTab] = useState('standings');

  const { data: leagueInfo, isLoading } = useLeagueInfo(leagueId);

  if (isLoading) {
    return (
      <div className="page">
        <Header title="리그 정보" />
        <Loading />
      </div>
    );
  }

  if (!leagueInfo) {
    return (
      <div className="page">
        <Header title="리그 정보" />
        <EmptyState icon={<Trophy size={48} />} message="리그 정보를 찾을 수 없습니다" />
      </div>
    );
  }

  const { league, country, seasons } = leagueInfo;
  const currentSeason = seasons.find((s) => s.current)?.year || seasons[0]?.year;

  return (
    <div className="page">
      <Header title="리그 정보" />

      {/* League Header */}
      <div className={styles.leagueHeader}>
        <img src={league.logo} alt={league.name} className={styles.leagueLogo} />
        <div className={styles.leagueInfo}>
          <h1 className={styles.leagueName}>{league.name}</h1>
          <div className={styles.leagueMeta}>
            {country.flag && <img src={country.flag} alt="" className={styles.countryFlag} />}
            <span>{country.name}</span>
            <span>·</span>
            <span>{currentSeason}/{currentSeason + 1} 시즌</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'standings' && (
          <StandingsTab leagueId={leagueId} season={currentSeason} />
        )}
        {activeTab === 'schedule' && (
          <ScheduleTab leagueId={leagueId} season={currentSeason} />
        )}
        {activeTab === 'stats' && (
          <StatsTab leagueId={leagueId} season={currentSeason} />
        )}
      </div>
    </div>
  );
}
