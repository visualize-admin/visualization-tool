import { Trans } from "@lingui/macro";
import { Button, Input, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import * as clipboard from "clipboard-polyfill/text";
import { MouseEvent as ReactMouseEvent, ReactNode, useState } from "react";

import Flex, { FlexProps } from "@/components/flex";
import { Icon } from "@/icons";

const useActionTooltipStyles = makeStyles((theme: Theme) => ({
  actionTooltip: {
    position: "absolute",
    bottom: "100%",
    left: "50%",
    transform: "translate3d(-50%, 0, 0)",

    backgroundColor: theme.palette.grey[700],
    borderRadius: 1.5,
    color: theme.palette.grey[100],

    fontSize: "0.625rem",
    textAlign: "center",
    whiteSpace: "nowrap",

    padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
    marginBottom: "calc(0.5rem + 2px)",

    zIndex: 13,
    pointerEvents: "none",
    filter: "0 3px 5px 0 rgba(0,0,0,0.90)",

    "&::after": {
      content: "''",
      position: "absolute",
      width: 0,
      height: 0,
      border: "0.5rem solid transparent",
      borderTopColor: theme.palette.grey[700],
      left: "50%",
      top: "100%",
      zIndex: -1,
      transform: "translateX(-50%)",
    },
  },
}));

export const useCopyToClipboardTextInputStyles = makeStyles((theme: Theme) => ({
  input: {
    color: theme.palette.grey[700],
    padding: `${theme.spacing(0)} ${theme.spacing(2)}`,
    flexGrow: 1,
    fontSize: "1rem",
    minWidth: 160,
    overflowX: "auto",
    borderTopLeftRadius: "default",
    borderBottomLeftRadius: "default",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: theme.palette.grey[500],
  },
  button: {
    color: theme.palette.grey[600],
    backgroundColor: theme.palette.grey[200],
    position: "relative",

    borderTopRightRadius: "default",
    borderBottomRightRadius: "default",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    width: 48,
    minWidth: 48,

    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: theme.palette.grey[500],
    borderLeft: "none",

    cursor: "pointer",

    "&:hover": {
      backgroundColor: theme.palette.grey[300],
      color: theme.palette.grey[700],
    },
    "&:active": {
      backgroundColor: theme.palette.grey[400],
      color: theme.palette.grey[800],
    },
    "&:disabled": {
      cursor: "initial",
      color: theme.palette.grey[300],
    },
  },
}));

export const ActionTooltip = ({ children }: { children: ReactNode }) => {
  const classes = useActionTooltipStyles();
  return <div className={classes.actionTooltip}>{children}</div>;
};

export const CopyToClipboardTextInput = ({
  content,
  ...flexProps
}: { content: string } & FlexProps) => {
  const [showTooltip, toggleTooltip] = useState(false);
  const [tooltipContent, updateTooltipContent] = useState(
    <Trans id="button.hint.click.to.copy">click to copy</Trans>
  );

  const handleMouseLeave = () => {
    toggleTooltip(false);
    updateTooltipContent(
      <Trans id="button.hint.click.to.copy">click to copy</Trans>
    );
  };
  const handleClick = (
    e: ReactMouseEvent<HTMLButtonElement, MouseEvent>,
    content: string
  ) => {
    e.preventDefault();
    clipboard.writeText(content);
  };
  const classes = useCopyToClipboardTextInputStyles();
  return (
    <Flex sx={{ alignItems: "stretch", height: 48 }} {...flexProps}>
      <Input
        className={classes.input}
        type="text"
        value={content}
        readOnly={true}
      ></Input>

      <Button
        variant="text"
        onMouseOver={() => toggleTooltip(true)}
        onMouseUp={() =>
          updateTooltipContent(<Trans id="button.hint.copied">copied!</Trans>)
        }
        onMouseLeave={handleMouseLeave}
        onClick={(e) => handleClick(e, content)}
        className={classes.button}
      >
        <Icon name="copy" size={16} />

        {showTooltip && <ActionTooltip>{tooltipContent}</ActionTooltip>}
      </Button>
    </Flex>
  );
};
