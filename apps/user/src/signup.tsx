'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Eye, EyeOff, User, Phone, Mail, Lock } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { userSigninSchema, type UserSigninSchema } from '@repo/zod/client';
import Link from 'next/link';

type SignUpProps = {
  onSignUp: (formData: UserSigninSchema) => Promise<void>;
};

const SignUp = ({ onSignUp }: SignUpProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [isCheckingUser, setIsCheckingUser] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
    trigger
  } = useForm<UserSigninSchema>({
    resolver: zodResolver(userSigninSchema),
    mode: 'all'
  });

  const email = watch('email');
  const phone = watch('phone');

  const checkUserExists = useCallback(async (email: string | null, phone: string | null) => {
    if (!email && !phone) return;
    
    setIsCheckingUser(true);
    try {
      const response = await axios.post('/api/userAuthenticate', {
        email,
        phone
      });

      const userExists = response.status === 200;
      if (email) setEmailError(userExists ? 'This email is already registered' : '');
      if (phone) setPhoneError(userExists ? 'This phone number is already registered' : '');
    } catch {
      // Assuming a failed request means the user doesn't exist
      if (email) setEmailError('');
      if (phone) setPhoneError('');
    } finally {
      setIsCheckingUser(false);
    }
  }, []);

  const validateField = useCallback(async (
    field: 'email' | 'phone',
    value: string | null,
    setError: (error: string) => void
  ) => {
    if (!value) return;
    const isValid = await trigger(field);
    if (isValid && !errors[field]) {
      await checkUserExists(field === 'email' ? value : null, field === 'phone' ? value : null);
    } else {
      setError('');
    }
  }, [trigger, errors, checkUserExists]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateField('email', email, setEmailError);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [email, validateField]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateField('phone', phone, setPhoneError);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [phone, validateField]);

  const onSubmit = async (formData: UserSigninSchema) => {
    if (emailError || phoneError) return;
    try {
      setServerError(null);
      await onSignUp(formData);
    } catch (error) {
      if (error instanceof AxiosError) {
        setServerError(error.response?.data?.message ?? 'Something went wrong');
      } else {
        setServerError('An unexpected error occurred');
      }
    }
  };

  const InputField = useCallback(({ 
    id, 
    type, 
    icon: Icon, 
    label, 
    placeholder, 
    error, 
    customError,
    showChecker
  }: {
    id: keyof UserSigninSchema;
    type: string;
    icon: React.ElementType;
    label: string;
    placeholder: string;
    error?: { message?: string };
    customError?: string;
    showChecker?: boolean;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          id={id}
          type={type}
          className={`pl-9 ${(error || customError) ? 'border-red-500' : ''}`}
          placeholder={placeholder}
          {...register(id)}
        />
        {showChecker && isCheckingUser && watch(id) && !error && (
          <span className="absolute right-3 top-2.5 text-gray-400">Checking...</span>
        )}
      </div>
      {(error || customError) && (
        <p className="text-sm text-red-500 mt-1">
          {error?.message || customError}
        </p>
      )}
    </div>
  ), [isCheckingUser, register, watch]);

  return (
    <div className=" max-h-[800px] h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <InputField
              id="username"
              type="text"
              icon={User}
              label="Username"
              placeholder="JohnDoe"
              error={errors.username}
            />

            <InputField
              id="email"
              type="email"
              icon={Mail}
              label="Email"
              placeholder="example@gmail.com"
              error={errors.email}
              customError={emailError}
              showChecker
            />

            <InputField
              id="phone"
              type="tel"
              icon={Phone}
              label="Phone"
              placeholder="1234567890"
              error={errors.phone}
              customError={phoneError}
              showChecker
            />

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`pl-9 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div>
                  <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                  <ul className="text-xs text-gray-500 list-disc pl-4 mt-1">
                    <li>At least 8 characters long</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character</li>
                  </ul>
                </div>
              )}
            </div>

            {serverError && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {serverError}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !!emailError || !!phoneError || !isDirty || isCheckingUser}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:underline">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;