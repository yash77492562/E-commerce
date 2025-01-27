import CredentialsProvider from "next-auth/providers/credentials";
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

// Separate provider for login
const loginProvider = CredentialsProvider({
  id: "login-credentials",
  name: "Login",
  credentials: {
    email: { label: "Email", type: "email", placeholder: "example@gmail.com" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials): Promise<NextAuthUser | null> {
    try {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password required");
      }
      const email_token = generateSecureTokenWithSalt(credentials.email)
      // Find user by email
      const admin = await prisma.token.findFirst({
        where: { 
          email_token
        },
        select:{
          admin:{
            select:{
              password:true,
              id:true
            }
          }
        }
      });

      if (!admin ) {
        throw new Error("No user found with this email");
      }
      if(!admin.admin){
        throw new Error("No Admin with this email")
      }
      // Verify password
      const isValidPassword = await argon2.verify(admin.admin.password, credentials.password);
      if (!isValidPassword) {
        throw new Error("Invalid password");
      }

      return {
        id: admin.admin.id,
        email: credentials.email  // Use unencrypted email for session
      };
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }
});

// Separate provider for signup
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
      if (!credentials) {
        throw new Error("Credentials are required");
      }

      const { username, email, password, phone } = credentials;

      // Check if user exists
      const userExist = await userAuthenticate({ email, phone });
      if (userExist) {
        throw new Error("Email or phone number already exists");
      }

      // Hash password
      const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4
      });

      // Encrypt sensitive data
      const encryptEmail = encrypt(email);
      const encryptUsername = encrypt(username);
      const encryptPhone = encrypt(phone);

      // Create user and token in a transaction
      const user = await prisma.$transaction(async (tx:any) => {
        const newUser = await tx.admin.create({
          data: {
            username: encryptUsername,
            email: encryptEmail,
            phone: encryptPhone,
            password: hashedPassword
          }
        });

        await tx.token.create({
          data: {
            adminId: newUser.id,
            email_token: generateSecureTokenWithSalt(email),
            phone_token: generateSecureTokenWithSalt(phone)
          }
        });

        return newUser;
      });

      return {
        id: user.id,
        email: email  // Use unencrypted email for session
      };
    } catch (error) {
      console.error("Signup error:", error);
      return null;
    }
  }
});

// Callbacks for NextAuth
const callbacks: CallbacksOptions = {
  async jwt({ token, user }: { token: JWT; user?: NextAuthUser }) {
    if (user) {
      token.sub = user.id;
      token.email = user.email;
    }
    return token;
  },

  // Handle user session
  async session({ session, token }) {
    if (token && session.user) {
      session.user.id = token.sub!;
      session.user.email = token.email!;
    }
    return session;
  },

  // Handle sign-in events
  async signIn() {
    return true;
  },

  // Redirect after sign-in using ADMIN_NEXTAUTH_URL
  async redirect({ url }) {
    const adminBaseUrl = process.env.ADMIN_NEXTAUTH_URL || 'http:localhost:3001';
    if (!adminBaseUrl) throw new Error("ADMIN_NEXTAUTH_URL is not configured");
    
    // Check if the URL starts with the admin base URL
    if (url.startsWith(adminBaseUrl)) return url;
    // If it's a relative URL, prefix it with the admin base URL
    else if (url.startsWith("/")) return new URL(url, adminBaseUrl).toString();
    // Default to the admin base URL
    return adminBaseUrl;
  }
};

// Export NextAuth configuration
export const authOptions: AuthOptions = {
  providers: [loginProvider, signupProvider],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },
  callbacks,
  session: {
    strategy: 'jwt' satisfies SessionStrategy,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
};