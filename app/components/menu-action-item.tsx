import { Button, Link, MenuItem, styled } from "@mui/material";
import NextLink from "next/link";

import ConfirmationDialog from "@/components/confirmation-dialog";
import useDisclosure from "@/components/use-disclosure";
import { Icon, IconName } from "@/icons";

const StyledMenuItem = styled(MenuItem)(({ theme, color }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  color:
    color === "primary" || color === "error"
      ? theme.palette[color].main
      : theme.palette.primary.main,
})) as typeof MenuItem;

export type MenuActionProps = {
  label: string | NonNullable<React.ReactNode>;
  iconName: IconName;
  priority?: number;
  stayOpen?: boolean;
  color?: "primary" | "error";
  onClick?: () => Promise<unknown> | void;
} & (
  | {
      type: "link";
      href: string;
    }
  | {
      type: "button";
      requireConfirmation?: false | undefined;
      onClick: () => Promise<unknown> | void;
    }
  | {
      type: "button";
      onClick: () => Promise<unknown> | void;
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
  const { label, iconName } = props;
  const {
    isOpen: isConfirmationOpen,
    open: openConfirmation,
    close: closeConfirmation,
  } = useDisclosure();

  const Wrapper = ({
    icon,
    label,
    color = "primary",
  }: {
    icon: IconName;
    label: string | NonNullable<React.ReactNode>;
    color?: MenuActionProps["color"];
  }) => {
    const handleClick = () => {
      if (props.onClick) {
        if ("requireConfirmation" in props && props.requireConfirmation) {
          openConfirmation();
        } else {
          return props.onClick();
        }
      }
    };
    const forwardedProps =
      props.type === "button"
        ? {
            onClick: handleClick,
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
