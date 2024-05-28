import NextAuth, { NextAuthOptions } from "next-auth";

import ADFS from "@/auth-providers/adfs";
import { ensureUserFromSub } from "@/db/user";
import { KEYCLOAK_ID, KEYCLOAK_ISSUER, KEYCLOAK_SECRET } from "@/domain/env";
import { truthy } from "@/domain/types";

import type { NextApiRequest, NextApiResponse } from "next";

const providers = [
  KEYCLOAK_ID && KEYCLOAK_SECRET && KEYCLOAK_ISSUER
    ? ADFS({
        wellKnown: `${KEYCLOAK_ISSUER}/.well-known/openid-configuration`,
        clientId: KEYCLOAK_ID,
        clientSecret: KEYCLOAK_SECRET,
        authorizeUrl: `${KEYCLOAK_ISSUER}/protocol/openid-connect/auth`,
        issuer: KEYCLOAK_ISSUER,
        token: `${KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
        userinfo: `${KEYCLOAK_ISSUER}/protocol/openid-connect/userinfo`,
        checks: ["pkce", "state"],
        client: {
          token_endpoint_auth_method: "none",
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
      console.log("Session:", session);
      console.log("Token:", token);

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
