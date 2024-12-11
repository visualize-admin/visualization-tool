export const animationFrame = () => {
  return new Promise((resolve) => requestAnimationFrame(resolve));
};
