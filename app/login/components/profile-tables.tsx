import { t, Trans } from "@lingui/macro";
import { LoadingButton, TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Divider,
  Link,
  Skeleton,
  styled,
  Tab,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableHead,
  tableHeadClasses,
  TableRow,
  tableRowClasses,
  TextField,
  Typography,
  useEventCallback,
} from "@mui/material";
import { PUBLISHED_STATE } from "@prisma/client";
import sortBy from "lodash/sortBy";
import NextLink from "next/link";
import React, { FormEvent, useState } from "react";

import useDisclosure from "@/components/use-disclosure";
import { ParsedConfig } from "@/db/config";
import { sourceToLabel } from "@/domain/datasource";
import { truthy } from "@/domain/types";
import { useUserConfigs } from "@/domain/user-configs";
import { useDataCubesMetadataQuery } from "@/graphql/hooks";
import { Locale } from "@/locales/locales";
import { useRootStyles } from "@/login/utils";
import { useLocale } from "@/src";
import { removeConfig, updateConfig } from "@/utils/chart-config/api";
import { useMutate } from "@/utils/use-fetch-data";

import { ActionProps, RowActions } from "../../components/row-actions";

const PREVIEW_LIMIT = 3;

const SectionContent = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  const rootClasses = useRootStyles();
  return (
    <Box className={rootClasses.sectionContent}>
      <Typography variant="h3" sx={{ mb: 4 }}>
        {title}
      </Typography>

      {children}
    </Box>
  );
};

type ProfileVisualizationsTableProps = {
  title: string;
  userId: number;
  userConfigs: ParsedConfig[];
  preview?: boolean;
  onShowAll?: () => void;
};

const StyledTable = styled(Table)(({ theme }) => ({
  [`& .${tableRowClasses.root}`]: {
    verticalAlign: "middle",
    height: 56,
    [`& > .${tableCellClasses.root}`]: {
      borderBottomColor: theme.palette.divider,
    },
  },
  [`& .${tableHeadClasses.root} .${tableCellClasses.root}`]: {
    color: theme.palette.grey[600],
  },
}));

export const ProfileVisualizationsTable = (
  props: ProfileVisualizationsTableProps
) => {
  const { title, userId, userConfigs, preview, onShowAll } = props;

  return (
    <SectionContent title={title}>
      {userConfigs.length > 0 ? (
        <>
          <StyledTable>
            <TableHead
              sx={{
                "& > .MuiTableCell-root": {
                  borderBottomColor: "divider",
                  color: "secondary.main",
                },
              }}
            >
              <TableRow sx={{}}>
                <TableCell>
                  <Trans id="login.profile.my-visualizations.chart-type">
                    Type
                  </Trans>
                </TableCell>
                <TableCell>
                  <Trans id="login.profile.my-visualizations.chart-name">
                    Name
                  </Trans>
                </TableCell>
                <TableCell>
                  <Trans id="login.profile.my-visualizations.dataset-name">
                    Dataset
                  </Trans>
                </TableCell>
                <TableCell>
                  <Trans id="login.profile.my-visualizations.chart-updated-date">
                    Last edit
                  </Trans>
                </TableCell>
                <TableCell>
                  <Trans id="login.profile.my-visualizations.chart-actions">
                    Actions
                  </Trans>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userConfigs
                .slice(0, preview ? PREVIEW_LIMIT : undefined)
                .map((config) => (
                  <ProfileVisualizationsRow
                    key={config.key}
                    userId={userId}
                    config={config}
                  />
                ))}
            </TableBody>
          </StyledTable>
          {preview && (
            <Button
              variant="text"
              color="primary"
              size="small"
              onClick={onShowAll}
              sx={{ ml: 1, mt: 2 }}
            >
              <Typography variant="body2">
                <Trans id="show.all">Show all</Trans>
              </Typography>
            </Button>
          )}
        </>
      ) : (
        <Typography variant="body1">
          <Trans id="login.no-charts">No charts yet</Trans>,{" "}
          <NextLink href="/browse" legacyBehavior>
            <Trans id="login.create-chart">create one</Trans>
          </NextLink>
          .
        </Typography>
      )}
    </SectionContent>
  );
};

type ProfileVisualizationsRowProps = {
  userId: number;
  config: ParsedConfig;
};

