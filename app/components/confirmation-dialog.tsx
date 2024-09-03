import { t, Trans } from "@lingui/macro";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
} from "@mui/material";
import React, { useState } from "react";

const ConfirmationDialog = ({
  title,
  text,
  onClick,
  onSuccess,
  onConfirm,
  ...props
}: Omit<DialogProps, "onClose"> & {
  title?: string;
  text?: string;
  onSuccess?: () => Promise<unknown> | void;
  onConfirm?: () => Promise<unknown> | void;
  onClick: () => Promise<unknown> | void;
  onClose: NonNullable<DialogProps["onClose"]>;
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <Dialog
      maxWidth="xs"
      {...props}
    >
      <DialogTitle sx={{ typography: "h3" }}>
        {title ??
          t({
            id: "login.profile.chart.confirmation.default",
            message: "Are you sure you want to perform this action?",
          })}
      </DialogTitle>
      {text && (
        <DialogContent>
          <DialogContentText>{text}</DialogContentText>
        </DialogContent>
      )}
      <DialogActions
        sx={{
          "& > .MuiButton-root": {
            justifyContent: "center",
            pointerEvents: loading ? "none" : "auto",
          },
        }}
      >
        <Button
          variant="text"
          onClick={() => props.onClose({}, "escapeKeyDown")}
        >
          <Trans id="no">No</Trans>
        </Button>
        <Button
          variant="text"
          onClick={async (e) => {
            e.stopPropagation();
            setLoading(true);

            await onClick();
            await new Promise((r) => setTimeout(r, 100));

            props.onClose({}, "escapeKeyDown");
            onSuccess?.();
          }}
        >
          {loading ? <CircularProgress /> : <Trans id="yes">Yes</Trans>}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
