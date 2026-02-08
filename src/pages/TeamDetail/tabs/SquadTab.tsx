import { Link } from 'react-router-dom';
import { useTeamSquad } from '../../../hooks/useTeam';
import { Loading, EmptyState } from '../../../components/common';
import { getPositionText } from '../../../utils/format';
import { Users } from 'lucide-react';
import styles from '../TeamDetail.module.css';

interface SquadTabProps {
    teamId: number;
}

export function SquadTab({ teamId }: SquadTabProps) {
    const { data: squad, isLoading } = useTeamSquad(teamId);

    if (isLoading) return <Loading />;

    if (!squad || !squad.players || squad.players.length === 0) {
        return <EmptyState icon={<Users size={48} />} message="스쿼드 정보가 없습니다" />;
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
