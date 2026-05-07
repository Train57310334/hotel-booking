import { createContext, useContext } from 'react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useAdmin } from '@/contexts/AdminContext'
import { useRoleAccess } from '@/hooks/useRoleAccess'

const OnboardingContext = createContext(null)

export function OnboardingProvider({ children }) {
  const { currentHotel } = useAdmin() || {}
  const { role, isAdmin } = useRoleAccess()
  const onboarding = useOnboarding(currentHotel?.id, role, isAdmin)

  return (
    <OnboardingContext.Provider value={onboarding}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboardingContext() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboardingContext must be used inside OnboardingProvider')
  return ctx
}
