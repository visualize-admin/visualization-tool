import { t } from "@lingui/macro";
import { IconButton, useEventCallback } from "@mui/material";
import { useState } from "react";

import { ArrowMenuTopBottom } from "@/components/arrow-menu";
import { MenuActionItem } from "@/components/menu-action-item";
import {
  isLayouting,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import SvgIcMore from "@/icons/components/IcMore";
import { createId } from "@/utils/create-id";
import { DISABLE_SCREENSHOT_ATTR } from "@/utils/use-screenshot";

export const BlockMoreButton = ({ blockKey }: { blockKey: string }) => {
  const [state, dispatch] = useConfiguratorState(isLayouting);
  const { layout } = state;
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const handleClose = useEventCallback(() => setAnchor(null));
  const handleDuplicate = useEventCallback(() => {
    const key = createId();
    const block = layout.blocks.find((b) => b.key === blockKey);

    if (!block) {
      return;
    }

    dispatch({
      type: "LAYOUT_CHANGED",
      value: {
        ...layout,
        blocks: [
          ...layout.blocks,
          {
            ...block,
            key,
          },
        ],
      },
    });
    dispatch({
      type: "LAYOUT_ACTIVE_FIELD_CHANGED",
      value: key,
    });
  });
  const handleRemove = useEventCallback(() => {
    dispatch({
      type: "LAYOUT_CHANGED",
      value: {
        ...layout,
        blocks: layout.blocks.filter((b) => b.key !== blockKey),
      },
    });

    if (layout.activeField === blockKey) {
      dispatch({
        type: "LAYOUT_ACTIVE_FIELD_CHANGED",
        value: undefined,
      });
    }
  });

  return (
    <>
      <IconButton
        color="secondary"
        onClick={(e) => {
          e.stopPropagation();
          setAnchor(e.currentTarget);
        }}
        sx={{ height: "fit-content" }}
        {...DISABLE_SCREENSHOT_ATTR}
        data-testid="block-more-button"
      >
        <SvgIcMore />
      </IconButton>
      <ArrowMenuTopBottom
        open={!!anchor}
        anchorEl={anchor}
        onClose={(e) => {
          (e as Event).stopPropagation();
          handleClose();
        }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <div>
          <MenuActionItem
            type="button"
            as="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicate();
              handleClose();
            }}
            leadingIconName="duplicate"
            label={t({ id: "block-controls.duplicate", message: "Duplicate" })}
          />
          <MenuActionItem
            type="button"
            as="menuitem"
            color="red"
            requireConfirmation
            confirmationTitle={t({
              id: "block-controls.delete.title",
              message: "Delete block?",
            })}
            confirmationText={t({
              id: "block-controls.delete.confirmation",
              message: "Are you sure you want to delete this block?",
            })}
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
              handleClose();
            }}
            leadingIconName="trash"
            label={t({ id: "block-controls.delete", message: "Delete" })}
          />
        </div>
      </ArrowMenuTopBottom>
    </>
  );
};
