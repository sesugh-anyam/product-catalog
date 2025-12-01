import { useState, useEffect } from 'react'
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
import { CreateUserDto } from '@product-catalog/shared'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

interface RegisterFormData extends CreateUserDto {
  confirmPassword: string
}

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [error, setError] = useState<string>('')
  const [showOtpStep, setShowOtpStep] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  const [otp, setOtp] = useState<string>('')
  const [otpError, setOtpError] = useState<string>('')
  const [resendCountdown, setResendCountdown] = useState(60)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const password = watch('password')

  useEffect(() => {
    if (showOtpStep && resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [showOtpStep, resendCountdown])

  const registerMutation = useMutation({
    mutationFn: apiClient.register.bind(apiClient),
    onSuccess: (response: any) => {
      if (response.data) {
        setUserEmail(response.data.email)
        setShowOtpStep(true)
        setResendCountdown(60) // Start countdown when OTP is sent
        setError('')
      }
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const verifyOtpMutation = useMutation({
    mutationFn: apiClient.verifyOtp.bind(apiClient),
    onSuccess: (response: any) => {
      if (response.data) {
        login(response.data.user, response.data.token)
        navigate('/')
      }
    },
    onError: (error: Error) => {
      setOtpError(error.message)
    },
  })

  const resendOtpMutation = useMutation({
    mutationFn: apiClient.resendOtp.bind(apiClient),
    onSuccess: () => {
      setOtpError('')
      setOtp('')
      setResendCountdown(60) // Reset countdown when OTP is resent
    },
    onError: (error: Error) => {
      setOtpError(error.message)
    },
  })

  const onSubmit = (data: RegisterFormData) => {
    setError('')
    const { confirmPassword, ...registerData } = data
    registerMutation.mutate(registerData)
  }

  const handleVerifyOtp = () => {
    setOtpError('')
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP')
      return
    }
    verifyOtpMutation.mutate({ email: userEmail, otp })
  }

  const handleResendOtp = () => {
    resendOtpMutation.mutate({ email: userEmail })
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
          <Heading size={{ base: "md", md: "lg" }}>
            {showOtpStep ? 'Verify Your Email' : 'Create Account'}
          </Heading>
          <Text 
            color="fg.muted"
            fontSize={{ base: "sm", md: "md" }}
            textAlign="center"
          >
            {showOtpStep 
              ? `We've sent a 6-digit code to ${userEmail}` 
              : 'Sign up to start managing your product catalog'
            }
          </Text>
        </VStack>

        <Card.Root
          boxShadow={{ base: "none", md: "lg" }}
          border={{ base: "none", md: "1px solid" }}
          borderColor={{ base: "transparent", md: "border" }}
        >
          <Card.Body p={{ base: 6, md: 8 }}>
            {!showOtpStep ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack gap={4}>
                  {error && (
                    <Alert status="error" variant="subtle">
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
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? 'Signing Up...' : 'Sign Up'}
                  </Button>
                </VStack>
              </form>
            ) : (
              <VStack gap={4}>
                {otpError && (
                  <Alert status="error" variant="subtle">
                    {otpError}
                  </Alert>
                )}

                <Alert status="info" variant="subtle">
                  Please check your email for the verification code
                </Alert>

                <Field
                  label="Verification Code"
                  invalid={!!otpError}
                >
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setOtp(value)
                      setOtpError('')
                    }}
                    maxLength={6}
                    fontSize="2xl"
                    textAlign="center"
                    letterSpacing="wider"
                  />
                </Field>

                <Button
                  onClick={handleVerifyOtp}
                  width="full"
                  size={{ base: "md", md: "lg" }}
                  disabled={verifyOtpMutation.isPending || otp.length !== 6}
                >
                  {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify Email'}
                </Button>

                <VStack gap={2} width="full">
                  <Text fontSize="sm" color="fg.muted" textAlign="center">
                    Didn't receive the code?
                  </Text>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResendOtp}
                    disabled={resendOtpMutation.isPending || resendCountdown > 0}
                  >
                    {resendOtpMutation.isPending 
                      ? 'Sending...' 
                      : resendCountdown > 0 
                        ? `Resend Code (${resendCountdown}s)`
                        : 'Resend Code'
                    }
                  </Button>
                </VStack>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowOtpStep(false)
                    setOtp('')
                    setOtpError('')
                    setError('')
                    setResendCountdown(60)
                    registerMutation.reset()
                    verifyOtpMutation.reset()
                    resendOtpMutation.reset()
                  }}
                >
                  ← Back to registration
                </Button>
              </VStack>
            )}
          </Card.Body>
        </Card.Root>

        {!showOtpStep && (
          <Text 
            textAlign="center" 
            fontSize={{ base: "xs", md: "sm" }}
          >
            Already have an account?{' '}
            <Link asChild color="blue.500">
              <RouterLink to="/login">Sign in</RouterLink>
            </Link>
          </Text>
        )}
      </VStack>
    </Container>
  )
}
