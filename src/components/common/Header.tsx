interface HeaderProps {
  title: string;
  rightElement?: React.ReactNode;
}

export function Header({ title, rightElement }: HeaderProps) {
  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
      {rightElement && <div className="header-right">{rightElement}</div>}
    </header>
  );
}
