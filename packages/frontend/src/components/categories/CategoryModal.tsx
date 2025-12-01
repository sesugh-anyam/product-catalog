import { useState } from 'react'
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
} from '@chakra-ui/react'
import { Field } from '@/components/ui/field'
import { Alert } from '@/components/ui/alert'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@product-catalog/shared'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

interface CategoryModalProps {
  category?: Category | null
  onClose: () => void
}

interface CategoryFormData {
  name: string
  description?: string
}

export const CategoryModal = ({ category, onClose }: CategoryModalProps) => {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const isEditing = !!category

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryDto) => apiClient.createCategory(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      onClose()
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCategoryDto) =>
      apiClient.updateCategory(category!.id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      onClose()
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const onSubmit = (data: CategoryFormData) => {
    setError('')
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

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
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit(onSubmit)} id="category-form">
            <VStack gap={4}>
              {error && (
                <Alert status="error">
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
                    required: 'Category name is required',
                  })}
                />
              </Field>

              <Field label="Description (Optional)">
                <Textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Describe this category..."
                />
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
            form="category-form"
            disabled={isLoading}
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>

        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
