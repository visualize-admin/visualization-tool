export type Timing = {
  start: number;
  end: number;
};

export const timed = <T extends unknown[]>(
  fn: Function,
  cb: ({ start, end }: Timing, ...args: T) => void
) => {
  const wrapped: Function = async function (...args: T) {
    const start = Date.now();
    const res = await fn(...args);
    const end = Date.now();
    cb({ start, end } as Timing, ...args);
    return res;
  };
  return wrapped;
};
