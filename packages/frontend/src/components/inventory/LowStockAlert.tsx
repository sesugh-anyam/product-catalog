import { Box, Text, Badge, HStack, VStack, Button, Stack, Separator } from '@chakra-ui/react'
import { Product, LowStockItem } from '@product-catalog/shared'
import { MdWarning, MdTrendingDown, MdCheckCircle } from 'react-icons/md'

interface LowStockAlertProps {
  items: LowStockItem[]
  onViewAll?: () => void
  onUpdateStock?: (product: Product) => void
  showActions?: boolean
  maxItems?: number
}

export const LowStockAlert = ({ 
  items, 
  onViewAll, 
  onUpdateStock, 
  showActions = true,
  maxItems = 5 
}: LowStockAlertProps) => {
  if (items.length === 0) {
    return (
      <Box 
        p={8} 
        textAlign="center"
        bg="green.50"
        borderRadius="lg"
        border="1px solid"
        borderColor="green.200"
        _dark={{ 
          bg: "green.900/10", 
          borderColor: "green.800" 
        }}
      >
        <Box 
          display="flex" 
          justifyContent="center" 
          mb={3}
          color="green.500"
        >
          <MdCheckCircle size={48} />
        </Box>
        <Text color="green.700" fontWeight="semibold" fontSize="md" mb={1} _dark={{ color: "green.400" }}>
          All Products Well Stocked
        </Text>
        <Text color="fg.muted" fontSize="sm">
          No items require immediate attention
        </Text>
      </Box>
    )
  }

  const displayItems = items.slice(0, maxItems)
  const hasMore = items.length > maxItems
  
  // Calculate severity level
  const criticalItems = items.filter(item => item.product.stock <= item.threshold / 2).length
  const urgentLevel = criticalItems > 0 ? 'critical' : items.length > 5 ? 'high' : 'medium'

  return (
    <VStack gap={3} align="stretch">
      {/* Enhanced Summary Alert - Only show if not on inventory page */}
      {!showActions && (
        <Box
          p={3}
          borderRadius="md"
          borderLeft="3px solid"
          borderLeftColor={urgentLevel === 'critical' ? 'red.500' : 'orange.500'}
          bg={urgentLevel === 'critical' ? 'red.50' : 'orange.50'}
          _dark={{
            bg: urgentLevel === 'critical' ? 'red.900/10' : 'orange.900/10'
          }}
        >
          <HStack gap={2} w="full">
            <Box 
              p={1.5} 
              bg={urgentLevel === 'critical' ? 'red.100' : 'orange.100'}
              borderRadius="sm"
              color={urgentLevel === 'critical' ? 'red.600' : 'orange.600'}
              _dark={{
                bg: urgentLevel === 'critical' ? 'red.900/30' : 'orange.900/30',
                color: urgentLevel === 'critical' ? 'red.400' : 'orange.400'
              }}
            >
              <MdWarning size={16} />
            </Box>
            <VStack align="start" gap={0} flex={1}>
              <Text fontWeight="semibold" fontSize="xs">
                {items.length} Product{items.length !== 1 ? 's' : ''} Running Low on Stock
              </Text>
              {criticalItems > 0 && (
                <Text fontSize="2xs" color={urgentLevel === 'critical' ? 'red.600' : 'orange.600'} _dark={{ color: urgentLevel === 'critical' ? 'red.400' : 'orange.400' }}>
                  {criticalItems} critically low (below threshold)
                </Text>
              )}
            </VStack>
          </HStack>
        </Box>
      )}

      {/* Enhanced Item List */}
      <VStack gap={2} align="stretch">
        {displayItems.map((item) => {
          const isCritical = item.product.stock <= item.threshold / 2
          const stockPercentage = (item.product.stock / item.threshold) * 100
          
          return (
            <Box
              key={item.product.id}
              p={3}
              borderWidth="1px"
              borderColor={isCritical ? "red.200" : "orange.200"}
              borderRadius="md"
              bg={isCritical ? "red.50" : "orange.50"}
              _dark={{ 
                bg: isCritical ? 'red.900/10' : 'orange.900/10', 
                borderColor: isCritical ? 'red.800' : 'orange.800' 
              }}
              transition="all 0.2s"
              _hover={{
                shadow: "sm",
                borderColor: isCritical ? "red.300" : "orange.300"
              }}
            >
              <Stack direction={{ base: "column", md: "row" }} justify="space-between" align="start" gap={2}>
                <VStack gap={1.5} align="start" flex={1}>
                  {/* Product Name and Category */}
                  <HStack gap={2} flexWrap="wrap">
                    <HStack gap={1.5}>
                      <Box 
                        color={isCritical ? "red.500" : "orange.500"}
                        _dark={{ color: isCritical ? "red.400" : "orange.400" }}
                      >
                        <MdTrendingDown size={14} />
                      </Box>
                      <Text fontWeight="semibold" fontSize="xs">
                        {item.product.name}
                      </Text>
                    </HStack>
                    {item.product.categoryName && (
                      <Badge 
                        size="xs" 
                        variant="subtle"
                        colorPalette="gray"
                      >
                        {item.product.categoryName}
                      </Badge>
                    )}
                    {isCritical && (
                      <Badge 
                        size="xs" 
                        variant="solid"
                        colorPalette="red"
                      >
                        Critical
                      </Badge>
                    )}
                  </HStack>
                  
                  {/* Stock Information */}
                  <HStack gap={3} fontSize="2xs" flexWrap="wrap">
                    <HStack gap={1}>
                      <Text color="fg.muted">Current:</Text>
                      <Text 
                        fontWeight="bold" 
                        color={isCritical ? "red.600" : "orange.600"}
                        _dark={{ color: isCritical ? "red.400" : "orange.400" }}
                      >
                        {item.product.stock}
                      </Text>
                    </HStack>
                    <Separator orientation="vertical" h={2.5} />
                    <HStack gap={1}>
                      <Text color="fg.muted">Threshold:</Text>
                      <Text fontWeight="medium">
                        {item.threshold}
                      </Text>
                    </HStack>
                    <Separator orientation="vertical" h={2.5} />
                    <HStack gap={1}>
                      <Text color="fg.muted">Level:</Text>
                      <Text 
                        fontWeight="medium"
                        color={isCritical ? "red.600" : "orange.600"}
                        _dark={{ color: isCritical ? "red.400" : "orange.400" }}
                      >
                        {stockPercentage.toFixed(0)}%
                      </Text>
                    </HStack>
                  </HStack>
                  
                  {/* Visual Stock Bar */}
                  <Box w="full" h="1.5" bg="gray.200" borderRadius="full" overflow="hidden" _dark={{ bg: "gray.700" }}>
                    <Box 
                      h="full" 
                      bg={isCritical ? "red.500" : "orange.500"}
                      w={`${Math.min(stockPercentage, 100)}%`}
                      transition="width 0.3s"
                      borderRadius="full"
                    />
                  </Box>
                </VStack>
                
                {/* Action Button */}
                {showActions && onUpdateStock && (
                  <Button
                    size="sm"
                    variant="solid"
                    colorPalette={isCritical ? "red" : "orange"}
                    onClick={() => onUpdateStock(item.product)}
                    flexShrink={0}
                  >
                    Restock Now
                  </Button>
                )}
              </Stack>
            </Box>
          )
        })}
      </VStack>

      {/* View All Section */}
      {(hasMore || onViewAll) && (
        <Box 
          textAlign="center" 
          p={3}
          borderRadius="md"
          bg="gray.50"
          _dark={{ bg: "gray.800" }}
        >
          {hasMore && (
            <Text fontSize="sm" color="fg.muted" mb={2}>
              + {items.length - maxItems} more item{items.length - maxItems !== 1 ? 's' : ''} need restocking
            </Text>
          )}
          {onViewAll && (
            <Button 
              size="sm" 
              variant="outline" 
              colorPalette="orange"
              onClick={onViewAll}
            >
              View All Low Stock Items
            </Button>
          )}
        </Box>
      )}
    </VStack>
  )
}
