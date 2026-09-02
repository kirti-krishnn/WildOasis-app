import { Logout } from '../auth/Logout'
import styles from './LogoutPage.module.css'

export function LogoutPage() {
  return (
    <main className={styles.page}>
      <Logout />
    </main>
  )
}
