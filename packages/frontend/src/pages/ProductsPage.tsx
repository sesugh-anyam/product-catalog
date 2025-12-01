import { useState } from 'react'
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Table,
  Input,
  Card,
  Text,
  Badge,
  Image,
} from '@chakra-ui/react'
import { Alert } from '@/components/ui/alert'
import { Select } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Product } from '@product-catalog/shared'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import { ProductModal } from '@/components/products/ProductModal'

export const ProductsPage = () => {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [error, setError] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', search, selectedCategory],
    queryFn: () =>
      apiClient.getProducts(
        {
          search: search || undefined,
          categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
        },
        token!
      ),
    enabled: !!token,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(token!),
    enabled: !!token,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteProduct(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setError('')
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const products = productsData?.data?.items || []
  const categories = categoriesData?.data || []

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedProduct(null)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setProductToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete)
      setProductToDelete(null)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
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
          bgGradient="linear(to-r, blue.500, purple.600)"
          overflow="hidden"
          position="relative"
          _dark={{
            borderColor: "gray.700"
          }}
        >
          <Card.Body p={{ base: 6, md: 8 }}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={2}>
                <Heading 
                  size="2xl" 
                  fontWeight="bold"
                  color="gray.800"
                  _dark={{ color: "white" }}
                >
                  Product Catalog
                </Heading>
                <Text 
                  opacity={0.9} 
                  fontSize={{ base: "sm", md: "md" }}
                  color="gray.700"
                  _dark={{ color: "white" }}
                >
                  Manage your inventory with style and efficiency
                </Text>
              </VStack>
              <Button 
                onClick={handleCreate}
                size={{ base: "sm", md: "md" }}
                variant="solid"
                bg="black"
                color="white"
                _hover={{ bg: "gray.800" }}
                _dark={{
                  bg: "white",
                  color: "black",
                  _hover: { bg: "gray.100" }
                }}
              >
                Add Product
              </Button>
            </HStack>
          </Card.Body>
        </Card.Root>

        {error && (
          <Alert status="error" variant="subtle">
            {error}
          </Alert>
        )}

        {/* Filters Card */}
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
            <HStack gap={4} flexWrap="wrap">
              <Box flex={{ base: "1", md: "1" }} minW={{ base: "full", md: "300px" }}>
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
                    borderColor: "gray.800"
                  }}
                  _hover={{
                    borderColor: "gray.300",
                    _dark: { borderColor: "gray.700" }
                  }}
                />
              </Box>
              <Box width={{ base: "full", md: "220px" }}>
                <Select
                  colorScheme="blue"
                  value={selectedCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                  disabled={categories.length === 0}
                >
                  {categories.length === 0 ? (
                    <option value="" disabled>
                      No categories available
                    </option>
                  ) : (
                    [
                      <option key="all" value="all">All Categories</option>,
                      ...categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    ]
                  )}
                </Select>
              </Box>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Products Card */}
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
                  borderTopColor="blue.500"
                  borderRightColor="blue.500"
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
                <Text fontWeight="medium" color="fg.default">Loading products...</Text>
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
                  {search || (selectedCategory && selectedCategory !== 'all')
                    ? 'Try adjusting your search or filters' 
                    : 'Create your first product to get started with your catalog'
                  }
                </Text>
              </VStack>
              {!search && (!selectedCategory || selectedCategory === 'all') && (
                <Button onClick={handleCreate} size="sm" variant="outline">
                  Add Your First Product
                </Button>
              )}
            </VStack>
          ) : (
            <>
              {/* Desktop Table View */}
              <Box display={{ base: "none", lg: "block" }}>
                <Table.Root>
                  <Table.Header>
                    <Table.Row 
                      bg="gray.50"
                      _dark={{ bg: "gray.900" }}
                    >
                      <Table.ColumnHeader fontWeight="semibold" py={4}>Product</Table.ColumnHeader>
                      <Table.ColumnHeader fontWeight="semibold">Category</Table.ColumnHeader>
                      <Table.ColumnHeader fontWeight="semibold">Price</Table.ColumnHeader>
                      <Table.ColumnHeader fontWeight="semibold">Stock</Table.ColumnHeader>
                      <Table.ColumnHeader fontWeight="semibold">Actions</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {products.map((product, index) => (
                      <Table.Row 
                        key={product.id}
                        _hover={{ 
                          bg: "gray.50",
                          _dark: { bg: "gray.800" }
                        }}
                        borderBottomWidth={index === products.length - 1 ? 0 : "1px"}
                      >
                        <Table.Cell py={4}>
                          <HStack gap={3}>
                            {product.imageUrl ? (
                              <Box
                                w={12}
                                h={12}
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
                                w={12}
                                h={12}
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
                                fontSize="sm"
                                flexShrink={0}
                              >
                                {product.name.charAt(0).toUpperCase()}
                              </Box>
                            )}
                            <VStack gap={1} align="start">
                              <Text fontWeight="semibold" fontSize="sm">
                                {product.name}
                              </Text>
                              <Text 
                                fontSize="xs" 
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
                        <Table.Cell>
                          <Badge
                            variant="subtle"
                            colorScheme={product.categoryName === 'Uncategorized' ? 'gray' : 'blue'}
                            borderRadius="full"
                            px={2}
                            py={1}
                            fontSize="xs"
                          >
                            {product.categoryName || 'Uncategorized'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Text fontWeight="medium" color="green.600">
                            {formatPrice(product.price)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <HStack gap={2}>
                            <Box
                              w={2}
                              h={2}
                              bg={product.stock < 10 ? 'red.500' : product.stock === 0 ? 'gray.400' : 'green.500'}
                              borderRadius="full"
                            />
                            <Text
                              color={product.stock < 10 ? 'red.600' : 'fg.default'}
                              fontWeight={product.stock < 10 ? 'semibold' : 'normal'}
                              fontSize="sm"
                            >
                              {product.stock} units
                            </Text>
                          </HStack>
                        </Table.Cell>
                        <Table.Cell>
                          <HStack gap={2}>
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="blue"
                              onClick={() => handleEdit(product)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              onClick={() => handleDelete(product.id)}
                              loading={deleteMutation.isPending}
                            >
                              Delete
                            </Button>
                          </HStack>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>

              {/* Mobile/Tablet Card View */}
              <VStack display={{ base: "flex", lg: "none" }} gap={3} p={4}>
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
                        <HStack gap={3} justify="space-between">
                          <HStack gap={3} flex={1}>
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
                              <Badge
                                variant="subtle"
                                colorScheme={product.categoryName === 'Uncategorized' ? 'gray' : 'blue'}
                                borderRadius="full"
                                px={2}
                                py={1}
                                fontSize="xs"
                              >
                                {product.categoryName || 'Uncategorized'}
                              </Badge>
                            </VStack>
                          </HStack>
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
                            <HStack gap={2}>
                              <Box
                                w={2}
                                h={2}
                                bg={product.stock < 10 ? 'red.500' : product.stock === 0 ? 'gray.400' : 'green.500'}
                                borderRadius="full"
                              />
                              <Text
                                color={product.stock < 10 ? 'red.600' : 'fg.default'}
                                fontWeight={product.stock < 10 ? 'bold' : 'semibold'}
                                fontSize="md"
                              >
                                {product.stock} units
                              </Text>
                            </HStack>
                          </VStack>
                        </HStack>

                        {/* Actions */}
                        <HStack gap={2} w="full">
                          <Button
                            flex={1}
                            size="sm"
                            variant="outline"
                            colorScheme="blue"
                            onClick={() => handleEdit(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            flex={1}
                            size="sm"
                            variant="outline"
                            colorScheme="red"
                            onClick={() => handleDelete(product.id)}
                            loading={deleteMutation.isPending}
                          >
                            Delete
                          </Button>
                        </HStack>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </VStack>
            </>
          )}
        </Card.Body>
      </Card.Root>

        {isModalOpen && (
          <ProductModal
            product={selectedProduct}
            categories={categories}
            onClose={handleModalClose}
          />
        )}

        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={deleteMutation.isPending}
          variant="danger"
        />
      </VStack>
    </Box>
  )
}
