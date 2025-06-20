import { env } from "~/env";
import { authConfig } from "./auth.config";
import { UserInterface } from "~/types/user";
import { api } from "~/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import type { DefaultJWT } from "next-auth/jwt";
import NextAuth, { type DefaultSession } from "next-auth";
import Google, { GoogleProfile } from "next-auth/providers/google";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: UserInterface & DefaultSession["user"];
  }

  interface User extends UserInterface {}
  interface AdapterUser extends UserInterface {
    emailVerified: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    user: UserInterface;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Google({
      profile(profile: GoogleProfile) {
        return {
          tier: "free",
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
          userId: "google:" + profile.sub,
          preferences: { name: profile.name },
        } as UserInterface;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const dbUser = await fetchMutation(api.users.upSertUser, {
          tier: user.tier,
          name: user.name,
          email: user.email,
          userId: user.userId,
          picture: user.picture,
          preferences: user.preferences,
        } as UserInterface);
        if (!dbUser) {
          return false;
        }

        user = {
          ...user,
          ...dbUser,
        } as UserInterface;
      }

      return !!user;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user as UserInterface;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as UserInterface & {
          id: string;
          emailVerified: Date | null;
        };
      }

      return session;
    },
  },
  trustHost: true,
  debug: ["local", "development"].includes(env.NODE_ENV),
});
