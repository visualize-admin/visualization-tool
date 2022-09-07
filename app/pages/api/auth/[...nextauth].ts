import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

import { KEYCLOAK_ID, KEYCLOAK_SECRET, KEYCLOAK_ISSUER } from "@/domain/env";
import { truthy } from "@/domain/types";

import type { NextApiRequest, NextApiResponse } from "next";

const providers = [
  KEYCLOAK_ID && KEYCLOAK_SECRET
    ? KeycloakProvider({
        clientId: KEYCLOAK_ID as string,
        clientSecret: KEYCLOAK_SECRET as string,
        issuer: KEYCLOAK_ISSUER as string,
      })
    : null,
].filter(truthy);

const nextAuthConfig = {
  // Configure one or more authentication providers
  providers,
  callbacks: {
    session: async ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    /** Necessary otherwise we cannot sign out */
    jwt: async ({ token }) => {
      return token;
    },
  },
} as NextAuthOptions;

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  try {
    await NextAuth(req, res, nextAuthConfig);
  } catch (e) {
    console.error(e);
    throw e;
  }
}
