import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Table,
  Card,
  Text,
} from "@chakra-ui/react";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Category } from "@product-catalog/shared";
import { apiClient } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { CategoryModal } from "@/components/categories/CategoryModal";

export const CategoriesPage = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.getCategories(token!),
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteCategory(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setError("");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const categories = categoriesData?.data || [];

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete);
      setCategoryToDelete(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <Box maxW="7xl" mx="auto" p={{ base: 4, md: 6 }}>
      <VStack gap={8} align="stretch">
        <Card.Root
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.200"
          background="linear-gradient(135deg, purple.500, pink.400)"
          _dark={{
            borderColor: "gray.700",
          }}
        >
          <Card.Body p={8}>
            <HStack justify="space-between" align="center">
              <Box>
                <Heading
                  size="2xl"
                  fontWeight="bold"
                  mb={2}
                  color="gray.800"
                  _dark={{ color: "white" }}
                >
                  Categories
                </Heading>
                <Text
                  fontSize="lg"
                  opacity={0.9}
                  color="gray.700"
                  _dark={{ color: "white" }}
                >
                  Organize your products into categories
                </Text>
              </Box>
              <Button
                onClick={handleCreate}
                size="lg"
                variant="solid"
                bg="black"
                color="white"
                _hover={{ bg: "gray.800" }}
                _dark={{
                  bg: "white",
                  color: "black",
                  _hover: { bg: "gray.100" },
                }}
              >
                Add Category
              </Button>
            </HStack>
          </Card.Body>
        </Card.Root>

        {error && (
          <Alert status="error" variant="subtle">
            {error}
          </Alert>
        )}

        <Card.Root
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.200"
          bg="white"
          _dark={{
            bg: "gray.900",
            borderColor: "gray.700",
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
                    borderTopColor="purple.500"
                    borderRightColor="purple.500"
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
                  <Text fontWeight="medium" color="fg.default">Loading categories...</Text>
                  <Text fontSize="sm" color="fg.muted">Please wait a moment</Text>
                </VStack>
              </VStack>
            ) : categories.length === 0 ? (
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
                  <Text fontSize="2xl">📁</Text>
                </Box>
                <VStack gap={2}>
                  <Text fontWeight="medium" color="fg.default">No categories found</Text>
                  <Text color="fg.muted" textAlign="center" fontSize="sm">
                    Create your first category to organize your products
                  </Text>
                </VStack>
                <Button onClick={handleCreate} size="sm" variant="outline">
                  Add Your First Category
                </Button>
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
                        <Table.ColumnHeader fontWeight="bold">
                          Name
                        </Table.ColumnHeader>
                        <Table.ColumnHeader fontWeight="bold">
                          Description
                        </Table.ColumnHeader>
                        <Table.ColumnHeader fontWeight="bold">
                          Created
                        </Table.ColumnHeader>
                        <Table.ColumnHeader fontWeight="bold">
                          Actions
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {categories.map((category, index) => (
                        <Table.Row
                          key={category.id}
                          _hover={{
                            bg: "gray.50",
                            _dark: { bg: "gray.800" },
                          }}
                          borderBottomWidth={
                            index === categories.length - 1 ? 0 : "1px"
                          }
                        >
                          <Table.Cell py={4}>
                            <HStack gap={3}>
                              <Box
                                w={10}
                                h={10}
                                bg="purple.100"
                                _dark={{ bg: "purple.900/30" }}
                                borderRadius="lg"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Text fontSize="lg">📁</Text>
                              </Box>
                              <Text fontWeight="semibold" fontSize="md">
                                {category.name}
                              </Text>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell py={4}>
                            <Text
                              color="fg.muted"
                              fontSize="sm"
                              maxW="300px"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              whiteSpace="nowrap"
                            >
                              {category.description || "No description"}
                            </Text>
                          </Table.Cell>
                          <Table.Cell py={4}>
                            <VStack align="start" gap={1}>
                              <Text fontSize="sm" color="fg.muted">
                                {new Date(category.createdAt).toLocaleDateString()}
                              </Text>
                              <Text fontSize="xs" color="fg.subtle">
                                {new Date(category.createdAt).toLocaleTimeString()}
                              </Text>
                            </VStack>
                          </Table.Cell>
                          <Table.Cell py={4}>
                            <HStack gap={2}>
                              <Button
                                size="sm"
                                variant="outline"
                                colorScheme="purple"
                                onClick={() => handleEdit(category)}
                                _hover={{ transform: "translateY(-1px)" }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                colorScheme="red"
                                onClick={() => handleDelete(category.id)}
                                loading={deleteMutation.isPending}
                                _hover={{ transform: "translateY(-1px)" }}
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
                <VStack display={{ base: "flex", md: "none" }} gap={3} p={4}>
                  {categories.map((category) => (
                    <Card.Root
                      key={category.id}
                      w="full"
                      border="1px solid"
                      borderColor="gray.200"
                      _dark={{ borderColor: "gray.700" }}
                      _hover={{ shadow: "sm" }}
                    >
                      <Card.Body p={4}>
                        <VStack align="stretch" gap={4}>
                          {/* Category Header */}
                          <HStack gap={3}>
                            <Box
                              w={12}
                              h={12}
                              bg="purple.100"
                              _dark={{ bg: "purple.900/30" }}
                              borderRadius="lg"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              flexShrink={0}
                            >
                              <Text fontSize="2xl">📁</Text>
                            </Box>
                            <VStack gap={1} align="start" flex={1}>
                              <Text fontWeight="bold" fontSize="lg">
                                {category.name}
                              </Text>
                              <Text fontSize="xs" color="fg.muted">
                                {new Date(category.createdAt).toLocaleDateString()}
                              </Text>
                            </VStack>
                          </HStack>

                          {/* Description */}
                          <Text 
                            fontSize="sm" 
                            color="fg.muted"
                            lineClamp={2}
                          >
                            {category.description || "No description"}
                          </Text>

                          {/* Actions */}
                          <HStack gap={2} w="full">
                            <Button
                              flex={1}
                              size="sm"
                              variant="outline"
                              colorScheme="purple"
                              onClick={() => handleEdit(category)}
                            >
                              Edit
                            </Button>
                            <Button
                              flex={1}
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              onClick={() => handleDelete(category.id)}
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
          <CategoryModal
            category={selectedCategory}
            onClose={handleModalClose}
          />
        )}

        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Category"
          message="Are you sure you want to delete this category? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={deleteMutation.isPending}
          variant="danger"
        />
      </VStack>
    </Box>
  );
};
