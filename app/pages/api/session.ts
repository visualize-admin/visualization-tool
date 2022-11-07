import { unstable_getServerSession } from "next-auth";

import { nextAuthOptions } from "@/pages/api/auth/[...nextauth]";

export const getServerSideSession = (
  req: Parameters<typeof unstable_getServerSession>[0],
  res: Parameters<typeof unstable_getServerSession>[1]
) => {
  return unstable_getServerSession(req, res, nextAuthOptions);
};
