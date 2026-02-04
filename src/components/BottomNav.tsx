import { NavLink } from 'react-router-dom';
import { Home, Calendar, Trophy, BarChart3 } from 'lucide-react';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { path: '/', label: '홈', icon: Home },
  { path: '/schedule', label: '일정', icon: Calendar },
  { path: '/leagues', label: '리그', icon: Trophy },
  { path: '/standings', label: '순위', icon: BarChart3 },
];

export function BottomNav() {
  return (
    <nav className={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            end={item.path === '/'}
          >
            <span className={styles.iconWrapper}>
              <Icon className={styles.icon} strokeWidth={2.5} />
            </span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

