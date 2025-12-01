import { Button } from '@chakra-ui/react'
import { useColorMode } from '@/components/ui/color-mode'

export const ColorModeButton = () => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Button
      onClick={toggleColorMode}
      variant="ghost"
      size="sm"
      aria-label="Toggle color mode"
    >
      {colorMode === 'light' ? '🌙' : '☀️'}
    </Button>
  )
}
