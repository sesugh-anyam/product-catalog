import { Box, Heading, VStack, Grid, Card, Text, Button, HStack } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import { LowStockAlert } from '@/components/inventory/LowStockAlert'
import { Product } from '@product-catalog/shared'

export const DashboardPage = () => {
  const { token } = useAuthStore()
  const navigate = useNavigate()

  const { data: lowStockData } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => apiClient.getLowStockItems(token!),
    enabled: !!token,
  })

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.getProducts({}, token!),
    enabled: !!token,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(token!),
    enabled: !!token,
  })

  const lowStockItems = lowStockData?.data || []
  const totalProducts = productsData?.data?.total || 0
  const totalCategories = categoriesData?.data?.length || 0

  const stats = [
    { label: 'Total Products', value: totalProducts, color: 'blue' },
    { label: 'Total Categories', value: totalCategories, color: 'green' },
    { label: 'Low Stock Items', value: lowStockItems.length, color: 'red' },
  ]

  return (
    <Box maxW="7xl" mx="auto" p={{ base: 4, md: 6 }}>
      <VStack gap={{ base: 6, md: 8 }} align="stretch">
        {/* Welcome Header */}
        <Card.Root 
          border="1px solid"
          borderColor="gray.200"
          bg="gradient-to-r" 
          bgGradient="linear(to-r, teal.500, blue.600)"
          _dark={{
            borderColor: "gray.700"
          }}
        >
          <Card.Body p={{ base: 6, md: 8 }}>
            <VStack align="start" gap={3}>
              <Heading 
                size="2xl" 
                fontWeight="bold"
                color="gray.800"
                _dark={{ color: "white" }}
              >
                Welcome to Your Dashboard
              </Heading>
              <Text 
                color="gray.700"
                _dark={{ color: "white" }}
                opacity={0.9}
                fontSize={{ base: "sm", md: "lg" }}
              >
                Get insights and manage your product catalog efficiently
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Stats Grid */}
        <Grid 
          templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} 
          gap={{ base: 4, md: 6 }}
        >
          {stats.map((stat, index) => (
            <Card.Root 
              key={stat.label} 
              border="1px solid"
              borderColor="gray.200"
              borderRadius="xl"
              overflow="hidden"
              bg="white"
              _hover={{ transform: "translateY(-2px)", shadow: "sm" }}
              _dark={{
                bg: "gray.800",
                borderColor: "gray.700"
              }}
              transition="all 0.2s"
            >
              <Card.Body p={{ base: 6, md: 8 }} position="relative">
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  w="full"
                  h="1"
                  bg={`${stat.color}.500`}
                />
                <VStack gap={3} align="start">
                  <HStack justify="space-between" w="full">
                    <Box
                      w={12}
                      h={12}
                      bg={`${stat.color}.100`}
                      color={`${stat.color}.600`}
                      borderRadius="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="xl"
                    >
                      {index === 0 ? '📦' : index === 1 ? '📁' : '⚠️'}
                    </Box>
                    <Text 
                      fontSize={{ base: "2xl", md: "3xl" }} 
                      fontWeight="bold" 
                      color={`${stat.color}.500`}
                    >
                      {stat.value}
                    </Text>
                  </HStack>
                  <Text 
                    color="fg.default"
                    fontSize={{ base: "sm", md: "md" }}
                    fontWeight="medium"
                  >
                    {stat.label}
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>

        {/* Main Content Grid */}
        <Grid 
          templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} 
          gap={{ base: 6, md: 8 }}
        >
          {/* Low Stock Alerts */}
          <Card.Root 
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.200"
            bg="white"
            _dark={{
              bg: "gray.800",
              borderColor: "gray.700"
            }}
          >
            <Card.Header p={{ base: 6, md: 8 }} borderBottomWidth="1px">
              <HStack justify="space-between" flexWrap="wrap" gap={2}>
                <VStack align="start" gap={1}>
                  <Heading size={{ base: "sm", md: "md" }} color="orange.600">
                    📊 Low Stock Alerts
                  </Heading>
                  <Text fontSize="sm" color="fg.muted">
                    Products that need attention
                  </Text>
                </VStack>
                <Button asChild size="sm" variant="outline" colorScheme="orange">
                  <Link to="/inventory">View All</Link>
                </Button>
              </HStack>
            </Card.Header>
            <Card.Body p={{ base: 6, md: 8 }}>
              <LowStockAlert
                items={lowStockItems}
                onViewAll={() => navigate('/inventory')}
                onUpdateStock={(_product: Product) => navigate('/inventory')}
                maxItems={1}
                showActions={false}
              />
            </Card.Body>
          </Card.Root>

          {/* Quick Actions */}
          <Card.Root 
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.200"
            bg="white"
            _dark={{
              bg: "gray.800",
              borderColor: "gray.700"
            }}
          >
            <Card.Header p={{ base: 6, md: 8 }} borderBottomWidth="1px">
              <VStack align="start" gap={1}>
                <Heading size={{ base: "sm", md: "md" }} color="blue.600">
                  ⚡ Quick Actions
                </Heading>
                <Text fontSize="sm" color="fg.muted">
                  Common management tasks
                </Text>
              </VStack>
            </Card.Header>
            <Card.Body p={{ base: 6, md: 8 }}>
              <VStack gap={4} align="stretch">
                <Button 
                  asChild 
                  variant="ghost" 
                  width="full" 
                  size="lg"
                  p={4}
                  _hover={{ bg: "blue.50" }}
                >
                  <Link to="/products">
                    <HStack gap={3} width="full">
                      <Text fontSize="xl">🛍️</Text>
                      <Text>Manage Products</Text>
                    </HStack>
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="ghost" 
                  width="full" 
                  size="lg"
                  p={4}
                  _hover={{ bg: "green.50" }}
                >
                  <Link to="/categories">
                    <HStack gap={3} width="full">
                      <Text fontSize="xl">📁</Text>
                      <Text>Manage Categories</Text>
                    </HStack>
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="ghost" 
                  width="full" 
                  size="lg"
                  p={4}
                  _hover={{ bg: "orange.50" }}
                >
                  <Link to="/inventory">
                    <HStack gap={3} width="full">
                      <Text fontSize="xl">📦</Text>
                      <Text>Update Inventory</Text>
                    </HStack>
                  </Link>
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Grid>
      </VStack>
    </Box>
  )
}
