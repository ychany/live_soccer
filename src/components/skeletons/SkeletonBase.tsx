import styles from './SkeletonBase.module.css';

interface SkeletonBaseProps {
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    className?: string;
}

export function SkeletonBase({ variant = 'text', width, height, className = '' }: SkeletonBaseProps) {
    const style = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
        <div
            className={`${styles.skeleton} ${styles[variant]} ${className}`}
            style={style}
        />
    );
}
