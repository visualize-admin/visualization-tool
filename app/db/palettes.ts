import { Palette, PALETTE_TYPE } from "@prisma/client";

import { CreateCustomColorPalette } from "@/utils/chart-config/api";

import { default as prisma } from "./client";

export const createPaletteForUser = async (
  data: CreateCustomColorPalette & { user_id?: number }
): Promise<Palette> => {
  return prisma.palette.create({
    data: {
      name: data.name,
      type: data.type as PALETTE_TYPE,
      colors: data.colors,
      user_id: data.user_id,
      updated_at: new Date(),
    },
  });
};
