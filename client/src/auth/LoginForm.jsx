import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormInput, PasswordInput } from '../ui/FormInput'
import { useAuth } from './useAuth'
import styles from '../pages/LoginPage.module.css'

const getLoginMessage = (err) => {
  if (err.status === 400 || err.status === 401) {
    return 'The email or password you entered is incorrect.'
  }

  if (err.status === 429) {
    return err.message || 'Too many requests. Please wait a little before trying again.'
  }

  if (err.status === 503) {
    return 'The application service is not available at this time. Kindly try again.'
  }

  return 'We could not log you in right now. Please try again later.'
}

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getLoginMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <p className={styles.error}>{error}</p>}

      <FormInput
        id="email"
        label="Email address"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="demo@example.com"
        extraClass={styles.field}
      />

      <PasswordInput
        id="password"
        label="Password"
        value={password}
        onChange={setPassword}
        extraClass={styles.field}
      />

      <button className={styles.button} disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  )
}
