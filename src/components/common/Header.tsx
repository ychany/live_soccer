import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export function Header({ title, showBack = true, rightElement }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="header">
      {showBack && (
        <button className="header-back" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <h1 className="header-title">{title}</h1>
      {rightElement ? rightElement : showBack && <div style={{ width: 36 }} />}
    </header>
  );
}
