import { t, Trans } from "@lingui/macro";
import { LoadingButton, TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Divider,
  Tab,
  TextField,
  Typography,
  useEventCallback,
} from "@mui/material";
import { FormEvent, useState } from "react";

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
  const [renameIndex, setRenameIndex] = useState(0);

  const updateConfigMut = useMutate(updateConfig);

  const handleRename = useEventCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      const formData = Array.from(new FormData(ev.currentTarget)).reduce(
        (acc, [key, value]) => {
          const [_field, indexS, lang] = key.split(".");
          const index = Number(indexS);
          acc[index] = acc[index] || ({} as Record<string, string>);
          acc[index][lang as Locale] = `${value}`;
          return acc;
        },
        [] as Record<Locale, string>[]
      );
      ev.preventDefault();

      await updateConfigMut.mutate({
        key: config.key,
        user_id: userId,
        data: {
          ...config.data,
          chartConfigs: config.data.chartConfigs.map((x, i) => ({
            ...x,
            meta: {
              ...x.meta,
              title: formData[i],
            },
          })),
        },
      });

      invalidateUserConfigs();
      onClose?.();
    }
  );

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
          <TabContext value={`${renameIndex}`}>
            <TabList onChange={(_ev, newTab) => setRenameIndex(newTab)}>
              {config.data.chartConfigs.map((x, i) => {
                return (
                  <Tab
                    key={i}
                    value={`${i}`}
                    label={
                      <span>
                        {x.meta.title[locale] !== ""
                          ? x.meta.title[locale]
                          : t({ id: "annotation.add.title" })}
                      </span>
                    }
                  />
                );
              })}
            </TabList>
            <Divider sx={{ mb: "1rem" }} />
            {config.data.chartConfigs.map((x, i) => {
              return (
                <TabPanel
                  value={`${i}`}
                  key={i}
                  sx={{
                    gap: "1rem",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <TextField
                    name={`title.${i}.de`}
                    label={t({ id: "controls.language.german" })}
                    defaultValue={x.meta.title.de}
                  />
                  <TextField
                    name={`title.${i}.fr`}
                    label={t({ id: "controls.language.french" })}
                    defaultValue={x.meta.title.fr}
                  />
                  <TextField
                    name={`title.${i}.it`}
                    label={t({ id: "controls.language.italian" })}
                    defaultValue={x.meta.title.it}
                  />
                  <TextField
                    name={`title.${i}.en`}
                    label={t({ id: "controls.language.english" })}
                    defaultValue={x.meta.title.en}
                  />
                </TabPanel>
              );
            })}
          </TabContext>
        </DialogContent>
        <DialogActions sx={{ pb: 6, pr: 6 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton
            sx={{ minWidth: "auto" }}
            loading={updateConfigMut.status === "fetching"}
            variant="contained"
            color="primary"
            type="submit"
          >
            OK
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
