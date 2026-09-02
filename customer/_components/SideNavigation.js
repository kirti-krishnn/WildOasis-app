import {
  CalendarDaysIcon,
  HomeIcon,
  UserIcon,
} from '@heroicons/react/24/solid';
import SignOutButton from './SignOutButton';
import styles from './SideNavigation.module.css';

const navLinks = [
  {
    name: 'Home',
    href: '/account',
    icon: HomeIcon,
  },
  {
    name: 'Reservations',
    href: '/account/reservations',
    icon: CalendarDaysIcon,
  },
  {
    name: 'Guest profile',
    href: '/account/profile',
    icon: UserIcon,
  },
];

function SideNavigation() {
  return (
    <nav className={styles.nav}>
      <ul className={styles.list}>
        {navLinks.map(({ name, href, icon: Icon }) => (
          <li key={name}>
            <a
              className={styles.link}
              href={href}
            >
              <Icon className={styles.icon} />
              <span>{name}</span>
            </a>
          </li>
        ))}

        <li className={styles.signOutItem}>
          <SignOutButton />
        </li>
      </ul>
    </nav>
  );
}

export default SideNavigation;
