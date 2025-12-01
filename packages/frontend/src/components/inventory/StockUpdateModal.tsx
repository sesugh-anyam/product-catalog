import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Button,
  VStack,
  HStack,
  Input,
  Textarea,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Text,
  Badge,
} from '@chakra-ui/react'
import { Field } from '@/components/ui/field'
import { Alert } from '@/components/ui/alert'
import { Select } from '@/components/ui/select'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Product, StockUpdate } from '@product-catalog/shared'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

interface StockUpdateModalProps {
  product: Product
  onClose: () => void
}

interface StockUpdateFormData {
  type: 'add' | 'subtract' | 'set'
  quantity: number
  reason?: string
}

export const StockUpdateModal = ({ product, onClose }: StockUpdateModalProps) => {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<StockUpdateFormData>({
    defaultValues: {
      type: 'set',
      quantity: product.stock,
      reason: '',
    },
  })

  const updateType = watch('type')
  const quantity = watch('quantity')

  const updateMutation = useMutation({
    mutationFn: (data: StockUpdate) => apiClient.updateStock(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['low-stock'] })
      queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] })
      onClose()
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const onSubmit = (data: StockUpdateFormData) => {
    setError('')
    const updateData: StockUpdate = {
      productId: product.id,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason,
    }
    updateMutation.mutate(updateData)
  }

  const calculateNewStock = () => {
    switch (updateType) {
      case 'add':
        return product.stock + quantity
      case 'subtract':
        return Math.max(0, product.stock - quantity)
      case 'set':
        return quantity
      default:
        return product.stock
    }
  }

  const newStock = calculateNewStock()

  return (
    <DialogRoot open onOpenChange={() => onClose()} placement="center" modal>
      <DialogContent
        maxW={{ base: "95vw", md: "md" }}
        maxH={{ base: "90vh", md: "auto" }}
        mx="auto"
        my="auto"
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        overflow="auto"
      >
        <DialogHeader>
          <DialogTitle>Update Stock - {product.name}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <VStack gap={4} align="stretch">
            <HStack 
              justify="space-between" 
              p={3} 
              bg="gray.50" 
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
              _dark={{
                bg: "gray.800",
                borderColor: "gray.700"
              }}
            >
              <Text>Current Stock:</Text>
              <Badge colorScheme={product.stock < 10 ? 'red' : 'green'}>
                {product.stock} units
              </Badge>
            </HStack>

            <form onSubmit={handleSubmit(onSubmit)} id="stock-form">
              <VStack gap={4}>
                {error && (
                  <Alert status="error">
                    {error}
                  </Alert>
                )}

                <Field
                  label="Update Type"
                  invalid={!!errors.type}
                  errorText={errors.type?.message}
                >
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: 'Update type is required' }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onChange={(e) => field.onChange(e)}
                        colorScheme="teal"
                      >
                        <option value="set">Set to specific amount</option>
                        <option value="add">Add to current stock</option>
                        <option value="subtract">Subtract from current stock</option>
                      </Select>
                    )}
                  />
                </Field>

                <Field
                  label={updateType === 'set' ? 'New Stock Amount' : 'Quantity'}
                  invalid={!!errors.quantity}
                  errorText={errors.quantity?.message}
                >
                  <Input
                    type="number"
                    {...register('quantity', {
                      required: 'Quantity is required',
                      min: { value: 0, message: 'Quantity must be positive' },
                      valueAsNumber: true,
                    })}
                  />
                </Field>

                <Field label="Reason (Optional)">
                  <Textarea
                    {...register('reason')}
                    placeholder="Enter reason for stock update..."
                    rows={2}
                  />
                </Field>

                {updateType && quantity !== undefined && (
                  <HStack 
                    justify="space-between" 
                    p={3} 
                    bg="teal.50" 
                    borderRadius="md"
                    border="1px solid"
                    borderColor="teal.200"
                    _dark={{
                      bg: "teal.900/20",
                      borderColor: "teal.800"
                    }}
                  >
                    <Text fontWeight="medium">New Stock Will Be:</Text>
                    <Badge
                      colorScheme={newStock < 10 ? 'red' : 'green'}
                      fontSize="md"
                      px={3}
                      py={1}
                    >
                      {newStock} units
                    </Badge>
                  </HStack>
                )}
              </VStack>
            </form>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="stock-form"
            disabled={updateMutation.isPending}
          >
            Update Stock
          </Button>
        </DialogFooter>

        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
