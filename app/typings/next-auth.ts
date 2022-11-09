/* eslint-disable */
// @ts-ignore It's necessary to import the module even if it's not used
import NextAuth from "next-auth";
/* eslint-enable */

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id (from our database). */
      id: number;
      /** The user's id (comes from the "sub" property of the JWT token). */
      sub: string;
      /** The user's name (comes from the "sub" property of the JWT token). */
      name?: string | null;
    };
  }
}
