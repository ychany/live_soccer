import { useMatchPrediction } from '../../../hooks/useMatchDetail';
import { Loading, EmptyState } from '../../../components/common';
import { SectionHeader } from '../components/SectionHeader';
import styles from '../MatchDetail.module.css';

interface PredictionTabProps {
    fixtureId: number;
}

export function PredictionTab({ fixtureId }: PredictionTabProps) {
    const { data: prediction, isLoading } = useMatchPrediction(fixtureId);

    if (isLoading) return <Loading />;

    if (!prediction) {
        return <EmptyState icon="🔮" message="예측 정보가 없습니다" />;
    }

    // 퍼센트 파싱 함수 (필요시 사용)
    const parsePercent = (str: string) => parseInt(str?.replace('%', '') || '0');

    return (
        <div className={styles.prediction}>
            {/* 승률 예측 바 */}
            <SectionHeader icon="📊" title="승률 예측" />
            <div className={styles.card}>
                <div className={styles.predictionBarLarge}>
                    <div
                        className={styles.predictionBarHome}
                        style={{ width: prediction.predictions.percent.home }}
                    >
                        <span>{prediction.predictions.percent.home}</span>
                    </div>
                    <div
                        className={styles.predictionBarDraw}
                        style={{ width: prediction.predictions.percent.draw }}
                    >
                        <span>{prediction.predictions.percent.draw}</span>
                    </div>
                    <div
                        className={styles.predictionBarAway}
                        style={{ width: prediction.predictions.percent.away }}
                    >
                        <span>{prediction.predictions.percent.away}</span>
                    </div>
                </div>
                <div className={styles.predictionBarLabels}>
                    <span>{prediction.teams.home.name}</span>
                    <span>무승부</span>
                    <span>{prediction.teams.away.name}</span>
                </div>
            </div>

            {/* AI 조언 */}
            <SectionHeader icon="🤖" title="AI 분석" />
            <div className={styles.card}>
                <div className={styles.aiAdvice}>
                    <div className={styles.aiAdviceIcon}>💡</div>
                    <div className={styles.aiAdviceText}>{prediction.predictions.advice}</div>
                </div>

                {prediction.predictions.winner.name && (
                    <div className={styles.predictionWinnerBox}>
                        <span className={styles.predictionWinnerLabel}>예상 승자</span>
                        <span className={styles.predictionWinnerName}>{prediction.predictions.winner.name}</span>
                        {prediction.predictions.winner.comment && (
                            <span className={styles.predictionWinnerComment}>{prediction.predictions.winner.comment}</span>
                        )}
                    </div>
                )}
            </div>

            {/* 오버/언더 예측 */}
            {prediction.predictions.under_over && (
                <>
                    <SectionHeader icon="⚽" title="총 골 수 예측" />
                    <div className={styles.card}>
                        <div className={styles.underOver}>
                            <span className={styles.underOverLabel}>오버/언더 기준</span>
                            <span className={styles.underOverValue}>
                                {prediction.predictions.under_over.includes('-') ? '언더' : '오버'} {Math.abs(parseFloat(prediction.predictions.under_over))}골
                            </span>
                        </div>
                    </div>
                </>
            )}

            {/* 팀 비교 분석 */}
            <SectionHeader icon="⚖️" title="팀 비교 분석" />
            <div className={styles.card}>
                <div className={styles.comparisonGrid}>
                    {Object.entries(prediction.comparison).map(([key, values]) => {
                        const homeVal = parsePercent(values.home);
                        const awayVal = parsePercent(values.away);
                        const winner = homeVal > awayVal ? 'home' : homeVal < awayVal ? 'away' : 'draw';
                        const labelMap: Record<string, string> = {
                            form: '최근 폼',
                            att: '공격력',
                            def: '수비력',
                            h2h: '상대전적',
                            goals: '득점력',
                            total: '종합',
                            poisson_distribution: '확률 분포',
                        };

                        return (
                            <div key={key} className={styles.comparisonRow}>
                                <div className={`${styles.comparisonCell} ${winner === 'home' ? styles.winner : ''}`}>
                                    {values.home}
                                </div>
                                <div className={styles.comparisonCellLabel}>
                                    {labelMap[key] || key}
                                </div>
                                <div className={`${styles.comparisonCell} ${winner === 'away' ? styles.winner : ''}`}>
                                    {values.away}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
