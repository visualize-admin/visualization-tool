export type Timing = {
  start: number;
  end: number;
};

export type TimingCallback = ({ start, end }: Timing, ...args: any[]) => void;

export const timed = <T extends (...args: any[]) => any>(
  fn: T,
  cb: TimingCallback
) => {
  const wrapped = async function (...args: Parameters<T>) {
    const start = Date.now();
    // @ts-ignore I do not know why TS complains here
    const self = this;
    const res = await fn.apply(self, args);
    const end = Date.now();
    cb({ start, end } as Timing, ...args);
    return res;
  } as unknown as T;
  return wrapped;
};
