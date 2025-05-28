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

    if (!userId) {
      throw new Error(
        "You must be logged in to create a custom color palette!"
      );
    }

    const data: CreateCustomColorPalette = req.body;

    return await createPaletteForUser({
      ...data,
      user_id: userId,
    });
  },
  getPalettes: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error(
        "You must be logged in to view your custom color palettes!"
      );
    }

    return await getPalettesForUser({ user_id: userId });
  },
  deletePalette: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error(
        "You must be logged in to delete a custom color palette!"
      );
    }

    const data: DeleteCustomColorPalette = req.body;

    await deletePaletteForUser(paletteId);
  },

  updatePalette: async ({ req, res }) => {
    const session = await getServerSession(req, res, nextAuthOptions);
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error(
        "You must be logged in to update a custom color palette!"
      );
    }

    const data: UpdateCustomColorPalette = req.body;

    await updatePaletteForUser(data);
  },
});
