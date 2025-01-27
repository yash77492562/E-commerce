import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import { prisma } from "@repo/prisma_database/client";
import { userAuthenticate } from "../userAuthenticate/userAuthenticate";
import * as argon2 from "argon2";
import { encrypt } from "@repo/encrypt/client";
import { generateSecureTokenWithSalt } from "../token/token";
import type { 
  AuthOptions,
  CallbacksOptions,
  SessionStrategy
} from "next-auth";
import type { Profile } from "next-auth";

// Type extension for Google profile
interface GoogleProfile extends Profile {
  email_verified?: boolean;
  email?: string;
}

// Improved error handling utility
const createAuthError = (message: string, code?: string) => {
  const error = new Error(message);
  error.name = 'AuthError';
  if (code) (error as any).code = code;
  return error;
};

const loginProvider = CredentialsProvider({
  id: "login-credentials",
  name: "Login",
  credentials: {
    email: { 
      label: "Email", 
      type: "email", 
      placeholder: "example@gmail.com" 
    },
    password: { 
      label: "Password", 
      type: "password" 
    }
  },
  async authorize(credentials): Promise<NextAuthUser | null> {
    try {
      if (!credentials?.email || !credentials?.password) {
        throw createAuthError("Email and password required", "MISSING_CREDENTIALS");
      }

      const email_token = generateSecureTokenWithSalt(credentials.email.toLowerCase());
      
      const user = await prisma.token.findFirst({
        where: { email_token },
        select: {
          user: {
            select: {
              id: true,
              password: true,
              isActive: true,
              loginAttempts: true,
              lastLoginAttempt: true
            }
          }
        }
      });

      if (!user?.user) {
        throw createAuthError("Invalid credentials", "INVALID_CREDENTIALS");
      }

      // Rate limiting check
      const now = new Date();
      if (user.user.loginAttempts >= 5 && 
          user.user.lastLoginAttempt && 
          now.getTime() - user.user.lastLoginAttempt.getTime() < 15 * 60 * 1000) {
        throw createAuthError("Too many login attempts. Please try again later.", "RATE_LIMIT");
      }

      // Verify password
      const isValidPassword = await argon2.verify(user.user.password, credentials.password);
      
      // Update login attempts
      await prisma.user.update({
        where: { id: user.user.id },
        data: {
          loginAttempts: isValidPassword ? 0 : user.user.loginAttempts + 1,
          lastLoginAttempt: now
        }
      });

      if (!isValidPassword) {
        throw createAuthError("Invalid credentials", "INVALID_CREDENTIALS");
      }

      if (!user.user.isActive) {
        throw createAuthError("Account is inactive", "INACTIVE_ACCOUNT");
      }

      return {
        id: user.user.id,
        email: credentials.email
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }
});

const signupProvider = CredentialsProvider({
  id: "signup-credentials",
  name: "Signup",
  credentials: {
    username: { label: "Username", type: "text", placeholder: "John Smith" },
    phone: { label: "Phone", type: "tel", placeholder: "1234567899" },
    password: { label: "Password", type: "password" },
    email: { label: "Email", type: "email", placeholder: "example@gmail.com" }
  },
  async authorize(credentials): Promise<NextAuthUser | null> {
    try {
      if (!credentials?.username || !credentials?.email || 
          !credentials?.password || !credentials?.phone) {
        throw createAuthError("All fields are required", "MISSING_FIELDS");
      }

      const { username, email, password, phone } = credentials;
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw createAuthError("Invalid email format", "INVALID_EMAIL");
      }

      // Validate password strength
      if (password.length < 8) {
        throw createAuthError("Password must be at least 8 characters", "WEAK_PASSWORD");
      }

      // Check existing user
      const userExist = await userAuthenticate({ 
        email: email.toLowerCase(), 
        phone 
      });
      
      if (userExist) {
        throw createAuthError("Email or phone number already exists", "USER_EXISTS");
      }

      // Hash password with improved settings
      const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 4,
        parallelism: 4
      });

      // Encrypt sensitive data
      const encryptEmail = encrypt(email.toLowerCase());
      const encryptUsername = encrypt(username);
      const encryptPhone = encrypt(phone);

      // Create user with additional security fields
      const user = await prisma.$transaction(async (tx:any) => {
        const newUser = await tx.user.create({
          data: {
            username: encryptUsername,
            email: encryptEmail,
            phone: encryptPhone,
            password: hashedPassword,
            isActive: true,
            loginAttempts: 0,
            lastLoginAttempt: new Date()
          }
        });

        await tx.token.create({
          data: {
            userId: newUser.id,
            email_token: generateSecureTokenWithSalt(email.toLowerCase()),
            phone_token: generateSecureTokenWithSalt(phone)
          }
        });

        return newUser;
      });

      return {
        id: user.id,
        email
      };
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }
});

const googleProvider = GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  authorization: {
    params: {
      prompt: "consent",
      access_type: "offline",
      response_type: "code",
      redirect_uri: "https://www.ckmehandicraft.com/api/auth/callback/google"
    }
  }
});

const callbacks: CallbacksOptions = {
  async jwt({ token, user }: { token: JWT; user?: NextAuthUser }) {
    if (user) {
      token.sub = user.id;
      token.email = user.email;
      token.iat = Math.floor(Date.now() / 1000);
      token.exp = Math.floor(Date.now() / 1000) + (60 * 60 * 24); // 24 hours
    }
    return token;
  },

  async session({ session, token }) {
    if (token && session.user) {
      session.user.id = token.sub!;
      session.user.email = token.email!;
    }
    return session;
  },

  async signIn({ account, profile }) {
    if (account?.provider === 'google' && profile) {
      const googleProfile = profile as GoogleProfile;
      // Check if the email is verified and exists
      return !!(googleProfile.email_verified && googleProfile.email);
    }
    return true;
  },

  async redirect({ url, baseUrl }) {
    if (url.startsWith(baseUrl)) return url;
    else if (url.startsWith("/")) return `${baseUrl}${url}`;
    return baseUrl;
  }
};

export const authOptions: AuthOptions = {
  providers: [loginProvider, signupProvider, googleProvider],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },
  session: {
    strategy: 'jwt' as SessionStrategy,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks,
  debug: process.env.NODE_ENV === 'production'
};