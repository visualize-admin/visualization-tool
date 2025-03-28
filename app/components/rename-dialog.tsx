import { t, Trans } from "@lingui/macro";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  TextField,
  Typography,
  useEventCallback,
} from "@mui/material";
import { FormEvent } from "react";

import { ParsedConfig } from "@/db/config";
import { useUserConfigs } from "@/domain/user-configs";
import { Locale } from "@/locales/locales";
import { updateConfig } from "@/utils/chart-config/api";
import { useMutate } from "@/utils/use-fetch-data";

export const RenameDialog = ({
  config,
  locale,
  onClose,
  userId,
  ...props
}: {
  config: ParsedConfig;
  locale: Locale;
  onClose: () => void;
  userId: number;
} & Omit<DialogProps, "onClose">) => {
  const { invalidate: invalidateUserConfigs } = useUserConfigs();
  const updateConfigMut = useMutate(updateConfig);
  const isSingleChart = config.data.chartConfigs.length === 1;
  const handleRename = useEventCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault();

      const formData = Object.fromEntries(
        new FormData(ev.currentTarget).entries()
      ) as Record<Locale, string>;

      if (isSingleChart) {
        const chartConfig = config.data.chartConfigs[0];
        await updateConfigMut.mutate({
          key: config.key,
          data: {
            ...config.data,
            chartConfigs: [
              {
                ...chartConfig,
                meta: {
                  ...chartConfig.meta,
                  title: formData ?? chartConfig.meta.title,
                },
              },
            ],
          },
        });
      } else {
        const layout = config.data.layout;
        await updateConfigMut.mutate({
          key: config.key,
          data: {
            ...config.data,
            layout: {
              ...layout,
              meta: {
                ...layout.meta,
                title: formData ?? layout.meta.title,
              },
            },
          },
        });
      }

      invalidateUserConfigs();
      onClose?.();
    }
  );

  const meta = isSingleChart
    ? config.data.chartConfigs[0].meta
    : config.data.layout.meta;

  return (
    <Dialog {...props} fullWidth>
      <form style={{ display: "contents" }} onSubmit={handleRename}>
        <DialogTitle>
          <Trans id="profile.chart.rename-dialog.title">
            Rename the visualization
          </Trans>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            <Trans id="profile.chart.rename-dialog.description">
              Enhance chart clarity with a clear title; a good title helps
              understanding chart content.
            </Trans>
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              mt: 3,
            }}
          >
            <TextField
              name="de"
              label={t({ id: "controls.language.german" })}
              defaultValue={meta.title.de}
            />
            <TextField
              name="fr"
              label={t({ id: "controls.language.french" })}
              defaultValue={meta.title.fr}
            />
            <TextField
              name="it"
              label={t({ id: "controls.language.italian" })}
              defaultValue={meta.title.it}
            />
            <TextField
              name="en"
              label={t({ id: "controls.language.english" })}
              defaultValue={meta.title.en}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ pb: 6, pr: 6 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton
            sx={{ minWidth: "auto" }}
            loading={updateConfigMut.status === "fetching"}
            variant="contained"
            color="blue"
            type="submit"
          >
            OK
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
