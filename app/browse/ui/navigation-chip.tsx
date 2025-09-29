import { ReactNode } from "react";

import { Flex } from "@/components/flex";

export const NavigationChip = ({
  children,
  backgroundColor,
}: {
  children: ReactNode;
  backgroundColor: string;
}) => {
  return (
    <Flex
      data-testid="navChip"
      justifyContent="center"
      alignItems="center"
      minWidth={32}
      height={24}
      borderRadius={9999}
      typography="caption"
      bgcolor={backgroundColor}
    >
      {children}
    </Flex>
  );
};
