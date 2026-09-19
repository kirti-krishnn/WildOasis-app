import { withAuth } from "next-auth/middleware";

export const middleware = withAuth({
  secret: process.env.AUTH_SECRET,

  callbacks: {
    authorized({ token }) {
      return !!token;
    },
  },

  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/account/:path*"],
};