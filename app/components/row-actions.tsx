import { Box, IconButton } from "@mui/material";

import { MenuActionItem, MenuActionProps } from "@/components/menu-action-item";
import { useFlipMenu } from "@/components/use-flip-menu";
import { Icon } from "@/icons";

export const RowActions = (props: { actions: MenuActionProps[] }) => {
  const { actions } = props;
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
    <Box gap="0.5rem" display="flex" alignItems="center">
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
            onClick={() => {
              if (!actionProps.stayOpen) {
                handleClose();
              }
              actionProps.onClick?.();
            }}
            {...additionalProps}
          />
        ))}
      </Wrapper>
    </Box>
  );
};
