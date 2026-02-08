import { Header } from '../common';
import { SkeletonDetailHeader } from './SkeletonDetailHeader';
import { SkeletonList } from './SkeletonList';

interface SkeletonPageProps {
    title?: string;
}

export function SkeletonPage({ title = '로딩 중...' }: SkeletonPageProps) {
    return (
        <div className="page">
            <Header title={title} />
            <SkeletonDetailHeader />
            <div style={{ padding: '0 20px' }}>
                <SkeletonList count={3} height={50} />
                <div style={{ marginTop: '20px' }}>
                    <SkeletonList count={3} height={100} />
                </div>
            </div>
        </div>
    );
}
