import NextAuth from "next-auth";
import { getServerSession } from "next-auth";
import { cookies, headers } from "next/headers";
import GoogleProvider from "next-auth/providers/google";

import { createGuest, getGuest } from "./data-service";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      void account;
      void profile;

      try {
        const existingGuest = await getGuest(user.email);

        if (!existingGuest) {
          await createGuest({
            email: user.email,
            fullName: user.name,
          });
        }

        return true;
      } catch (error) {
  console.error("Google sign-in callback failed:", error);
  return false;
}
    },
    authorized({ auth, request }) {
      void request;
      return !!auth?.user;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
};

export async function auth() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const req = {
    headers: Object.fromEntries(headerStore.entries()),
    cookies: Object.fromEntries(
      cookieStore.getAll().map((cookie) => [cookie.name, cookie.value]),
    ),
  };

  const res = {
    getHeader() {},
    setCookie() {},
    setHeader() {},
  };

  return getServerSession(req, res, authOptions);
}

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
