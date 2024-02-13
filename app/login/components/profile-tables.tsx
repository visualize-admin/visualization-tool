import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  CircularProgress,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Link,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import React from "react";

import useDisclosure from "@/components/use-disclosure";
import { ParsedConfig } from "@/db/config";
import { sourceToLabel } from "@/domain/datasource";
import { truthy } from "@/domain/types";
import { useUserConfigs } from "@/domain/user-configs";
import { useDataCubesMetadataQuery } from "@/graphql/hooks";
import { Icon, IconName } from "@/icons";
import { useRootStyles } from "@/login/utils";
import { useLocale } from "@/src";
import { removeConfig } from "@/utils/chart-config/api";

const PREVIEW_LIMIT = 3;

type ProfileTableProps = React.PropsWithChildren<{
  title: string;
  preview?: boolean;
  onShowAll?: () => void;
}>;

const ProfileTable = (props: ProfileTableProps) => {
  const { title, preview, onShowAll, children } = props;
  const rootClasses = useRootStyles();

  return (
    <Box className={rootClasses.sectionContent}>
      <Typography variant="h2" sx={{ mb: 4 }}>
        {title}
      </Typography>
      <Table>{children}</Table>
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
    </Box>
  );
};

type ProfileVisualizationsTableProps = {
  userId: number;
  userConfigs: ParsedConfig[];
  preview?: boolean;
  onShowAll?: () => void;
};

export const ProfileVisualizationsTable = (
  props: ProfileVisualizationsTableProps
) => {
  const { userId, userConfigs, preview, onShowAll } = props;

  return (
    <ProfileTable
      title={t({
        id: "login.profile.my-visualizations",
        message: "My visualizations",
      })}
      preview={preview && userConfigs.length > PREVIEW_LIMIT}
      onShowAll={onShowAll}
    >
      {userConfigs.length > 0 ? (
        <>
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
              <Trans id="login.profile.my-visualizations.chart-published-date">
                Published
              </Trans>
            </TableCell>
            <TableCell align="right">
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
    </ProfileTable>
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

  const actions = React.useMemo(() => {
    const actions: ActionProps[] = [
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
      },
      {
        type: "link",
        href: `/v/${config.key}`,
        label: t({ id: "login.chart.share", message: "Share" }),
        iconName: "linkExternal",
      },
      {
        type: "button",
        label: t({ id: "login.chart.delete", message: "Delete" }),
        iconName: "trash",
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
        onClick: async () => {
          await removeConfig({ key: config.key, userId });
        },
        onSuccess: () => {
          invalidateUserConfigs();
        },
      },
    ];

    return actions;
  }, [config.key, invalidateUserConfigs, userId]);

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
          <Link target="_blank" color="primary">
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
            <Link target="_blank" color="primary">
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
      <TableCell width={120}>
        <Typography variant="body2">
          {config.created_at.toLocaleDateString("de")}
        </Typography>
      </TableCell>
      <TableCell width="auto" align="right">
        <Actions actions={actions} />
      </TableCell>
    </TableRow>
  );
};

type ActionsProps = {
  actions: ActionProps[];
};

const Actions = (props: ActionsProps) => {
  const { actions } = props;
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const { isOpen, open, close } = useDisclosure();

  return (
    <ClickAwayListener onClickAway={close}>
      <Tooltip
        arrow
        open={isOpen}
        title={
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {actions.map((props, i) => (
              <Action
                key={i}
                {...props}
                {...(props.type === "button" ? { onDialogClose: close } : {})}
              />
            ))}
          </Box>
        }
        sx={{ p: 2 }}
        componentsProps={{ tooltip: { sx: { p: 3, pb: 2 } } }}
      >
        <IconButton ref={buttonRef} onClick={isOpen ? close : open}>
          <Icon name="more" size={16} />
        </IconButton>
      </Tooltip>
    </ClickAwayListener>
  );
};

type ActionProps = ActionLinkProps | ActionButtonProps;

const Action = (props: ActionProps) => {
  switch (props.type) {
    case "link":
      return <ActionLink {...props} />;
    case "button":
      return <ActionButton {...props} />;
    default:
      const _exhaustiveCheck: never = props;
      return _exhaustiveCheck;
  }
};

type ActionLinkProps = {
  type: "link";
  href: string;
  label: string;
  iconName: IconName;
};

const ActionLink = (props: ActionLinkProps) => {
  const { href, label, iconName } = props;

  return (
    <NextLink href={href} passHref legacyBehavior>
      <Link
        target="_blank"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "primary.main",
        }}
      >
        <Icon name={iconName} size={16} />
        <Typography variant="body2">{label}</Typography>
      </Link>
    </NextLink>
  );
};

type ActionButtonProps = {
  type: "button";
  label: string;
  iconName: IconName;
  requireConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationText?: string;
  onClick: () => Promise<void>;
  onDialogClose?: () => void;
  onSuccess?: () => void;
};

const ActionButton = (props: ActionButtonProps) => {
  const {
    label,
    iconName,
    requireConfirmation,
    confirmationTitle,
    confirmationText,
    onClick,
    onDialogClose,
    onSuccess,
  } = props;
  const { isOpen, open, close } = useDisclosure();
  const [loading, setLoading] = React.useState(false);

  return (
    <>
      <Link
        onClick={(e) => {
          // To prevent the click away listener from closing the dialog.
          e.stopPropagation();

          if (requireConfirmation) {
            open();
          } else {
            onClick();
          }
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "primary.main",
          cursor: "pointer",
        }}
      >
        <Icon name={iconName} size={16} style={{ margin: 0 }} />
        <Typography variant="body2">{label}</Typography>
      </Link>
      {requireConfirmation && (
        <Dialog
          open={isOpen}
          // To prevent the click away listener from closing the dialog.
          onClick={(e) => e.stopPropagation()}
          onClose={close}
          maxWidth="xs"
        >
          <DialogTitle>
            <Typography variant="h3">
              {confirmationTitle ??
                t({
                  id: "login.profile.chart.confirmation.default",
                  message: "Are you sure you want to perform this action?",
                })}
            </Typography>
          </DialogTitle>
          {confirmationText && (
            <DialogContent>
              <DialogContentText>{confirmationText}</DialogContentText>
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
                close();
                await new Promise((r) => setTimeout(r, 100));

                onDialogClose?.();
                onSuccess?.();
              }}
            >
              {loading ? <CircularProgress /> : <Trans id="yes">Yes</Trans>}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
