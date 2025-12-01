import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isHydrated, setIsHydrated] = useState(false)
  
  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true)
    })
    
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true)
    }
    
    return unsubscribe
  }, [])
  
  if (!isHydrated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    )
  }
  
  return <>{children}</>
}
