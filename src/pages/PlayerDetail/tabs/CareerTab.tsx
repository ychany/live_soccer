import { usePlayerTransfers, usePlayerTrophies } from '../../../hooks/usePlayer';
import { Loading, EmptyState } from '../../../components/common';
import { formatDate } from '../../../utils/format';
import { ClipboardList, Trophy } from 'lucide-react';
import styles from '../PlayerDetail.module.css';

interface CareerTabProps {
    playerId: number;
}

export function CareerTab({ playerId }: CareerTabProps) {
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
