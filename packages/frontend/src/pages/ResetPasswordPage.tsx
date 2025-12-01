import { useState, useEffect } from 'react'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
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
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

export const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuthStore()
  const [error, setError] = useState<string>('')
  const [verifying, setVerifying] = useState(true)
  const [tokenEmail, setTokenEmail] = useState<string>('')
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>()

  const password = watch('password')

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid reset link. Please request a new password reset.')
        setVerifying(false)
        return
      }

      try {
        const response = await apiClient.verifyResetToken({ token })
        if (response.data) {
          setTokenEmail(response.data.email)
          setVerifying(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid or expired reset link')
        setVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const resetPasswordMutation = useMutation({
    mutationFn: apiClient.resetPassword.bind(apiClient),
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

  const onSubmit = (data: ResetPasswordFormData) => {
    setError('')
    if (!token) return
    resetPasswordMutation.mutate({ token, password: data.password })
  }

  if (verifying) {
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
        <Card.Root>
          <Card.Body p={{ base: 6, md: 8 }}>
            <Text textAlign="center">Verifying reset link...</Text>
          </Card.Body>
        </Card.Root>
      </Container>
    )
  }

  if (error && !token) {
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
          <Card.Root>
            <Card.Body p={{ base: 6, md: 8 }}>
              <VStack gap={4}>
                <Alert status="error" variant="subtle">
                  {error}
                </Alert>
                <Button
                  asChild
                  width="full"
                  bg="black"
                  color="white"
                  _dark={{
                    bg: "white",
                    color: "black"
                  }}
                >
                  <RouterLink to="/forgot-password">Request New Reset Link</RouterLink>
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Container>
    )
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
          <Heading size={{ base: "md", md: "lg" }}>Reset Your Password</Heading>
          <Text 
            color="fg.muted"
            fontSize={{ base: "sm", md: "md" }}
            textAlign="center"
          >
            {tokenEmail ? `Enter a new password for ${tokenEmail}` : 'Enter your new password'}
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
                  <Alert status="error" variant="subtle">
                    {error}
                  </Alert>
                )}

                <Field
                  label="New Password"
                  invalid={!!errors.password}
                  errorText={errors.password?.message}
                >
                  <Input
                    type="password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                    })}
                  />
                </Field>

                <Field
                  label="Confirm Password"
                  invalid={!!errors.confirmPassword}
                  errorText={errors.confirmPassword?.message}
                >
                  <Input
                    type="password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => {
                        const currentPassword = Array.isArray(password) ? password[0] : password
                        return value === currentPassword || 'Passwords do not match'
                      },
                    })}
                  />
                </Field>

                <Button
                  type="submit"
                  width="full"
                  size={{ base: "md", md: "lg" }}
                  disabled={resetPasswordMutation.isPending}
                  bg="black"
                  color="white"
                  _dark={{
                    bg: "white",
                    color: "black"
                  }}
                >
                  {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                </Button>

                <Text fontSize="sm" color="fg.muted" textAlign="center">
                  Remember your password?{' '}
                  <Link asChild color="blue.500">
                    <RouterLink to="/login">Sign in</RouterLink>
                  </Link>
                </Text>
              </VStack>
            </form>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Container>
  )
}
