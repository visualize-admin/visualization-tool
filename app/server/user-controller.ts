import { getServerSession } from "next-auth";

import { createPaletteForUser } from "@/db/palettes";
import { nextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { controller } from "@/server/nextkit";
import { CreateCustomColorPalette } from "@/utils/chart-config/api";

const UserController = controller({
  createPalette: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const userId = session?.user?.id;
    const { data }: { data: CreateCustomColorPalette } = req.body;

    return await createPaletteForUser({
      ...data,
      user_id: userId,
    });
  },
});

export default UserController;
