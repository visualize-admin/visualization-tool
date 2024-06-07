const TICK_MIN_HEIGHT = 50;

export const getTickNumber = (height: number) => {
  return Math.min(height / TICK_MIN_HEIGHT, 4);
};
