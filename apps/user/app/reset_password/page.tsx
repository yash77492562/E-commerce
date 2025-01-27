'use client'
import React, { useState, useRef, useCallback } from 'react';
import { Mail, Lock, KeyRound } from 'lucide-react';
import { Alert, AlertDescription } from "@repo/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { UserForgetPasswordSchema, userForgetPasswordSchema, userEmailSchema, UserEmailSchema } from '@repo/zod/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";

const PasswordReset = () => {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setOtpVerified] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(120); // 2 minutes countdown in seconds
  const [canResendOtp, setCanResendOtp] = useState(false); // Flag to show resend button

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
    watch: watchEmail,
    getValues: getEmailValues,
  } = useForm<UserEmailSchema>({
    resolver: zodResolver(userEmailSchema),
    mode: "onChange"
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset: resetForm
  } = useForm<UserForgetPasswordSchema>({
    resolver: zodResolver(userForgetPasswordSchema),
    mode: "onChange"
  });

  const handleSendOTP = async () => {
    const email = getEmailValues('email');
    
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/send_otp', {
        email
      },{
        headers:{
          "Content-Type":"application/json"
        }
      });

      if (response.data.success) {
        setStep('otp');
        startCountdown(); // Start the countdown when OTP is sent
      } else {
        setError(response.data.message || 'Failed to send verification code');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setError(error.response.data.message || 'Failed to send verification code');
        } else if (error.request) {
          setError('Network error. Please check your connection.');
        } else {
          setError('An unexpected error occurred.');
        }
      } else {
        setError('Failed to send verification code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setCanResendOtp(false); // Disable resend OTP initially
    setCountdown(120); // Reset the countdown to 2 minutes
    
    const intervalId = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setCanResendOtp(true); // Enable resend OTP after 2 minutes
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }, [otpDigits]);

  const handleOtpBackspace = useCallback((index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  }, [otpDigits]);

  const verifyOTP = async () => {
    const enteredOTP = otpDigits.join('');
    if (enteredOTP.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/check_otp', {
        email: getEmailValues('email'),
        otp: enteredOTP
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (response.data.success === true) {
        setOtpVerified(true);
        setStep('password');
        resetForm();
      } else {
        setError(response.data.message || 'Invalid OTP code');
        setOtpVerified(false);
      }
    } catch (error) {
      setOtpVerified(false)
      setStep('otp')
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setError(error.response.data.message || 'Failed to verify OTP');
        } else if (error.request) {
          setError('Network error. Please check your connection.');
        } else {
          setError('An unexpected error occurred.');
        }
      } else {
        setError('Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UserForgetPasswordSchema) => {
    if (data.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/password_change', {
        email: getEmailValues('email'),
        password: data.password
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.status === 200) {
        router.push('/auth/login');
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setError(error.response.data.message || 'Failed to reset password');
        } else if (error.request) {
          setError('Network error. Please check your connection.');
        } else {
          setError('An unexpected error occurred.');
        }
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Watch email value for real-time validation
  const watchPassword = watch('password');

  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <Card className="w-1/2 max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {step === 'email' && "Enter your email to receive a verification code"}
            {step === 'otp' && "Enter the 6-digit code sent to your email"}
            {step === 'password' && "Create your new password"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'email' && (
            <form onSubmit={handleSubmitEmail(handleSendOTP)} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    {...registerEmail('email')}
                    type="email"
                    placeholder="Enter your email"
                    className={`pl-10`}
                  />
                </div>
                {emailErrors.email && watchEmail('email') && (
                  <div className="space-y-1 mt-1">
                    <p className="text-sm text-red-500">{emailErrors.email.message}</p>
                    {emailErrors.email.message && (
                      <ul className="text-xs text-gray-500 list-disc pl-4">
                        <li>Must be a valid email format (e.g., name@example.com)</li>
                        <li>Cannot contain spaces</li>
                      </ul>
                    )}
                  </div>
                )}
              </div>
              <Button 
                type="submit"
                className="w-full" 
                disabled={loading || !!emailErrors.email}
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="flex justify-center space-x-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {otpInputRefs.current[index] = el}}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpBackspace(index, e)}
                    className="w-10 h-10 text-center border-2 border-gray-300 rounded-lg focus:outline-none"
                    maxLength={1}
                  />
                ))}
              </div>
              
              {!canResendOtp && countdown > 0 && (
                <p className="text-center text-gray-500 mt-2">
                  Resend OTP in {Math.floor(countdown / 60)}:{countdown % 60 < 10 ? '0' : ''}{countdown % 60}
                </p>
              )}

              {canResendOtp && (
                <Button 
                  type="button"
                  onClick={handleSendOTP} 
                  className="w-full mt-2"
                >
                  Resend OTP
                </Button>
              )}

              <Button 
                type="button"
                onClick={verifyOTP} 
                className="w-full mt-2"
              >
                Verify OTP
              </Button>
            </div>
          )}
          
          {step === 'password' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    {...register('password')}
                    type="password"
                    placeholder="New password"
                    className="pl-10"
                  />
                </div>
                {errors.password && watchPassword && (
                  <div className="space-y-1 mt-1">
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    name='password'
                    type="password"
                    placeholder="Confirm password"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {confirmPassword && confirmPassword !== watchPassword && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Updating..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;