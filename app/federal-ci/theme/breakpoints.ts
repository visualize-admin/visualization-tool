export const breakpoints = {
  xxs: 0,
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1544,
  xxxl: 1920,
  // Can't use module augmentation here because it would be exported
  // and potentially clash with MUI themes with other breakpoints.
} as const;
