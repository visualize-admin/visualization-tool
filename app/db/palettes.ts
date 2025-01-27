import {
  convertDBTypeToPaletteType,
  convertPaletteTypeToDBType,
  CustomPaletteType,
} from "@/config-types";
import {
  CreateCustomColorPalette,
  UpdateCustomColorPalette,
} from "@/utils/chart-config/api";

import { default as prisma } from "./client";

export const createPaletteForUser = async (
  data: CreateCustomColorPalette & { user_id?: number }
) => {
  await prisma.palette.create({
    data: {
      name: data.name,
      type: convertPaletteTypeToDBType(data.type),
      colors: data.colors,
      user_id: data.user_id,
      updated_at: new Date(),
    },
  });
};

export const getPalettesForUser = async (
  user_id: number
): Promise<CustomPaletteType[]> => {
  const palettes = await prisma.palette.findMany({
    where: {
      user_id,
    },
  });

  return palettes.map((palette) => {
    return {
      paletteId: palette.paletteId,
      name: palette.name,
      colors: palette.colors,
      type: convertDBTypeToPaletteType(palette.type),
    };
  });
};

export const deletePaletteForUser = async (paletteId: string) => {
  return await prisma.palette.delete({
    where: {
      paletteId,
    },
  });
};

export const updatePaletteForUser = async (data: UpdateCustomColorPalette) => {
  const type = data.type && convertPaletteTypeToDBType(data.type);

  await prisma.palette.update({
    where: {
      paletteId: data.paletteId,
    },
    data: {
      name: data.name,
      colors: data.colors,
      type,
      updated_at: new Date(),
    },
  });
};
