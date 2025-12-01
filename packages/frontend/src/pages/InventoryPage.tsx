import { useState } from 'react'
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Table,
  Card,
  Text,
  Badge,
  Input,
  Image,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { Product } from '@product-catalog/shared'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import { StockUpdateModal } from '@/components/inventory/StockUpdateModal'
import { LowStockAlert } from '@/components/inventory/LowStockAlert'

export const InventoryPage = () => {
  const { token } = useAuthStore()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showLowStockAlert, setShowLowStockAlert] = useState(true)

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () =>
      apiClient.getProducts(
        {
          search: search || undefined,
        },
        token!
      ),
    enabled: !!token,
  })

  const { data: lowStockData } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => apiClient.getLowStockItems(token!),
    enabled: !!token,
  })

  const products = productsData?.data?.items || []
  const lowStockItems = lowStockData?.data || []

  const handleUpdateStock = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  const isLowStock = (productId: string) => {
    return lowStockItems.some((item) => item.product.id === productId)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <Box maxW="7xl" mx="auto" p={{ base: 4, md: 6 }}>
      <VStack gap={8} align="stretch">
        {/* Header Section */}
        <Card.Root 
          border="1px solid"
          borderColor="gray.200"
          bg="gradient-to-r" 
          bgGradient="linear(to-r, green.500, teal.600)"
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
                📦 Inventory Management
              </Heading>
              <Text 
                opacity={0.9}
                fontSize={{ base: "sm", md: "lg" }}
                color="gray.700"
                _dark={{ color: "white" }}
              >
                Keep track of stock levels and manage your inventory efficiently
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>



        {lowStockItems.length > 0 && showLowStockAlert && (
          <Card.Root 
            borderRadius="lg" 
            border="1px solid"
            borderColor="orange.200"
            borderLeftWidth="3px" 
            borderLeftColor="orange.500"
            bg="orange.50"
            _dark={{
              bg: "orange.900/10",
              borderColor: "orange.800"
            }}
          >
            <Card.Body p={{ base: 4, md: 5 }}>
              <VStack align="stretch" gap={3}>
                <HStack justify="space-between">
                  <HStack gap={2}>
                    <Box
                      w={6}
                      h={6}
                      bg="orange.100"
                      color="orange.600"
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="sm"
                    >
                      ⚠️
                    </Box>
                    <Text fontWeight="semibold" fontSize="sm" color="orange.700" _dark={{ color: "orange.400" }}>
                      {lowStockItems.length} Low Stock Alert{lowStockItems.length !== 1 ? 's' : ''}
                    </Text>
                  </HStack>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="orange"
                    onClick={() => setShowLowStockAlert(false)}
                  >
                    Hide
                  </Button>
                </HStack>
                <LowStockAlert
                  items={lowStockItems}
                  onUpdateStock={handleUpdateStock}
                  showActions={true}
                  maxItems={3}
                />
              </VStack>
            </Card.Body>
          </Card.Root>
        )}

        {lowStockItems.length > 0 && !showLowStockAlert && (
          <Card.Root 
            borderRadius="lg" 
            border="1px solid"
            borderColor="orange.200"
            bg="white"
            _dark={{
              bg: "gray.800",
              borderColor: "orange.800"
            }}
          >
            <Card.Body p={3}>
              <HStack justify="space-between">
                <HStack gap={2}>
                  <Text fontSize="sm" color="orange.600" _dark={{ color: "orange.400" }}>
                    ⚠️ {lowStockItems.length} Low Stock Alert{lowStockItems.length !== 1 ? 's' : ''} (Hidden)
                  </Text>
                </HStack>
                <Button
                  size="xs"
                  variant="outline"
                  colorScheme="orange"
                  onClick={() => setShowLowStockAlert(true)}
                >
                  Show
                </Button>
              </HStack>
            </Card.Body>
          </Card.Root>
        )}

        {/* Search and Filters */}
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
          <Card.Body p={{ base: 4, md: 6 }} _dark={{ bg: "black" }}>
            <Input
              placeholder="🔍 Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="lg"
              borderRadius="lg"
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              _dark={{
                bg: "black",
                borderColor: "gray.600"
              }}
              _hover={{
                borderColor: "gray.300",
                _dark: { borderColor: "gray.700" }
              }}
            />
          </Card.Body>
        </Card.Root>

        {/* Products Inventory Table */}
        <Card.Root 
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.200"
          bg="white"
          _dark={{
            bg: "gray.900",
            borderColor: "gray.700"
          }}
        >
          <Card.Body p={0}>
          {isLoading ? (
            <VStack py={16} gap={4}>
              <Box position="relative">
                <Box 
                  w={16} 
                  h={16} 
                  border="3px solid" 
                  borderColor="gray.200"
                  _dark={{ borderColor: "gray.700" }}
                  borderRadius="full"
                  position="absolute"
                />
                <Box 
                  w={16} 
                  h={16} 
                  border="3px solid" 
                  borderColor="transparent"
                  borderTopColor="green.500"
                  borderRightColor="green.500"
                  borderRadius="full"
                  css={{
                    animation: "spin 0.8s linear infinite",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" }
                    }
                  }}
                />
              </Box>
              <VStack gap={2}>
                <Text fontWeight="medium" color="fg.default">Loading inventory...</Text>
                <Text fontSize="sm" color="fg.muted">Please wait a moment</Text>
              </VStack>
            </VStack>
          ) : products.length === 0 ? (
            <VStack py={12} gap={4}>
              <Box 
                w={16} 
                h={16} 
                bg="gray.100"
                _dark={{ bg: "gray.800" }}
                borderRadius="full" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
              >
                <Text fontSize="2xl">📦</Text>
              </Box>
              <VStack gap={2}>
                <Text fontWeight="medium" color="fg.default">No products found</Text>
                <Text color="fg.muted" textAlign="center" fontSize="sm">
                  {search ? 'Try adjusting your search' : 'Add products to start tracking inventory'}
                </Text>
              </VStack>
            </VStack>
          ) : (
            <>
              {/* Desktop Table View */}
              <Box display={{ base: "none", md: "block" }}>
                <Table.Root>
                  <Table.Header>
                    <Table.Row
                      bg="gray.50"
                      _dark={{ bg: "gray.900" }}
                    >
                      <Table.ColumnHeader>Product</Table.ColumnHeader>
                      <Table.ColumnHeader>Price</Table.ColumnHeader>
                      <Table.ColumnHeader>Current Stock</Table.ColumnHeader>
                      <Table.ColumnHeader>Status</Table.ColumnHeader>
                      <Table.ColumnHeader>Actions</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {products.map((product) => (
                      <Table.Row 
                        key={product.id}
                        _hover={{ 
                          bg: "gray.50",
                          _dark: { bg: "gray.800" }
                        }}
                      >
                        <Table.Cell>
                          <HStack gap={3}>
                            {product.imageUrl ? (
                              <Box
                                w={10}
                                h={10}
                                borderRadius="md"
                                overflow="hidden"
                                border="1px solid"
                                borderColor="gray.200"
                                bg="gray.50"
                                _dark={{ 
                                  borderColor: "gray.700",
                                  bg: "gray.800"
                                }}
                                flexShrink={0}
                              >
                                <Image
                                  src={product.imageUrl}
                                  alt={product.name}
                                  w="full"
                                  h="full"
                                  objectFit="cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </Box>
                            ) : (
                              <Box
                                w={10}
                                h={10}
                                bg="black"
                                color="white"
                                _dark={{ 
                                  bg: "white",
                                  color: "black"
                                }}
                                borderRadius="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontWeight="bold"
                                fontSize="xs"
                                flexShrink={0}
                              >
                                {product.name.charAt(0).toUpperCase()}
                              </Box>
                            )}
                            <VStack gap={1} align="start">
                              <Text fontWeight="medium">{product.name}</Text>
                              <Text 
                                fontSize="sm" 
                                color="fg.muted"
                                maxW="200px"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                whiteSpace="nowrap"
                              >
                                {product.description}
                              </Text>
                            </VStack>
                          </HStack>
                        </Table.Cell>
                        <Table.Cell>{formatPrice(product.price)}</Table.Cell>
                        <Table.Cell>
                          <Text
                            color={product.stock < 10 ? 'red.500' : 'inherit'}
                            fontWeight={product.stock < 10 ? 'bold' : 'normal'}
                          >
                            {product.stock} units
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          {isLowStock(product.id) ? (
                            <Badge colorScheme="red" size="sm">
                              Low Stock
                            </Badge>
                          ) : product.stock === 0 ? (
                            <Badge colorScheme="gray" size="sm">
                              Out of Stock
                            </Badge>
                          ) : (
                            <Badge colorScheme="green" size="sm">
                              In Stock
                            </Badge>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStock(product)}
                          >
                            Update Stock
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>

              {/* Mobile/Tablet Card View */}
              <VStack display={{ base: "flex", md: "none" }} gap={3} p={4}>
                {products.map((product) => (
                  <Card.Root
                    key={product.id}
                    w="full"
                    border="1px solid"
                    borderColor="gray.200"
                    _dark={{ borderColor: "gray.700" }}
                    _hover={{ shadow: "sm" }}
                  >
                    <Card.Body p={4}>
                      <VStack align="stretch" gap={4}>
                        {/* Product Header with Image */}
                        <HStack gap={3}>
                          {product.imageUrl ? (
                            <Box
                              w={16}
                              h={16}
                              borderRadius="lg"
                              overflow="hidden"
                              border="1px solid"
                              borderColor="gray.200"
                              bg="gray.50"
                              _dark={{ 
                                borderColor: "gray.700",
                                bg: "gray.800"
                              }}
                              flexShrink={0}
                            >
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                w="full"
                                h="full"
                                objectFit="cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </Box>
                          ) : (
                            <Box
                              w={16}
                              h={16}
                              bg="black"
                              color="white"
                              _dark={{ 
                                bg: "white",
                                color: "black"
                              }}
                              borderRadius="lg"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontWeight="bold"
                              fontSize="lg"
                              flexShrink={0}
                            >
                              {product.name.charAt(0).toUpperCase()}
                            </Box>
                          )}
                          <VStack gap={1} align="start" flex={1}>
                            <Text fontWeight="bold" fontSize="md">
                              {product.name}
                            </Text>
                            {isLowStock(product.id) ? (
                              <Badge colorScheme="red" size="sm">
                                Low Stock
                              </Badge>
                            ) : product.stock === 0 ? (
                              <Badge colorScheme="gray" size="sm">
                                Out of Stock
                              </Badge>
                            ) : (
                              <Badge colorScheme="green" size="sm">
                                In Stock
                              </Badge>
                            )}
                          </VStack>
                        </HStack>

                        {/* Description */}
                        <Text 
                          fontSize="sm" 
                          color="fg.muted"
                          lineClamp={2}
                        >
                          {product.description}
                        </Text>

                        {/* Price and Stock Info */}
                        <HStack justify="space-between">
                          <VStack align="start" gap={1}>
                            <Text fontSize="xs" color="fg.muted">Price</Text>
                            <Text fontWeight="bold" color="green.600" fontSize="lg">
                              {formatPrice(product.price)}
                            </Text>
                          </VStack>
                          <VStack align="end" gap={1}>
                            <Text fontSize="xs" color="fg.muted">Stock</Text>
                            <Text
                              color={product.stock < 10 ? 'red.500' : 'fg.default'}
                              fontWeight={product.stock < 10 ? 'bold' : 'semibold'}
                              fontSize="lg"
                            >
                              {product.stock} units
                            </Text>
                          </VStack>
                        </HStack>

                        {/* Action */}
                        <Button
                          w="full"
                          size="sm"
                          variant="outline"
                          colorScheme="orange"
                          onClick={() => handleUpdateStock(product)}
                        >
                          Update Stock
                        </Button>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </VStack>
            </>
          )}
        </Card.Body>
      </Card.Root>

        {isModalOpen && selectedProduct && (
          <StockUpdateModal
            product={selectedProduct}
            onClose={handleModalClose}
          />
        )}
      </VStack>
    </Box>
  )
}
