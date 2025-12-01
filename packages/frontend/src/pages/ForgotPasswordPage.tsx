import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Button,
  Container,
  VStack,
  Text,
  Heading,
  Link,
  Card,
  Input,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/services/api";

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPasswordPage = () => {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const forgotPasswordMutation = useMutation({
    mutationFn: apiClient.forgotPassword.bind(apiClient),
    onSuccess: (response: any) => {
      if (response.data) {
        setSuccess(response.data.message);
        setError("");
      }
    },
    onError: (error: Error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setError("");
    setSuccess("");
    forgotPasswordMutation.mutate(data);
  };

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
          <Heading size={{ base: "md", md: "lg" }}>Forgot Password?</Heading>
          <Text
            color="fg.muted"
            fontSize={{ base: "sm", md: "md" }}
            textAlign="center"
          >
            Enter your email address and we'll send you instructions to reset
            your password.
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

                {success && (
                  <Alert status="success" variant="subtle">
                    {success}
                  </Alert>
                )}

                <Field
                  label="Email"
                  invalid={!!errors.email}
                  errorText={errors.email?.message}
                >
                  <Input
                    type="email"
                    placeholder="your-email@example.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email format",
                      },
                    })}
                  />
                </Field>

                <Button
                  type="submit"
                  width="full"
                  size={{ base: "md", md: "lg" }}
                  disabled={forgotPasswordMutation.isPending}
                  bg="black"
                  color="white"
                  _dark={{
                    bg: "white",
                    color: "black",
                  }}
                >
                  {forgotPasswordMutation.isPending
                    ? "Sending..."
                    : "Send Reset Link"}
                </Button>
              </VStack>
            </form>
          </Card.Body>
        </Card.Root>
      </VStack>

      <VStack gap={2} mt={8} width="full">
        <Text fontSize="sm" color="black" _dark={{ color: "white" }} textAlign="center">
          Remember your password?{" "}
          <Link asChild color="blue.500">
            <RouterLink to="/login">Sign in</RouterLink>
          </Link>
        </Text>
      </VStack>
    </Container>
  );
};
