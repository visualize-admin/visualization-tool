import { Trans } from "@lingui/react";
import { Tooltip } from "@mui/material";
import { ComponentProps } from "react";

import Tag from "@/components/tag";

export const BetaTag = ({
  tagProps,
}: {
  tagProps?: Omit<ComponentProps<typeof Tag>, "type" | "children">;
}) => {
  return (
    <Tooltip
      title={
        <Trans id="beta-tag.tooltip">
          This feature is currently under development, you may encounter bugs
          and performance problems.
        </Trans>
      }
    >
      <Tag type="dimension" {...tagProps}>
        Beta
      </Tag>
    </Tooltip>
  );
};
