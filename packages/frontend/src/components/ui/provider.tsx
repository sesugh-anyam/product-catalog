import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ColorModeProvider } from '@/components/ui/color-mode'

interface ProviderProps {
  children: React.ReactNode
}

export const Provider = ({ children }: ProviderProps) => {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider>
        {children}
      </ColorModeProvider>
    </ChakraProvider>
  )
}
