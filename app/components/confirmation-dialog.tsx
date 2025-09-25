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
import { MouseEvent, useState } from "react";

import { sleep } from "@/utils/sleep";

export const ConfirmationDialog = ({
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
  onClick: (e: MouseEvent<HTMLElement>) => Promise<unknown> | void;
  onClose: NonNullable<DialogProps["onClose"]>;
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <Dialog
      maxWidth="xs"
      PaperProps={{ sx: { gap: 4, width: "100%", p: 6 } }}
      {...props}
    >
      <DialogTitle sx={{ p: 0, typography: "h4" }}>
        {title ||
          t({
            id: "login.profile.chart.confirmation.default",
            message: "Are you sure you want to perform this action?",
          })}
      </DialogTitle>
      {text && (
        <DialogContent sx={{ p: 0 }}>
          <DialogContentText sx={{ typography: "body2" }}>
            {text}
          </DialogContentText>
        </DialogContent>
      )}
      <DialogActions
        sx={{
          p: 0,
          "& > .MuiButton-root": {
            justifyContent: "center",
            minWidth: 76,
            minHeight: "fit-content",
            pointerEvents: loading ? "none" : "auto",
          },
        }}
      >
        <Button
          variant="outlined"
          onClick={() => props.onClose({}, "escapeKeyDown")}
        >
          <Trans id="no">No</Trans>
        </Button>
        <Button
          variant="contained"
          onClick={async (e) => {
            e.stopPropagation();
            setLoading(true);

            await onClick(e);
            await sleep(100);

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
