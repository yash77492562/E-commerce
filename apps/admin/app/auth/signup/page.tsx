'use client';
import SignUp from "../../../src/signup";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserSigninSchema } from "@repo/zod/client";

const SignupPage = () => {
  const router = useRouter();

  const handleSignUp = async (data: UserSigninSchema) => {
    try {
      const result = await signIn('signup-credentials', {
        username: data.username,
        email: data.email,
        password: data.password,
        phone: data.phone,
        redirect: false,
      });

      if (result?.error) {
        console.error("Signup failed:", result.error);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return <SignUp onSignUp={handleSignUp} />;
};

export default SignupPage;