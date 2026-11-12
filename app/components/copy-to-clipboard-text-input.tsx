import { t } from "@lingui/macro";
import { Button, Input, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import * as clipboard from "clipboard-polyfill/text";
import { MouseEvent as ReactMouseEvent, ReactNode, useState } from "react";

import { Flex } from "@/components/flex";
import { LiveRegion } from "@/components/live-region";
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

const useCopyToClipboardTextInputStyles = makeStyles((theme: Theme) => ({
  button: {
    backgroundColor: theme.palette.cobalt[100],
    position: "relative",
    width: 42,
    minWidth: 42,
    cursor: "pointer",

    "&:hover": {
      backgroundColor: theme.palette.cobalt[200],
    },

    "&:active": {
      backgroundColor: theme.palette.cobalt[300],
    },
  },
}));

const ActionTooltip = ({ children }: { children: ReactNode }) => {
  const classes = useActionTooltipStyles();
  return <div className={classes.actionTooltip}>{children}</div>;
};

export const CopyToClipboardTextInput = ({
  content,
  label,
}: {
  content: string;
  label: string;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const copiedMessage = t({ id: "button.hint.copied", message: "copied!" });
  const hideTooltip = () => {
    setShowTooltip(false);
    setCopied(false);
  };
  const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    clipboard.writeText(content);
    setCopied(true);
    setAnnouncement(copiedMessage);
  };
  const classes = useCopyToClipboardTextInputStyles();

  return (
    <Flex sx={{ gap: 1 }}>
      <Input
        size="sm"
        value={content}
        readOnly
        inputProps={{ "aria-label": label }}
        sx={{
          "& .MuiInput-input": {
            pr: 0,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          },
        }}
      />
      <Button
        variant="text"
        aria-label={t({ id: "button.copy", message: `Copy: ${label}` })}
        onMouseOver={() => setShowTooltip(true)}
        onFocus={() => setShowTooltip(true)}
        onMouseLeave={hideTooltip}
        onBlur={hideTooltip}
        onClick={handleClick}
        className={classes.button}
      >
        <Icon name="copy" size={20} />
        {showTooltip && (
          <ActionTooltip>
            {copied
              ? copiedMessage
              : t({
                  id: "button.hint.click.to.copy",
                  message: "click to copy",
                })}
          </ActionTooltip>
        )}
      </Button>
      <LiveRegion message={announcement} delay={0} />
    </Flex>
  );
};
