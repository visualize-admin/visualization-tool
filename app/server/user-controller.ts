import { getServerSession } from "next-auth";

import {
  createPaletteForUser,
  deletePaletteForUser,
  getPalettesForUser,
  updatePaletteForUser,
} from "@/db/palettes";
import { nextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { controller } from "@/server/nextkit";
import {
  CreateCustomColorPalette,
  DeleteCustomColorPalette,
  UpdateCustomColorPalette,
} from "@/utils/chart-config/api";

export const UserController = controller({
  createPalette: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const userId = session?.user?.id;
    const data: CreateCustomColorPalette = req.body;

    return await createPaletteForUser({
      ...data,
      user_id: userId,
    });
  },
  getPalettes: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const userId = session?.user?.id;

    return await getPalettesForUser(userId);
  },
  deletePalette: async ({ req }) => {
    const data: DeleteCustomColorPalette = req.body;
    const paletteId = data.paletteId;

    await deletePaletteForUser(paletteId);
  },

  updatePalette: async ({ req }) => {
    const data: UpdateCustomColorPalette = req.body;

    await updatePaletteForUser(data);
  },
});
