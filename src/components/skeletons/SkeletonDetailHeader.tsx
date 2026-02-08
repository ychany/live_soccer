import { SkeletonBase } from './SkeletonBase';
// Reusing classes from index.css or similar structure

export function SkeletonDetailHeader() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '24px',
            gap: '20px',
            marginBottom: '20px'
        }}>
            {/* Logo/Photo */}
            <SkeletonBase variant="circular" width={80} height={80} />

            {/* Info */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <SkeletonBase variant="text" width="60%" height={32} />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <SkeletonBase variant="text" width={40} height={20} />
                    <SkeletonBase variant="text" width={40} height={20} />
                    <SkeletonBase variant="text" width={40} height={20} />
                </div>
            </div>
        </div>
    );
}
