import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Container,
  Heading,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { useAuthStore } from '@/lib/auth-store';
import { useLocation } from 'wouter';

const authSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  const toast = useToast();
  const { login, register, loading } = useAuthStore();

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    try {
      if (isLogin) {
        await login(data.username, data.password);
      } else {
        await register(data.username, data.password);
      }
      setLocation('/');
      toast({
        title: isLogin ? 'Login successful' : 'Registration successful',
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
      });
    }
  };

  return (
    <Container maxW="md" py={12}>
      <Card>
        <CardBody>
          <VStack spacing={6}>
            <Heading size="lg">
              {isLogin ? 'Login' : 'Create Account'}
            </Heading>

            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={!!errors.username}>
                  <FormLabel>Username</FormLabel>
                  <Input
                    {...registerForm('username')}
                    autoComplete="username"
                  />
                  {errors.username && (
                    <Text color="red.500" fontSize="sm">
                      {errors.username.message}
                    </Text>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Password</FormLabel>
                  <Input
                    {...registerForm('password')}
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  {errors.password && (
                    <Text color="red.500" fontSize="sm">
                      {errors.password.message}
                    </Text>
                  )}
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="100%"
                  isLoading={loading}
                >
                  {isLogin ? 'Login' : 'Register'}
                </Button>
              </VStack>
            </form>

            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              isDisabled={loading}
            >
              {isLogin
                ? "Don't have an account? Register"
                : 'Already have an account? Login'}
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}
