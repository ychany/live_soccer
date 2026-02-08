import { SkeletonBase } from './SkeletonBase';

interface SkeletonListProps {
    count?: number;
    height?: number;
}

export function SkeletonList({ count = 5, height = 60 }: SkeletonListProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        height: `${height}px`,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 16px',
                        background: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-lg)',
                        gap: '16px'
                    }}
                >
                    <SkeletonBase variant="circular" width={32} height={32} />
                    <div style={{ flex: 1 }}>
                        <SkeletonBase variant="text" width="40%" height={20} />
                    </div>
                    <SkeletonBase variant="text" width={40} height={20} />
                </div>
            ))}
        </div>
    );
}
