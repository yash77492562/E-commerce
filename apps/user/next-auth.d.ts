// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;        // Include custom properties
      email: string;     // Ensure email is also declared
    } & DefaultSession["user"];
  }

  interface User {
    id: string;          // Extend user object to include id
    email: string;
  }
}
