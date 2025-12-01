import { useState } from 'react'
import { 
  Box, 
  Container, 
  Flex, 
  Text, 
  Button, 
  HStack, 
  VStack,
  IconButton,
  Badge
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { HiMenu, HiX } from 'react-icons/hi'
import { MdWarning } from 'react-icons/md'
import { useAuthStore } from '@/stores/authStore'
import { ColorModeButton } from '@/components/ui/color-mode'
import { useLowStockAlerts } from '@/hooks/useLowStockAlerts'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { lowStockCount, hasLowStock } = useLowStockAlerts()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const navigationItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Categories', path: '/categories' },
    { 
      label: 'Inventory', 
      path: '/inventory',
      badge: hasLowStock ? lowStockCount : undefined,
      icon: hasLowStock ? MdWarning : undefined
    }
  ]

  return (
    <Box minH="100vh">
      <Box as="header" bg="bg.emphasized" borderBottomWidth="1px" py={4}>
        <Container maxW="7xl">
          <Flex justify="space-between" align="center">
            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
              Product Catalog
            </Text>
            
            {/* Desktop Navigation */}
            <HStack gap={4} display={{ base: "none", md: "flex" }}>
              {navigationItems.map((item) => (
                <Button key={item.path} asChild variant="ghost" size="sm" position="relative">
                  <Link to={item.path}>
                    <HStack gap={2}>
                      {item.icon && <item.icon color="orange.500" />}
                      <Text>{item.label}</Text>
                      {item.badge && (
                        <Badge size="sm" colorScheme="red" borderRadius="full">
                          {item.badge}
                        </Badge>
                      )}
                    </HStack>
                  </Link>
                </Button>
              ))}
              
              <Box borderLeftWidth="1px" pl={4} ml={4}>
                <Text 
                  fontSize="sm" 
                  color="fg.muted"
                  css={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '150px'
                  }}
                >
                  {user?.email}
                </Text>
              </Box>
              
              <ColorModeButton />
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </HStack>

            {/* Mobile Menu Button */}
            <HStack gap={2} display={{ base: "flex", md: "none" }}>
              <ColorModeButton />
              <IconButton
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <HiX /> : <HiMenu />}
              </IconButton>
            </HStack>
          </Flex>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <Box
              display={{ base: "block", md: "none" }}
              mt={4}
              pt={4}
              borderTopWidth="1px"
            >
              <VStack gap={2} align="stretch">
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    asChild
                    variant="ghost"
                    size="md"
                    justifyContent="flex-start"
                    onClick={closeMobileMenu}
                  >
                    <Link to={item.path}>
                      <HStack gap={2} width="100%">
                        {item.icon && <item.icon color="orange.500" />}
                        <Text flex={1} textAlign="left">{item.label}</Text>
                        {item.badge && (
                          <Badge size="sm" colorScheme="red" borderRadius="full">
                            {item.badge}
                          </Badge>
                        )}
                      </HStack>
                    </Link>
                  </Button>
                ))}
                
                <Box py={2} borderTopWidth="1px" mt={2}>
                  <Text fontSize="sm" color="fg.muted" mb={2} ml={4}>
                    {user?.email}
                  </Text>
                  <Button 
                    onClick={() => {
                      handleLogout()
                      closeMobileMenu()
                    }} 
                    variant="outline" 
                    size="sm"
                    width="full"
                  >
                    Logout
                  </Button>
                </Box>
              </VStack>
            </Box>
          )}
        </Container>
      </Box>

      <Box as="main" py={{ base: 4, md: 8 }}>
        <Container maxW="7xl" px={{ base: 4, md: 6 }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}
