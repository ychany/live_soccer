import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

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
          <ChevronLeft size={24} />
        </button>
      )}
      <h1 className="header-title">{title}</h1>
      {rightElement ? rightElement : showBack && <div style={{ width: 36 }} />}
    </header>
  );
}
