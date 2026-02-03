import { NavLink } from 'react-router-dom';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { path: '/', label: '홈', icon: '🏠' },
  { path: '/schedule', label: '일정', icon: '📅' },
  { path: '/leagues', label: '리그', icon: '🏆' },
  { path: '/standings', label: '순위', icon: '📊' },
];

export function BottomNav() {
  return (
    <nav className={styles.bottomNav}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
          end={item.path === '/'}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
