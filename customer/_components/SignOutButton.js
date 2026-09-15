import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import { signOutUser } from "@/_lib/actions";
import styles from './SideNavigation.module.css';

function SignOutButton() {
  return (
    <form action={signOutUser}>
      <button className={styles.signOutButton} type="submit">
        <ArrowRightOnRectangleIcon className={styles.icon} />
        <span>Sign out</span>
      </button>
    </form>
  );
}

export default SignOutButton;
