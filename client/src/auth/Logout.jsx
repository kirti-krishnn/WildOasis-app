import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import styles from '../pages/LogoutPage.module.css'

export function Logout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const logoutUser = async () => {
      await logout()
      if (isMounted) navigate('/login', { replace: true })
    }

    logoutUser()

    return () => {
      isMounted = false
    }
  }, [logout, navigate])

  return (
    <div className={styles.card}>
      <p className={styles.title}>Logging out</p>
      <p className={styles.text}>Ending your session...</p>
    </div>
  )
}
