import { t } from "@lingui/core/macro";

import { Icon } from "@/icons";

export const MoveDragButton = () => {
  return (
    <span
      title={t({ id: "Drag filters to reorganize" })}
      style={{ cursor: "move" }}
    >
      <Icon name="dragIndicator" />
    </span>
  );
};
