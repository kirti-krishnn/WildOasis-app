import { LoginForm } from '../auth/LoginForm'
import styles from './LoginPage.module.css'

export function LoginPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="login-title">
        <img className={styles.logo} src="/img/logo-dark.png" alt="The Wild Oasis" />
        <h1 id="login-title" className={styles.title}>Log in to your account</h1>
        <LoginForm />
      </section>
    </main>
  )
}

