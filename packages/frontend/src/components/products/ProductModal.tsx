import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import {
  Button,
  VStack,
  Input,
  Textarea,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Box,
  Image,
  HStack,
  Text,
  IconButton,
} from '@chakra-ui/react'
import { Field } from '@/components/ui/field'
import { Alert } from '@/components/ui/alert'
import { Select } from '@/components/ui/select'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Product, Category, CreateProductDto, UpdateProductDto } from '@product-catalog/shared'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

interface ProductModalProps {
  product?: Product | null
  categories: Category[]
  onClose: () => void
}

interface ProductFormData {
  name: string
  description: string
  price: number
  stock: number
  categoryId?: string
  imageUrl?: string
}

export const ProductModal = ({ product, categories, onClose }: ProductModalProps) => {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [uploadedImageUrl, setUploadedImageUrl] = useState(product?.imageUrl || '')
  const [imageRemoved, setImageRemoved] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [manualImageUrl, setManualImageUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!product

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      categoryId: product?.categoryId || '',
      imageUrl: product?.imageUrl || '',
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateProductDto) => apiClient.createProduct(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      onClose()
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProductDto) =>
      apiClient.updateProduct(product!.id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      onClose()
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const onSubmit = (data: ProductFormData) => {
    setError('')
    const submitData = {
      ...data,
      categoryId: data.categoryId || undefined,
      imageUrl: imageRemoved ? null : uploadedImageUrl || null,
    }
    if (isEditing) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const response = await apiClient.getUploadUrl(file.name, file.type, token!)
      
      if (!response.data) {
        throw new Error('Failed to get upload URL')
      }
      
      await apiClient.uploadToS3(response.data.uploadUrl, file)
      
      setUploadedImageUrl(response.data.fileUrl)
      setValue('imageUrl', response.data.fileUrl)
      setImageRemoved(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setUploadedImageUrl('')
    setValue('imageUrl', '')
    setImageRemoved(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <DialogRoot open onOpenChange={() => onClose()} placement="center" modal>
      <DialogContent
        maxW={{ base: "95vw", md: "lg" }}
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
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit(onSubmit)} id="product-form">
            <VStack gap={4}>
              {error && (
                <Alert status="error" variant="subtle">
                  {error}
                </Alert>
              )}

              <Field
                label="Name"
                invalid={!!errors.name}
                errorText={errors.name?.message}
              >
                <Input
                  {...register('name', {
                    required: 'Product name is required',
                  })}
                />
              </Field>

              <Field
                label="Description"
                invalid={!!errors.description}
                errorText={errors.description?.message}
              >
                <Textarea
                  {...register('description', {
                    required: 'Description is required',
                  })}
                  rows={3}
                />
              </Field>

              <Field
                label="Price ($)"
                invalid={!!errors.price}
                errorText={errors.price?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' },
                    valueAsNumber: true,
                  })}
                />
              </Field>

              <Field
                label="Stock"
                invalid={!!errors.stock}
                errorText={errors.stock?.message}
              >
                <Input
                  type="number"
                  {...register('stock', {
                    required: 'Stock is required',
                    min: { value: 0, message: 'Stock must be positive' },
                    valueAsNumber: true,
                  })}
                />
              </Field>

              <Field
                label="Category"
                invalid={!!errors.categoryId}
                errorText={errors.categoryId?.message}
              >
                <Select
                  colorScheme="purple"
                  value={watch('categoryId') || ''}
                  {...register('categoryId')}
                >
                  {[
                    <option key="uncategorized" value="">Uncategorized</option>,
                    ...categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ]}
                </Select>
              </Field>

              <Field label="Product Image">
                <VStack align="stretch" gap={3}>
                  {uploadedImageUrl && (
                    <Box position="relative" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
                      <Image
                        src={uploadedImageUrl}
                        alt="Product preview"
                        maxH="200px"
                        w="full"
                        objectFit="cover"
                      />
                      <IconButton
                        position="absolute"
                        top={2}
                        right={2}
                        size="sm"
                        variant="solid"
                        colorScheme="red"
                        aria-label="Remove image"
                        onClick={handleRemoveImage}
                      >
                        ✕
                      </IconButton>
                    </Box>
                  )}
                  
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    display="none"
                  />
                  
                  <HStack>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      loading={isUploading}
                      flex={1}
                    >
                      {uploadedImageUrl ? 'Change Image' : 'Upload Image'}
                    </Button>
                    {!uploadedImageUrl && (
                      <Text fontSize="xs" color="fg.muted">
                        or enter URL below
                      </Text>
                    )}
                  </HStack>

                  {!uploadedImageUrl && (
                    <HStack gap={2}>
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={manualImageUrl}
                        onChange={(e) => setManualImageUrl(e.target.value)}
                      />
                      <Button
                        size="sm"
                        bg="black"
                        color="white"
                        _hover={{ bg: "gray.800" }}
                        onClick={() => {
                          if (manualImageUrl.trim()) {
                            setUploadedImageUrl(manualImageUrl.trim())
                            setImageRemoved(false)
                            setManualImageUrl('')
                          }
                        }}
                        disabled={!manualImageUrl.trim()}
                      >
                        Apply
                      </Button>
                    </HStack>
                  )}
                </VStack>
              </Field>
            </VStack>
          </form>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="product-form"
            loading={isLoading}
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>

        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
