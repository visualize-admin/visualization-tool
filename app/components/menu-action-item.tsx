import {
  Button,
  Divider,
  Link,
  LinkProps,
  MenuItem,
  styled,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { forwardRef, MouseEvent, ReactNode } from "react";

import { useRequestConfirmation } from "@/components/action-menu";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { useDisclosure } from "@/components/use-disclosure";
import { Icon, IconName } from "@/icons";

const StyledMenuItem = styled(MenuItem)(({ theme, color }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  color: color === "red" ? theme.palette.red.main : theme.palette.text.primary,
  whiteSpace: "normal",
})) as typeof MenuItem;

const MENU_ITEM_SX = { display: "flex", alignItems: "center", minHeight: 0 };

export type MenuActionProps = {
  disabled?: boolean;
  label: string | NonNullable<ReactNode>;
  trailingIconName?: IconName;
  leadingIconName?: IconName;
  priority?: number;
  stayOpen?: boolean;
  color?: "red";
  "aria-haspopup"?: "menu";
  "aria-expanded"?: boolean;
  onClick?: (e: MouseEvent<HTMLElement>) => Promise<unknown> | void;
} & (
  | {
      type: "link";
      href: string;
      target?: string;
      rel?: string;
    }
  | {
      type: "button";
      requireConfirmation?: false | undefined;
      onClick: (e: MouseEvent<HTMLElement>) => Promise<unknown> | void;
    }
  | {
      type: "button";
      onClick: (e: MouseEvent<HTMLElement>) => Promise<unknown> | void;
      requireConfirmation: true;
      confirmationTitle?: string;
      confirmationText?: string;
      onDialogClose?: () => void;
      onSuccess?: () => void;
    }
);

export const MenuActionItem = (
  props: MenuActionProps & { as: "menuitem" | "button" }
) => {
  const requestConfirmation = useRequestConfirmation();
  const {
    isOpen: isConfirmationOpen,
    open: openConfirmation,
    close: closeConfirmation,
  } = useDisclosure();
  const confirmation =
    props.type === "button" && props.requireConfirmation
      ? {
          title: props.confirmationTitle,
          text: props.confirmationText,
          onClick: props.onClick,
          onSuccess: props.onSuccess,
        }
      : undefined;

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    if (props.type !== "button") {
      return;
    }

    if (!confirmation) {
      return props.onClick(e);
    }

    if (requestConfirmation) {
      requestConfirmation(confirmation);
    } else {
      openConfirmation();
    }
  };

  const linkProps =
    props.type === "link"
      ? { href: props.href, target: props.target, rel: props.rel }
      : undefined;

  return (
    <>
      {props.as === "button" ? (
        <Button
          disabled={props.disabled}
          variant="contained"
          size="sm"
          LinkComponent={NextLink}
          onClick={linkProps ? undefined : handleClick}
          {...linkProps}
          sx={{ minHeight: 0 }}
        >
          {props.label}
        </Button>
      ) : (
        <ActionMenuItem
          {...props}
          linkProps={linkProps}
          onClick={handleClick}
        />
      )}
      {confirmation && !requestConfirmation ? (
        <ConfirmationDialog
          {...confirmation}
          open={isConfirmationOpen}
          onClose={closeConfirmation}
        />
      ) : null}
    </>
  );
};

const ActionMenuItem = ({
  label,
  leadingIconName,
  trailingIconName,
  color,
  disabled,
  linkProps,
  onClick,
  "aria-haspopup": ariaHasPopup,
  "aria-expanded": ariaExpanded,
}: Pick<
  MenuActionProps,
  | "label"
  | "leadingIconName"
  | "trailingIconName"
  | "color"
  | "disabled"
  | "aria-haspopup"
  | "aria-expanded"
> & {
  linkProps?: { href: string; target?: string; rel?: string };
  onClick: (e: MouseEvent<HTMLElement>) => void;
}) => {
  const content = (
    <>
      {leadingIconName && <Icon name={leadingIconName} />}
      <Typography variant="body3">{label}</Typography>
      {trailingIconName && (
        <Icon name={trailingIconName} style={{ marginLeft: "auto" }} />
      )}
    </>
  );

  return (
    <>
      {linkProps ? (
        <StyledMenuItem
          component={MenuItemLink}
          disabled={disabled}
          color={color}
          sx={MENU_ITEM_SX}
          {...linkProps}
        >
          {content}
        </StyledMenuItem>
      ) : (
        <StyledMenuItem
          component="div"
          disabled={disabled}
          color={color}
          aria-haspopup={ariaHasPopup}
          aria-expanded={ariaExpanded}
          onClick={onClick}
          sx={MENU_ITEM_SX}
        >
          {content}
        </StyledMenuItem>
      )}
      <Divider
        sx={{
          mx: 4,
          my: "0 !important",

          "&:last-of-type": {
            display: "none",
          },
        }}
      />
    </>
  );
};

const MenuItemLink = forwardRef<HTMLAnchorElement, LinkProps<typeof NextLink>>(
  (props, ref) => <Link ref={ref} component={NextLink} {...props} />
);
