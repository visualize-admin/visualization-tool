import { ComponentProps } from "react";

import { Icons, IconName } from "./components";

export { Icons } from "./components";

export type { IconName } from "./components";

export const Icon = ({
  size = 24,
  color,
  name,
  ...props
}: {
  size?: number;
  color?: string;
  name: IconName;
} & ComponentProps<"svg">) => {
  const IconComponent = Icons[name];

  if (!IconComponent) {
    console.warn("No icon", name);
    return null;
  }

  return <IconComponent width={size} height={size} color={color} {...props} />;
};
