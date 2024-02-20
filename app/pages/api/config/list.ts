import { getServerSession } from "next-auth";
import SuperJSON from "superjson";

import { nextAuthOptions } from "@/pages/api/auth/[...nextauth]";

import { getUserConfigs } from "../../../db/config";
import { api } from "../../../server/nextkit";

/**
 * Endpoint to read configuration from
 */
const route = api({
  GET: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    return SuperJSON.serialize(
      session?.user.id ? await getUserConfigs(session?.user.id) : []
    );
  },
});

export default route;
