import { Link } from 'react-router-dom';
import { useTeamTransfers } from '../../../hooks/useTeam';
import { Loading, EmptyState } from '../../../components/common';
import { formatDate } from '../../../utils/format';
import { ArrowRightLeft } from 'lucide-react';
import styles from '../TeamDetail.module.css';

interface TransfersTabProps {
    teamId: number;
}

export function TransfersTab({ teamId }: TransfersTabProps) {
    const { data: transfers, isLoading } = useTeamTransfers(teamId);

    if (isLoading) return <Loading />;

    if (!transfers || transfers.length === 0) {
        return <EmptyState icon={<ArrowRightLeft size={48} />} message="이적 정보가 없습니다" />;
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
