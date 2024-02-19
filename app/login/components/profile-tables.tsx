import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  Link,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { PUBLISHED_STATE } from "@prisma/client";
import sortBy from "lodash/sortBy";
import NextLink from "next/link";
import React from "react";

import { ParsedConfig } from "@/db/config";
import { sourceToLabel } from "@/domain/datasource";
import { truthy } from "@/domain/types";
import { useUserConfigs } from "@/domain/user-configs";
import { useDataCubesMetadataQuery } from "@/graphql/hooks";
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
      <Typography variant="h2" sx={{ mb: 4 }}>
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

export const ProfileVisualizationsTable = (
  props: ProfileVisualizationsTableProps
) => {
  const { title, userId, userConfigs, preview, onShowAll } = props;

  return (
    <SectionContent title={title}>
      {userConfigs.length > 0 ? (
        <>
          <Table>
            <TableHead
              sx={{
                "& > .MuiTableCell-root": {
                  borderBottomColor: "divider",
                  color: "secondary.main",
                },
              }}
            >
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
          </Table>
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

  const updatePublishedStateMut = useMutate(updateConfig);
  const removeMut = useMutate(removeConfig);
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
      {
        type: "button",
        label:
          config.published_state === PUBLISHED_STATE.DRAFT
            ? t({
                id: "login.chart.actions.publish",
                message: `Publish`,
              })
            : t({
                id: "login.chart.actions.turn-into-draft",
                message: "Turn into draft",
              }),
        iconName:
          updatePublishedStateMut.status === "fetching"
            ? "loading"
            : "linkExternal",

        onClick: async () => {
          await updatePublishedStateMut.mutate({
            key: config.key,
            user_id: userId,
            data: {
              ...config.data,
              state: "PUBLISHING",
            },
            published_state:
              config.published_state === PUBLISHED_STATE.DRAFT
                ? PUBLISHED_STATE.PUBLISHED
                : PUBLISHED_STATE.DRAFT,
          });
          invalidateUserConfigs();
        },
        onSuccess: () => {
          invalidateUserConfigs();
        },
      },
      {
        type: "button",
        label: t({ id: "login.chart.delete", message: "Delete" }),
        color: "error",
        iconName: removeMut.status === "fetching" ? "loading" : "trash",
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
          removeMut.mutate({ key: config.key });
        },
        onSuccess: () => {
          invalidateUserConfigs();
        },
      },
    ];

    return sortBy(actions, (x) => x.priority);
  }, [
    config.data,
    config.key,
    config.published_state,
    invalidateUserConfigs,
    removeMut,
    updatePublishedStateMut,
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
    <TableRow
      sx={{
        verticalAlign: "middle",
        height: 56,
        "& > .MuiTableCell-root": {
          borderBottomColor: "divider",
        },
      }}
    >
      <TableCell width={80}>
        <Typography variant="body2">
          {config.data.chartConfigs.length > 1 ? "multi" : "single"}
        </Typography>
      </TableCell>
      <TableCell width="auto" sx={{ maxWidth: 320 }}>
        <NextLink href={`/v/${config.key}`} passHref legacyBehavior>
          <Link color="primary">
            <Typography variant="body2" noWrap>
              {chartTitle}
            </Typography>
          </Link>
        </NextLink>
      </TableCell>
      <TableCell width="auto" sx={{ maxWidth: 320 }}>
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
      <TableCell>
        <Typography width="auto" variant="body2">
          {config.updated_at.toLocaleDateString("de")}
        </Typography>
      </TableCell>
      <TableCell width={150} align="right">
        <RowActions actions={actions} />
      </TableCell>
    </TableRow>
  );
};
