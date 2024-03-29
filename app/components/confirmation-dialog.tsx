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
import React from "react";

const ConfirmationDialog = ({
  title,
  text,
  onClick,
  onSuccess,
  onConfirm,
  ...props
}: DialogProps & {
  title?: string;
  text?: string;
  onSuccess?: () => Promise<unknown> | void;
  onConfirm?: () => Promise<unknown> | void;
  onClick: () => Promise<unknown> | void;
}) => {
  const [loading, setLoading] = React.useState(false);

  return (
    <Dialog
      // To prevent the click away listener from closing the dialog.
      onClick={(e) => e.stopPropagation()}
      onClose={close}
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
        <Button variant="text" onClick={close}>
          <Trans id="no">No</Trans>
        </Button>
        <Button
          variant="text"
          onClick={async (e) => {
            e.stopPropagation();
            setLoading(true);

            await onClick();
            await new Promise((r) => setTimeout(r, 100));

            props.onClose?.({}, "escapeKeyDown");
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
