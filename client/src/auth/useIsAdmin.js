import { useAuth } from './useAuth'

export function useIsAdmin() {
  const { user } = useAuth()

  return user?.role === 'admin'
}