const RenameDialog = ({
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

const ProfileVisualizationsRow = (props: ProfileVisualizationsRowProps) => {
  const { userId, config } = props;
  const { dataSource } = config.data;
  const dataSets = Array.from(
    new Set(config.data.chartConfigs.flatMap((d) => d.cubes.map((d) => d.iri)))
  );
  const dataSet = dataSets.length === 1 ? dataSets[0] : null;
  const locale = useLocale();
  const [{ data, fetching }] = useDataCubesMetadataQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: [{ iri: dataSet! }],
    },
    pause: !dataSet,
  });

  const { invalidate: invalidateUserConfigs } = useUserConfigs();

  const removeConfigMut = useMutate(removeConfig);
  const updateConfigMut = useMutate(updateConfig);

  const {
    isOpen: isRenameOpen,
    open: openRename,
    close: closeRename,
  } = useDisclosure();

  const actions = React.useMemo(() => {
    const actions: ActionProps[] = [
      {
        type: "link",
        href: `/v/${config.key}`,
        label: t({ id: "login.chart.view", message: "View" }),
        iconName: "eye",
        priority:
          config.published_state === PUBLISHED_STATE.PUBLISHED ? 0 : undefined,
      },
      {
        type: "link",
        href: `/create/new?copy=${config.key}`,
        label: t({ id: "login.chart.copy", message: "Copy" }),
        iconName: "copy",
      },
      {
        type: "link",
        href: `/create/new?edit=${config.key}`,
        label: t({ id: "login.chart.edit", message: "Edit" }),
        iconName: "edit",
        priority:
          config.published_state === PUBLISHED_STATE.DRAFT ? 0 : undefined,
      },
      {
        type: "link",
        href: `/v/${config.key}`,
        label: t({ id: "login.chart.share", message: "Share" }),
        iconName: "linkExternal",
      },
      config.published_state === PUBLISHED_STATE.PUBLISHED
        ? {
            type: "button",
            label: t({
              id: "login.chart.actions.unpublish",
              message: "Unpublish",
            }),
            iconName: (updateConfigMut.status === "fetching"
              ? "loading"
              : "unpublish") as ActionProps["iconName"],

            onClick: async () => {
              await updateConfigMut.mutate({
                key: config.key,
                user_id: userId,
                data: {
                  ...config.data,
                  state: "PUBLISHING",
                },
                published_state: PUBLISHED_STATE.DRAFT,
              });
              invalidateUserConfigs();
            },
            onSuccess: () => {
              invalidateUserConfigs();
            },
          }
        : null,
      {
        type: "button",
        label: t({ id: "login.chart.rename", message: "Rename" }),
        iconName: "text",
        onClick: () => {
          openRename();
        },
      },
      {
        type: "button",
        label: t({ id: "login.chart.delete", message: "Delete" }),
        color: "error",
        iconName: removeConfigMut.status === "fetching" ? "loading" : "trash",
        requireConfirmation: true,
        confirmationTitle: t({
          id: "login.chart.delete.confirmation",
          message: "Are you sure you want to delete this chart?",
        }),
        confirmationText: t({
          id: "login.profile.chart.delete.warning",
          message:
            "Keep in mind that removing this visualization will affect all the places where it might be already embedded!",
        }),
        onClick: () => {
          return removeConfigMut.mutate({ key: config.key });
        },
        onSuccess: () => {
          invalidateUserConfigs();
        },
      },
    ].filter(truthy);

    return sortBy(actions, (x) => x.priority);
  }, [
    config.data,
    config.key,
    config.published_state,
    invalidateUserConfigs,
    openRename,
    removeConfigMut,
    updateConfigMut,
    userId,
  ]);

  const chartTitle = React.useMemo(() => {
    const title = config.data.chartConfigs
      .map((d) => d.meta.title[locale])
      .filter(truthy)
      .join(", ");

    return title
      ? title
      : t({ id: "annotation.add.title", message: "[ No Title ]" });
  }, [config.data.chartConfigs, locale]);

  return (
    <TableRow>
      <TableCell width="10%">
        <Typography variant="body2">
          {config.data.chartConfigs.length > 1 ? "multi" : "single"}
        </Typography>
      </TableCell>
      <TableCell width="30%">
        <NextLink href={`/v/${config.key}`} passHref legacyBehavior>
          <Link color="primary">
            <Typography variant="body2" noWrap>
              {chartTitle}
            </Typography>
          </Link>
        </NextLink>
      </TableCell>
      <TableCell width="30%">
        {fetching ? (
          <Skeleton width="50%" height={32} />
        ) : dataSet ? (
          <NextLink
            href={`/browse?dataset=${dataSet}&dataSource=${sourceToLabel(
              dataSource
            )}`}
            passHref
            legacyBehavior
          >
            <Link color="primary">
              <Typography variant="body2" noWrap>
                {data?.dataCubesMetadata[0]?.title ?? ""}
              </Typography>
            </Link>
          </NextLink>
        ) : (
          <Typography variant="body2" noWrap>
            {t({
              id: "login.profile.my-visualizations.multiple-datasets",
              message: "Multiple datasets",
            })}
          </Typography>
        )}
      </TableCell>
      <TableCell width="10%">
        <Typography width="auto" variant="body2">
          {config.updated_at.toLocaleDateString("de")}
        </Typography>
      </TableCell>
      <TableCell width="20%" align="right">
        <RowActions actions={actions} />
        <RenameDialog
          config={config}
          open={isRenameOpen}
          onClose={closeRename}
          locale={locale}
          userId={userId}
        />
      </TableCell>
    </TableRow>
  );
};
