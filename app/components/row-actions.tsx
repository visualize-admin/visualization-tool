import { Box, Button, IconButton, Link, MenuItem, styled } from "@mui/material";
import NextLink from "next/link";
import React from "react";

import ConfirmationDialog from "@/components/confirmation-dialog";
import useDisclosure from "@/components/use-disclosure";
import { Icon, IconName } from "@/icons";

import { ArrowMenu } from "./arrow-menu";

export type ActionProps = {
  label: string;
  iconName: IconName;
  priority?: number;
  color?: "primary" | "error";
} & (
  | {
      type: "link";
      href: string;
    }
  | {
      type: "button";
      onClick: () => Promise<void> | void;
      requireConfirmation?: false | undefined;
    }
  | {
      type: "button";
      onClick: () => Promise<void> | void;
      requireConfirmation: true;
      confirmationTitle?: string;
      confirmationText?: string;
      onDialogClose?: () => void;
      onSuccess?: () => void;
    }
);

type ActionsProps = {
  actions: ActionProps[];
};

const StyledMenuItem = styled(MenuItem)(({ theme, color }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  color:
    color === "primary" || color === "error"
      ? theme.palette[color].main
      : theme.palette.primary.main,
})) as typeof MenuItem;

export const Action = (props: ActionProps & { as: "menuitem" | "button" }) => {
  const { label, iconName } = props;
  const { isOpen: isConfirmationOpen } = useDisclosure();

  const Wrapper = ({
    icon,
    label,
    color = "primary",
  }: {
    icon: IconName;
    label: string;
    color?: ActionProps["color"];
  }) => {
    const forwardedProps =
      props.type === "button"
        ? {
            onClick: props.onClick,
          }
        : {
            href: props.href,
          };
    if (props.as === "button") {
      return (
        <Button
          size="xsmall"
          component={props.type === "link" ? Link : "button"}
          color={color}
          variant="contained"
          {...forwardedProps}
        >
          {label}
        </Button>
      );
    } else {
      return (
        <StyledMenuItem
          color={color}
          component={props.type === "link" ? Link : "div"}
          {...forwardedProps}
        >
          <Icon size={16} name={icon} />
          {label}
        </StyledMenuItem>
      );
    }
  };
  return (
    <>
      {props.type === "link" ? (
        <NextLink href={props.href} passHref legacyBehavior>
          <Wrapper label={label} icon={iconName} color={props.color} />
        </NextLink>
      ) : props.type === "button" ? (
        <Wrapper label={label} icon={iconName} color={props.color} />
      ) : null}
      {props.type === "button" && props.requireConfirmation && (
        <ConfirmationDialog
          onClose={close}
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

export const RowActions = (props: ActionsProps) => {
  const { actions } = props;
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const { isOpen, open, close } = useDisclosure();

  const [primaryAction, ...rest] = actions;

  return (
    <Box gap="0.5rem" display="flex" alignItems="center">
      <Action
        as="button"
        {...primaryAction}
        {...(primaryAction.type === "button" ? { onDialogClose: close } : {})}
      />
      <IconButton ref={buttonRef} onClick={isOpen ? close : open}>
        <Icon name="more" size={16} />
      </IconButton>
      <ArrowMenu
        onClose={close}
        open={isOpen}
        anchorEl={buttonRef.current}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
        sx={{}}
      >
        {rest.map((props, i) => (
          <Action
            as="menuitem"
            key={i}
            {...props}
            {...(props.type === "button" ? { onDialogClose: close } : {})}
          />
        ))}
      </ArrowMenu>
    </Box>
  );
};
