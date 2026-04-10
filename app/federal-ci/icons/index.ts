export type IconProps = {
  className?: string;
  size?: number;
};

export const getCommonIconProps = (props: IconProps) => {
  const { className, size = 24 } = props;

  return {
    className,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      minWidth: size,
      minHeight: size,
    },
  };
};

export * from "./arrow-left";
export * from "./arrow-right";
export * from "./close";
export * from "./download";
export * from "./envelope";
export * from "./external";
export * from "./facebook";
export * from "./instagram";
export * from "./linkedin";
export * from "./menu";
export * from "./twitter";
export * from "./youtube";
