import { t } from "@lingui/macro";
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
      arrow
      title={t({
        id: "beta-tag.tooltip",
        message:
          "This feature is currently under development, you may encounter bugs and performance problems.",
      })}
    >
      <Tag type="dimension" {...tagProps}>
        Beta
      </Tag>
    </Tooltip>
  );
};
