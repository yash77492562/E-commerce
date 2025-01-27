'use client'
import { Login } from "../../../src/login";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserLoginSchema } from "@repo/zod/client";

const LoginPage = () => {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (data: UserLoginSchema) => {
    try {
      const result = await signIn("login-credentials", {
        email: data.email,
        password: data.password,
        redirect: false, // Prevent automatic redirect
      });

      if (result?.error) {
        // Handle login error
        setLoginError("Invalid email or password");
        console.error("Login failed:", result.error);
      } else {
        // Successful login
        // Redirect to desired page after successful login
        router.push('/'); // or wherever you want to redirect
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An unexpected error occurred");
    }
  };

  return <Login onLogin={handleLogin} error={loginError} />;
};

export default LoginPage;