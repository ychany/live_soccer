import React from 'react';
import styles from '../MatchDetail.module.css';

interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
}

export function SectionHeader({ icon, title }: SectionHeaderProps) {
    return (
        <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>{icon}</span>
            <span className={styles.sectionTitle}>{title}</span>
        </div>
    );
}
