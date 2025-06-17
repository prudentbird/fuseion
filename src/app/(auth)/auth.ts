import { env } from '~/env';
import { authConfig } from './auth.config';
import { UserInterface } from '~/types/user';
import { api } from '~/convex/_generated/api';
import { fetchMutation } from 'convex/nextjs';
import type { DefaultJWT } from 'next-auth/jwt';
import Google from 'next-auth/providers/google';
import NextAuth, { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: UserInterface & DefaultSession['user'];
  }

  interface User extends UserInterface {}
  interface AdapterUser extends UserInterface {
    emailVerified: Date | null;
  }
}

declare module 'next-auth/jwt' {
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
  providers: [Google],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const newUser = {
          tier: 'free' as const,
          email: profile?.email || '',
          id: 'google:' + profile?.sub,
          picture: profile?.picture as string,
          name:
            profile?.name || profile?.given_name + ' ' + profile?.family_name,
          preferences: {
            name:
              profile?.name || profile?.given_name + ' ' + profile?.family_name,
          },
        };

        user = newUser;
        await fetchMutation(api.users.createUser, newUser);
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
          emailVerified: Date | null;
        };
      }

      return session;
    },
  },
  trustHost: true,
  debug: ['local', 'development'].includes(env.NODE_ENV),
});
