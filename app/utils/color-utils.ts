export const getContrastingColor = (color: string): string => {
  if (!color) {
    return "#ffffff";
  }

  const hex = color.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance >= 0.5 ? "#000000" : "#ffffff";
};
