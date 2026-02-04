import type { ReactNode } from 'react';
import { Activity } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  message: string;
}

export function EmptyState({ icon = <Activity size={48} />, message }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <p>{message}</p>
    </div>
  );
}
