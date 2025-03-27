import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  Link,
  PopoverPosition,
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
import React, { useMemo, useState } from "react";

import { MenuActionProps } from "@/components/menu-action-item";
import { OverflowTooltip } from "@/components/overflow-tooltip";
import {
  EmbedContent,
  ShareContent,
  TriggeredPopover,
} from "@/components/publish-actions";
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
const POPOVER_PADDING = 8;

export const SectionContent = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) => {
  const rootClasses = useRootStyles();

  return (
    <Box className={rootClasses.sectionContent}>
      {title && (
        <Typography variant="h3" sx={{ mb: 4 }}>
          {title}
        </Typography>
      )}

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
              color="blue"
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

const ProfileVisualizationsRow = (props: {
  userId: number;
  config: ParsedConfig;
}) => {
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

  const [shareEl, setShareEl] = useState<HTMLElement | undefined>();
  const [embedEl, setEmbedEl] = useState<HTMLElement | undefined>();

  const {
    isOpen: isRenameOpen,
    open: openRename,
    close: closeRename,
  } = useDisclosure();

  const isPublished = config.published_state === PUBLISHED_STATE.PUBLISHED;
  const publishLink = `/${locale}/v/${config.key}`;
  const editLink = `/${locale}/create/new?edit=${config.key}${config.data.chartConfigs.length > 1 ? `&state=${CONFIGURATOR_STATE_LAYOUTING}` : ""}`;

  const actions = useMemo(() => {
    const actions: (MenuActionProps | null)[] = [
      {
        type: "link",
        href: publishLink,
        label: isPublished
          ? t({ id: "login.chart.view", message: "View" })
          : t({ id: "login.chart.preview", message: "Preview" }),
        leadingIconName: "show",
        priority: isPublished ? 0 : undefined,
      },
      {
        type: "link",
        href: `/${locale}/create/new?copy=${config.key}`,
        label: t({ id: "login.chart.duplicate", message: "Duplicate" }),
        leadingIconName: "duplicate",
      },
      {
        type: "link",
        href: editLink,
        label: t({ id: "login.chart.edit", message: "Edit" }),
        leadingIconName: "pen",
        priority: !isPublished ? 0 : undefined,
      },
      isPublished
        ? {
            type: "button",
            label: t({
              id: "login.chart.actions.unpublish",
              message: "Unpublish",
            }),
            leadingIconName: (updateConfigMut.status === "fetching"
              ? "loading"
              : "unpublish") as MenuActionProps["leadingIconName"],

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
        onClick: (e) => setShareEl(e?.currentTarget),
        label: t({ id: "login.chart.share", message: "Share" }),
        leadingIconName: "share",
        stayOpen: true,
      },
      {
        type: "button",
        onClick: (e) => setEmbedEl(e?.currentTarget),
        label: t({ id: "login.chart.embed", message: "Embed" }),
        leadingIconName: "embed",
        stayOpen: true,
      },
      {
        type: "button",
        label: t({ id: "login.chart.rename", message: "Rename" }),
        leadingIconName: "text",
        onClick: () => {
          openRename();
        },
      },
      {
        type: "button",
        label: t({ id: "login.chart.delete", message: "Delete" }),
        color: "error",
        leadingIconName:
          removeConfigMut.status === "fetching" ? "refresh" : "trash",
        requireConfirmation: true,
        confirmationTitle: isPublished
          ? t({
              id: "login.chart.delete.confirmation",
              message: "Are you sure you want to delete this chart?",
            })
          : t({
              id: "login.chart.delete-draft.confirmation",
              message: "Are you sure you want to delete this draft?",
            }),
        confirmationText: isPublished
          ? t({
              id: "login.profile.chart.delete.warning",
              message:
                "This action cannot be undone. Removing this chart will affect all the places where it's embedded!",
            })
          : t({
              id: "login.profile.chart.delete-draft.warning",
              message: "This action cannot be undone.",
            }),
        onClick: async () => {
          await removeConfigMut.mutate({ key: config.key });
          invalidateUserConfigs();
        },
        onSuccess: () => {
          invalidateUserConfigs();
        },
      },
    ];

    return sortBy(actions.filter(truthy), (x) => x.priority);
  }, [
    publishLink,
    isPublished,
    locale,
    config.key,
    config.data,
    editLink,
    updateConfigMut,
    removeConfigMut,
    invalidateUserConfigs,
    openRename,
  ]);

  const isSingleChart = config.data.chartConfigs.length === 1;
  const chartTitle = useMemo(() => {
    const title = isSingleChart
      ? config.data.chartConfigs[0].meta.title[locale]
      : config.data.layout.meta.title[locale];
    return title || t({ id: "annotation.add.title", message: "[ No Title ]" });
  }, [
    config.data.chartConfigs,
    config.data.layout.meta.title,
    isSingleChart,
    locale,
  ]);

  const rootClasses = useRootStyles();

  return (
    <TableRow>
      <TableCell width="10%">
        <Typography variant="body2">
          {isSingleChart
            ? t({ id: "controls.layout.chart", message: "Chart" })
            : t({ id: "controls.layout.dashboard", message: "Dashboard" })}
        </Typography>
      </TableCell>
      <TableCell width="30%">
        <NextLink
          href={isPublished ? publishLink : editLink}
          passHref
          legacyBehavior
        >
          <Link color="blue">
            <OverflowTooltip arrow title={chartTitle} color="blue">
              <Typography
                className={rootClasses.noTooltip}
                variant="body2"
                noWrap
              >
                {chartTitle}
              </Typography>
            </OverflowTooltip>
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
            <Link color="blue">
              <OverflowTooltip
                arrow
                title={data?.dataCubesMetadata[0]?.title ?? ""}
                color="blue"
              >
                <Typography
                  className={rootClasses.noTooltip}
                  variant="body2"
                  noWrap
                >
                  {data?.dataCubesMetadata[0]?.title ?? ""}
                </Typography>
              </OverflowTooltip>
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
          {config.updated_at.toLocaleString("de", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </Typography>
      </TableCell>
      <TableCell width="20%" align="right">
        <RowActions actions={actions} />
        <TriggeredPopover
          popoverProps={{
            anchorPosition: { ...getAdjustedPopoverPosition(embedEl) },
            anchorReference: "anchorPosition",
          }}
          trigger={embedEl}
        >
          <EmbedContent locale={locale} configKey={config.key} />
        </TriggeredPopover>
        <TriggeredPopover
          popoverProps={{
            anchorPosition: {
              ...getAdjustedPopoverPosition(shareEl),
            },
            anchorReference: "anchorPosition",
          }}
          trigger={shareEl}
        >
          <ShareContent locale={locale} configKey={config.key} />
        </TriggeredPopover>
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

const getAdjustedPopoverPosition = (
  element: HTMLElement | undefined
): PopoverPosition => {
  if (element) {
    const { x, y } = element.getBoundingClientRect();

    return {
      top: y,
      left: x - POPOVER_PADDING,
    };
  } else {
    return { top: 0, left: 0 };
  }
};
