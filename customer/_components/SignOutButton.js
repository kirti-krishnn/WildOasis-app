import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import styles from './SideNavigation.module.css';

function SignOutButton() {
  return (
    <button className={styles.signOutButton}>
      <ArrowRightOnRectangleIcon className={styles.icon} />
      <span>Sign out</span>
    </button>
  );
}

export default SignOutButton;
