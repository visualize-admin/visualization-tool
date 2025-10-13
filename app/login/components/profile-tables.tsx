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
import { ReactNode, useMemo, useState } from "react";

import { InlineMarkdown, Markdown } from "@/components/markdown";
import { MenuActionProps } from "@/components/menu-action-item";
import { OverflowTooltip } from "@/components/overflow-tooltip";
import {
  EmbedContent,
  ShareContent,
  TriggeredPopover,
} from "@/components/publish-actions";
import { RenameDialog } from "@/components/rename-dialog";
import { RowActions } from "@/components/row-actions";
import { useDisclosure } from "@/components/use-disclosure";
import { CONFIGURATOR_STATE_LAYOUTING } from "@/config-types";
import { ParsedConfigWithViewCount } from "@/db/config";
import { sourceToLabel } from "@/domain/data-source";
import { truthy } from "@/domain/types";
import { useUserConfigs } from "@/domain/user-configs";
import { useDataCubesMetadataQuery } from "@/graphql/hooks";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { useRootStyles } from "@/login/utils";
import { formatInteger } from "@/statistics/formatters";
import { removeConfig, updateConfig } from "@/utils/chart-config/api";
import { useMutate } from "@/utils/use-fetch-data";

const PREVIEW_LIMIT = 3;
const POPOVER_PADDING = 8;

export const SectionContent = ({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) => {
  const rootClasses = useRootStyles();

  return (
    <Box className={rootClasses.sectionContent}>
      {title && (
        <Typography variant="h3" sx={{ mb: 6, fontWeight: 700 }}>
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
  userConfigs: ParsedConfigWithViewCount[];
  preview?: boolean;
  onShowAll?: () => void;
};

const StyledTable = styled(Table)(({ theme }) => ({
  tableLayout: "fixed",
  boxShadow: theme.shadows[4],

  [`& .${tableRowClasses.root}`]: {
    verticalAlign: "middle",
    height: 56,

    [`& > .${tableCellClasses.root}`]: {
      borderBottomColor: theme.palette.divider,
    },
  },

  [`& .${tableHeadClasses.root} .${tableCellClasses.root}`]: {
    color: theme.palette.text.secondary,
  },
}));

export const ProfileVisualizationsTable = ({
  title,
  userId,
  userConfigs,
  preview,
  onShowAll,
}: ProfileVisualizationsTableProps) => {
  return (
    <SectionContent title={title}>
      {userConfigs.length > 0 ? (
        <>
          <StyledTable>
            <TableHead>
              <TableRow>
                <TableCell component="th" width="10%">
                  <Trans id="login.profile.my-visualizations.chart-type">
                    Type
                  </Trans>
                </TableCell>
                <TableCell component="th" width="27.5%">
                  <Trans id="login.profile.my-visualizations.chart-name">
                    Name
                  </Trans>
                </TableCell>
                <TableCell component="th" width="27.5%">
                  <Trans id="login.profile.my-visualizations.dataset-name">
                    Dataset
                  </Trans>
                </TableCell>
                <TableCell component="th" width="10%">
                  <Trans id="login.profile.my-visualizations.chart-views">
                    Views
                  </Trans>
                </TableCell>
                <TableCell component="th" width="12.5%">
                  <Trans id="login.profile.my-visualizations.chart-updated-date">
                    Last edit
                  </Trans>
                </TableCell>
                <TableCell component="th" width="12.5%" />
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
              size="sm"
              endIcon={<Icon name="arrowDown" size={20} />}
              onClick={onShowAll}
              sx={{ mt: 6 }}
            >
              <Trans id="show.all">Show all</Trans>
            </Button>
          )}
        </>
      ) : (
        <Typography variant="body2">
          <Trans id="login.no-charts">No charts yet</Trans>,{" "}
          <NextLink href="/browse" passHref legacyBehavior>
            <Link>
              <Trans id="login.create-chart">create one</Trans>
            </Link>
          </NextLink>
          .
        </Typography>
      )}
    </SectionContent>
  );
};

const ProfileVisualizationsRow = ({
  userId,
  config,
}: {
  userId: number;
  config: ParsedConfigWithViewCount;
}) => {
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
        color: "red",
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

    return title || t({ id: "annotator.add.title", message: "[ Add Title ]" });
  }, [
    config.data.chartConfigs,
    config.data.layout.meta.title,
    isSingleChart,
    locale,
  ]);

  return (
    <TableRow>
      <TableCell>
        {isSingleChart
          ? t({ id: "controls.layout.chart", message: "Chart" })
          : t({ id: "controls.layout.dashboard", message: "Dashboard" })}
      </TableCell>
      <TableCell>
        <NextLink
          href={isPublished ? publishLink : editLink}
          passHref
          legacyBehavior
        >
          <Link>
            <OverflowTooltip
              arrow
              title={<Markdown>{chartTitle}</Markdown>}
              color="primary.main"
            >
              <Typography variant="body3" component="p" noWrap>
                <InlineMarkdown>{chartTitle}</InlineMarkdown>
              </Typography>
            </OverflowTooltip>
          </Link>
        </NextLink>
      </TableCell>
      <TableCell>
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
            <Link>
              <OverflowTooltip
                arrow
                title={data?.dataCubesMetadata[0]?.title ?? ""}
                color="primary.main"
              >
                <Typography variant="body3" component="p" noWrap>
                  {data?.dataCubesMetadata[0]?.title ?? ""}
                </Typography>
              </OverflowTooltip>
            </Link>
          </NextLink>
        ) : (
          <Typography variant="body3" component="p" noWrap>
            {t({
              id: "login.profile.my-visualizations.multiple-datasets",
              message: "Multiple datasets",
            })}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Typography variant="body3" component="p" noWrap>
          {formatInteger(config.viewCount)}
        </Typography>
      </TableCell>
      <TableCell>
        {config.updated_at.toLocaleString("de", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </TableCell>
      <TableCell align="right">
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
