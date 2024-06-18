import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  Link,
  Skeleton,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableHead,
  tableHeadClasses,
  TableRow,
  tableRowClasses,
  Typography,
} from "@mui/material";
import { PUBLISHED_STATE } from "@prisma/client";
import sortBy from "lodash/sortBy";
import NextLink from "next/link";
import React, { useMemo } from "react";

import { MenuActionProps } from "@/components/menu-action-item";
import { RenameDialog } from "@/components/rename-dialog";
import { RowActions } from "@/components/row-actions";
import useDisclosure from "@/components/use-disclosure";
import { CONFIGURATOR_STATE_LAYOUTING } from "@/config-types";
import { ParsedConfig } from "@/db/config";
import { sourceToLabel } from "@/domain/datasource";
import { truthy } from "@/domain/types";
import { useUserConfigs } from "@/domain/user-configs";
import { useDataCubesMetadataQuery } from "@/graphql/hooks";
import { useRootStyles } from "@/login/utils";
import { useLocale } from "@/src";
import { removeConfig, updateConfig } from "@/utils/chart-config/api";
import { useMutate } from "@/utils/use-fetch-data";

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
  tableLayout: "fixed",
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
              <TableRow>
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

  const actions = useMemo(() => {
    const actions: (MenuActionProps | null)[] = [
      {
        type: "link",
        href: `/${locale}/v/${config.key}`,
        label: t({ id: "login.chart.view", message: "Preview" }),
        iconName: "eye",
        priority:
          config.published_state === PUBLISHED_STATE.PUBLISHED ? 0 : undefined,
      },
      {
        type: "link",
        href: `/${locale}/create/new?copy=${config.key}`,
        label: t({ id: "login.chart.copy", message: "Copy" }),
        iconName: "copy",
      },
      {
        type: "link",
        href: `/${locale}/create/new?edit=${config.key}${config.data.chartConfigs.length > 1 ? `&state=${CONFIGURATOR_STATE_LAYOUTING}` : ""}`,
        label: t({ id: "login.chart.edit", message: "Edit" }),
        iconName: "edit",
        priority:
          config.published_state === PUBLISHED_STATE.DRAFT ? 0 : undefined,
      },
      {
        type: "link",
        href: `/${locale}/v/${config.key}`,
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
              : "unpublish") as MenuActionProps["iconName"],

            onClick: async () => {
              await updateConfigMut.mutate({
                key: config.key,
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
    ];

    return sortBy(actions.filter(truthy), (x) => x.priority);
  }, [
    locale,
    config.data,
    config.key,
    config.published_state,
    invalidateUserConfigs,
    openRename,
    removeConfigMut,
    updateConfigMut,
  ]);

  const chartTitle = useMemo(() => {
    const title =
      config.data.layout.meta.title?.[locale] ??
      config.data.chartConfigs
        .map((d) => d.meta.title?.[locale] ?? false)
        .filter(truthy)
        .join(", ");

    return title
      ? title
      : t({ id: "annotation.add.title", message: "[ No Title ]" });
  }, [config.data.chartConfigs, config.data.layout.meta.title, locale]);

  return (
    <TableRow>
      <TableCell width="10%">
        <Typography variant="body2">
          {config.data.chartConfigs.length > 1 ? "dashboard" : "single"}
        </Typography>
      </TableCell>
      <TableCell width="30%">
        <Typography variant="body2" noWrap title={chartTitle}>
          {chartTitle}
        </Typography>
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
