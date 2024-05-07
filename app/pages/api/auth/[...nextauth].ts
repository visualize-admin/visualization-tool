import NextAuth, { NextAuthOptions } from "next-auth";

import { ensureUserFromSub } from "@/db/user";
import { KEYCLOAK_ID, KEYCLOAK_ISSUER, KEYCLOAK_SECRET } from "@/domain/env";
import { truthy } from "@/domain/types";

import type { NextApiRequest, NextApiResponse } from "next";

const providers = [
  KEYCLOAK_ID && KEYCLOAK_SECRET && KEYCLOAK_ISSUER
    ? {
        id: "adfs",
        name: "adfs",
        type: "oidc",
        clientId: KEYCLOAK_ID,
        clientSecret: KEYCLOAK_SECRET,
        wellKnown: KEYCLOAK_ISSUER,
        authorization: {
          url: `${KEYCLOAK_ISSUER}/protocol/openid-connect/auth`,
          params: {
            scope: "openid",
          },
        },
        issuer: KEYCLOAK_ISSUER,
        token: `${KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
        userInfo: `${KEYCLOAK_ISSUER}/protocol/openid-connect/userinfo`,
        checks: ["pkce", "state"],
        profile(profile: any) {
          return {
            id: profile.sub,
          };
        },
      }
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
