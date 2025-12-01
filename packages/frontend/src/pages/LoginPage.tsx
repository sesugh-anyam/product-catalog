import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Button,
  Container,
  VStack,
  Text,
  Heading,
  Link,
  Card,
  Input,
} from '@chakra-ui/react'
import { Field } from '@/components/ui/field'
import { Alert } from '@/components/ui/alert'
import { useMutation } from '@tanstack/react-query'
import { LoginDto } from '@product-catalog/shared'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [error, setError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>()

  const loginMutation = useMutation({
    mutationFn: apiClient.login.bind(apiClient),
    onSuccess: (response: any) => {
      if (response.data) {
        login(response.data.user, response.data.token)
        navigate('/')
      }
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const onSubmit = (data: LoginDto) => {
    setError('')
    loginMutation.mutate(data)
  }

  return (
    <Container 
      maxW="md" 
      py={{ base: 8, md: 16 }}
      px={{ base: 4, md: 6 }}
      minH="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <VStack gap={8} align="stretch">
        <VStack gap={2}>
          <Heading size={{ base: "md", md: "lg" }}>Sign In</Heading>
          <Text 
            color="fg.muted"
            fontSize={{ base: "sm", md: "md" }}
            textAlign="center"
          >
            Enter your credentials to access your account
          </Text>
        </VStack>

        <Card.Root
          boxShadow={{ base: "none", md: "lg" }}
          border={{ base: "none", md: "1px solid" }}
          borderColor={{ base: "transparent", md: "border" }}
        >
          <Card.Body p={{ base: 6, md: 8 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack gap={4}>
                {error && (
                  <Alert status="error">
                    {error}
                  </Alert>
                )}

                <Field
                  label="Email"
                  invalid={!!errors.email}
                  errorText={errors.email?.message}
                >
                  <Input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email format',
                      },
                    })}
                  />
                </Field>

                <Field
                  label="Password"
                  invalid={!!errors.password}
                  errorText={errors.password?.message}
                >
                  <Input
                    type="password"
                    {...register('password', {
                      required: 'Password is required',
                    })}
                  />
                </Field>

                <VStack gap={2} width="full" alignItems="flex-end">
                  <Link asChild color="blue.500" fontSize="sm">
                    <RouterLink to="/forgot-password">Forgot password?</RouterLink>
                  </Link>
                </VStack>

                <Button
                  type="submit"
                  width="full"
                  size={{ base: "md", md: "lg" }}
                  disabled={loginMutation.isPending}
                  bg="black"
                  color="white"
                  _dark={{
                    bg: "white",
                    color: "black"
                  }}
                >
                  {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                </Button>
              </VStack>
            </form>
          </Card.Body>
        </Card.Root>

        <Text 
          textAlign="center" 
          fontSize={{ base: "xs", md: "sm" }}
        >
          Don't have an account?{' '}
          <Link asChild color="blue.500">
            <RouterLink to="/register">Sign up</RouterLink>
          </Link>
        </Text>
      </VStack>
    </Container>
  )
}
