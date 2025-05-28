import NextAuth, { NextAuthOptions, User } from "next-auth";
import CredentialsProviders from "next-auth/providers/credentials";

import { ADFS } from "@/auth-providers/adfs";
import { prisma } from "@/db/client";
import { ensureUserFromSub } from "@/db/user";
import { ADFS_ID, ADFS_ISSUER } from "@/domain/env";
import { truthy } from "@/domain/types";

import type { NextApiRequest, NextApiResponse } from "next";

export interface ExtendedUser extends User {
  sub: string | null;
}

const providers = [
  ADFS_ID && ADFS_ISSUER
    ? ADFS({
        wellKnown: `${ADFS_ISSUER}/.well-known/openid-configuration`,
        clientId: ADFS_ID,
        clientSecret: "", // PKCE does not require a client secret
        authorizeUrl: `${ADFS_ISSUER}/protocol/openid-connect/auth`,
        issuer: ADFS_ISSUER,
        token: `${ADFS_ISSUER}/protocol/openid-connect/token`,
        userinfo: `${ADFS_ISSUER}/protocol/openid-connect/userinfo`,
        checks: ["pkce", "state"],
        client: {
          token_endpoint_auth_method: "none",
        },
      })
    : null,
  CredentialsProviders({
    name: "credentials",
    credentials: {},
    authorize: async (): Promise<ExtendedUser | null> => {
      let user = null;
      user = await prisma.user.findFirst({
        where: {
          sub: "test-user",
        },
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: "TEST USER",
            sub: "test-user",
          },
        });
      }

      return Promise.resolve({
        ...user,
        id: String(user.id),
      });
    },
  }),
].filter(truthy);

export const nextAuthOptions = {
  providers,
  callbacks: {
    /** Necessary otherwise we cannot sign out */
    jwt: async ({ token }) => {
      return token;
    },
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith("/")) {
        if (url === "/api/auth/signout") {
          return `${ADFS_ISSUER}/protocol/openid-connect/logout?redirect_uri=${baseUrl}`;
        }
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
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
  },
  debug: false,
} as NextAuthOptions;

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  try {
    await NextAuth(req, res, nextAuthOptions);
  } catch (e) {
    console.error(e);
    throw e;
  }
}
