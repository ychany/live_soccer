import { SkeletonBase } from './SkeletonBase';
// Assuming we want to reuse card styles or similar layout

export function SkeletonMatchCard() {
    return (
        <div className="match-card" style={{ height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <SkeletonBase width={60} height={16} />
                <SkeletonBase width={40} height={16} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Home Team */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <SkeletonBase variant="circular" width={40} height={40} />
                    <SkeletonBase width={60} height={14} />
                </div>

                {/* Score/Time */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <SkeletonBase width={80} height={32} />
                </div>

                {/* Away Team */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <SkeletonBase variant="circular" width={40} height={40} />
                    <SkeletonBase width={60} height={14} />
                </div>
            </div>
        </div>
    );
}
