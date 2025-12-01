import { Alert as ChakraAlert } from '@chakra-ui/react'
import { forwardRef } from 'react'

interface AlertProps {
  status: 'error' | 'warning' | 'success' | 'info'
  variant?: 'subtle' | 'solid' | 'outline'
  children: React.ReactNode
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ status, variant = 'subtle', children }, ref) => {
    return (
      <ChakraAlert.Root ref={ref} status={status} variant={variant}>
        <ChakraAlert.Indicator />
        <ChakraAlert.Description>{children}</ChakraAlert.Description>
      </ChakraAlert.Root>
    )
  }
)

Alert.displayName = 'Alert'
