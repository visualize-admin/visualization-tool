import { IconButton } from "@mui/material";

import { Flex } from "@/components/flex";
import { MenuActionItem, MenuActionProps } from "@/components/menu-action-item";
import { useFlipMenu } from "@/components/use-flip-menu";
import { Icon } from "@/icons";

export const RowActions = ({ actions }: { actions: MenuActionProps[] }) => {
  const [primaryAction, ...otherActions] = actions;
  const {
    buttonRef,
    handleOpenElClick,
    handleClose,
    anchorEl,
    anchorOrigin,
    transformOrigin,
    Wrapper,
  } = useFlipMenu({ itemsCount: actions.length });
  const additionalProps =
    primaryAction.type === "button" ? { onDialogClose: handleClose } : {};

  return (
    <Flex gap="0.5rem" justifyContent="flex-end" alignItems="center">
      <MenuActionItem as="button" {...primaryAction} {...additionalProps} />
      <IconButton ref={buttonRef} onClick={handleOpenElClick}>
        <Icon name="more" size={16} />
      </IconButton>
      <Wrapper
        onClose={handleClose}
        open={!!anchorEl}
        anchorEl={anchorEl}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
      >
        {otherActions.map((actionProps, i) => (
          <MenuActionItem
            key={i}
            as="menuitem"
            {...actionProps}
            onClick={(e) => {
              if (!actionProps.stayOpen) {
                handleClose();
              }
              actionProps.onClick?.(e);
            }}
            {...additionalProps}
          />
        ))}
      </Wrapper>
    </Flex>
  );
};
