import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { env } from "~/env";

const googleConfigured =
  Boolean(env.GOOGLE_CLIENT_ID) && Boolean(env.GOOGLE_CLIENT_SECRET);

/**
 * Opções do NextAuth (login social Google quando `GOOGLE_CLIENT_*` estiverem definidos).
 */
export const authOptions: NextAuthOptions = {
  providers: googleConfigured
    ? [
        GoogleProvider({
          clientId: env.GOOGLE_CLIENT_ID!,
          clientSecret: env.GOOGLE_CLIENT_SECRET!,
        }),
      ]
    : [],
  secret: env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
