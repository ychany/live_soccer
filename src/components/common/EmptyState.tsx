interface EmptyStateProps {
  icon?: string;
  message: string;
}

export function EmptyState({ icon = '⚽', message }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">{icon}</span>
      <p>{message}</p>
    </div>
  );
}
