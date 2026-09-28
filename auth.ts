import NextAuth, { type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { isAdminEmailAllowed } from "@/app/lib/admin-access";

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const providers: NextAuthConfig["providers"] = [];
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(Google);
  }
  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(GitHub);
  }

  return {
    providers,
    session: { strategy: "jwt" },
    callbacks: {
      signIn({ user }) {
        return isAdminEmailAllowed(user.email);
      },
    },
  };
});
