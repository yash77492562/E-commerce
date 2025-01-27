import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { userLoginSchema, UserLoginSchema } from "@repo/zod/client";
import { Button } from "@repo/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import axios from 'axios';
import Link from "next/link";
import { signIn } from "next-auth/react";

interface LoginProps {
  onLogin: (formData: UserLoginSchema) => void;
  error?: string | null;
}

interface InputFieldProps {
  id: keyof UserLoginSchema;
  type: string;
  icon: React.ElementType;
  label: string;
  error?: string;
  register: any;
  placeholder: string;
  rightElement?: ReactNode;
}

const InputField = ({ 
  id, 
  type, 
  icon: Icon, 
  label, 
  error, 
  register, 
  placeholder,
  rightElement
}: InputFieldProps) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <Label htmlFor={id}>{label}</Label>
      {id === 'password' && (
        <Link href="/reset_password" className="text-sm text-blue-600 hover:text-blue-500">
          Forget password
        </Link>
      )}
    </div>
    <div className="relative">
      <Icon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      <Input
        type={type}
        id={id}
        {...register(id)}
        className={`pl-9 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        placeholder={placeholder}
      />
      {rightElement}
    </div>
    {error && (
      <div className="space-y-1 mt-1">
        <p className="text-sm text-red-500">{error}</p>
        {error === 'Please enter a valid email address' && (
          <ul className="text-xs text-gray-500 list-disc pl-4">
            <li>Must be a valid email format (e.g., name@example.com)</li>
            <li>Cannot contain spaces</li>
          </ul>
        )}
      </div>
    )}
  </div>
);

export const Login = ({
  onLogin,
  error: propError,
}: LoginProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<UserLoginSchema>({
    resolver: zodResolver(userLoginSchema),
    mode: "onChange"
  });

  const email = watch('email');

  const validateEmail = useCallback(async (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    try {
      const response = await axios.post('/api/userAuthenticate', 
        { email },
        { headers: { "Content-Type": "application/json" }}
      );
      
      return response.data?.exists === false || response.status !== 200
        ? 'No account found with this email'
        : '';
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return error.response?.status === 500
          ? 'No account found with this email'
          : 'Error checking email. Please try again.';
      }
      return 'Error checking email. Please try again.';
    }
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const checkEmail = async () => {
      if (!email) {
        setEmailError('');
        return;
      }

      setIsCheckingEmail(true);
      const error = await validateEmail(email);
      setEmailError(error);
      setIsCheckingEmail(false);
    };

    timeoutId = setTimeout(checkEmail, 500);
    return () => {
      clearTimeout(timeoutId);
      setIsCheckingEmail(false);
    };
  }, [email, validateEmail]);

  const onSubmit = async (formData: UserLoginSchema) => {
    if (emailError || isCheckingEmail) return;
    
    try {
      setServerError(null);
      await onLogin(formData);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setServerError(error.response?.data?.message || 'Something went wrong');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ibisWhite py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Log in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <InputField
              id="email"
              type="email"
              icon={Mail}
              label="Email"
              error={emailError || errors.email?.message}
              register={register}
              placeholder="Enter your email"
            />

            <InputField
              id="password"
              type={showPassword ? "text" : "password"}
              icon={Lock}
              label="Password"
              error={errors.password?.message}
              register={register}
              placeholder="Enter your password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
            />

            {(serverError || propError) && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {serverError || propError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting || !!emailError || isCheckingEmail}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <div className="text-center text-sm text-gray-500">
              Or log in with
            </div>

            <Button 
              type="button" 
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              onClick={() => signIn('google')}
            >
              Log in with Google
            </Button>

            <div className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="font-medium text-blue-600 hover:underline">
                Sign Up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};