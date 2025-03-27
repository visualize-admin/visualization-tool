import { Button, Divider, Link, MenuItem, styled } from "@mui/material";
import NextLink from "next/link";
import { MouseEvent } from "react";

import ConfirmationDialog from "@/components/confirmation-dialog";
import useDisclosure from "@/components/use-disclosure";
import { Icon, IconName } from "@/icons";

const StyledMenuItem = styled(MenuItem)(({ theme, color }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  color:
    color === "blue" || color === "red"
      ? theme.palette[color].main
      : theme.palette.primary.main,
  whiteSpace: "normal",
})) as typeof MenuItem;
export type MenuActionProps = {
  disabled?: boolean;
  label: string | NonNullable<React.ReactNode>;
  trailingIconName?: IconName;
  leadingIconName?: IconName;
  priority?: number;
  stayOpen?: boolean;
  color?: "blue" | "red";
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
  const { disabled, label, trailingIconName, leadingIconName } = props;
  const {
    isOpen: isConfirmationOpen,
    open: openConfirmation,
    close: closeConfirmation,
  } = useDisclosure();

  const Wrapper = ({
    leadingIcon,
    trailingIcon,
    label,
    color = "blue",
    ...rest
  }: {
    leadingIcon?: IconName;
    trailingIcon?: IconName;
    label: string | NonNullable<React.ReactNode>;
    color?: MenuActionProps["color"];
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  }) => {
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      if (props.onClick) {
        if ("requireConfirmation" in props && props.requireConfirmation) {
          openConfirmation();
        } else {
          return props.onClick(e);
        }
      }
    };

    const forwardedProps =
      props.type === "button"
        ? {
            onClick: handleClick,
            ...rest,
          }
        : {
            href: props.href,
            target: props.target,
            rel: props.rel,
            ...rest,
          };

    if (props.as === "button") {
      return (
        <Button
          disabled={disabled}
          color={color}
          variant="contained"
          {...forwardedProps}
          sx={{ minHeight: 0 }}
        >
          {label}
        </Button>
      );
    }

    return (
      <>
        <StyledMenuItem
          color={color}
          disabled={disabled}
          component={props.type === "link" ? Link : "div"}
          {...forwardedProps}
          sx={{ minHeight: 0 }}
        >
          {leadingIcon && (
            <Icon
              size={16}
              name={leadingIcon}
              style={{ marginTop: "0.25rem" }}
            />
          )}
          {label}
          {trailingIcon && (
            <Icon
              size={16}
              name={trailingIcon}
              style={{ marginTop: "0.25rem", marginLeft: "auto" }}
            />
          )}
        </StyledMenuItem>
        <Divider sx={{ mx: 1, "&:last-of-type": { display: "none" } }} />
      </>
    );
  };

  return (
    <>
      {props.type === "link" ? (
        <NextLink href={props.href} passHref legacyBehavior>
          <Wrapper
            label={label}
            leadingIcon={leadingIconName}
            trailingIcon={trailingIconName}
            color={props.color}
          />
        </NextLink>
      ) : props.type === "button" ? (
        <Wrapper
          label={label}
          leadingIcon={leadingIconName}
          trailingIcon={trailingIconName}
          color={props.color}
        />
      ) : null}
      {props.type === "button" && props.requireConfirmation && (
        <ConfirmationDialog
          onClose={closeConfirmation}
          open={isConfirmationOpen}
          title={props.confirmationTitle}
          text={props.confirmationText}
          onClick={props.onClick}
          onSuccess={props.onSuccess}
        />
      )}
    </>
  );
};
