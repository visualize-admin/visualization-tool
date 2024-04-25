import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

import { ensureUserFromSub } from "@/db/user";
import { KEYCLOAK_ID, KEYCLOAK_ISSUER, KEYCLOAK_SECRET } from "@/domain/env";
import { truthy } from "@/domain/types";

import type { NextApiRequest, NextApiResponse } from "next";

const providers = [
  KEYCLOAK_ID && KEYCLOAK_SECRET
    ? KeycloakProvider({
        clientId: KEYCLOAK_ID as string,
        clientSecret: KEYCLOAK_SECRET as string,
        issuer: KEYCLOAK_ISSUER as string,
        authorization: {
          params: {
            scope: "openid",
          },
        },
      })
    : null,
].filter(truthy);

export const nextAuthOptions = {
  providers,
  callbacks: {
    /**
     * When the user is logged in, ensures it creates on our side and save its id
     * on the session.
     */
    session: async ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.sub = token.sub;
        const user = await ensureUserFromSub(token.sub, token.name);
        session.user.id = user.id;
      }
      return session;
    },
    /** Necessary otherwise we cannot sign out */
    jwt: async ({ token }) => {
      return token;
    },
  },
  debug: true,
} as NextAuthOptions;

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  try {
    await NextAuth(req, res, nextAuthOptions);
  } catch (e) {
    console.error(e);
    throw e;
  }
}
