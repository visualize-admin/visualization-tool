import { t, Trans } from "@lingui/macro";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Popover,
  PopoverProps,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ChangeEvent,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useState,
} from "react";

import { CHART_RESIZE_EVENT_TYPE } from "@/charts/shared/use-size";
import { CopyToClipboardTextInput } from "@/components/copy-to-clipboard-text-input";
import Flex from "@/components/flex";
import { Radio } from "@/components/form";
import { IconLink } from "@/components/links";
import { ConfiguratorStatePublished } from "@/configurator";
import { Icon } from "@/icons";
import useEvent from "@/utils/use-event";
import { useI18n } from "@/utils/use-i18n";
import { useResizeObserver } from "@/utils/use-resize-observer";

type PublishActionProps = {
  chartWrapperRef: RefObject<HTMLDivElement>;
  configKey: string;
  locale: string;
  state?: ConfiguratorStatePublished;
};

export const PublishActions = (props: PublishActionProps) => {
  return (
    <Stack direction="row" spacing={2}>
      <Share {...props} />
      <Embed {...props} />
    </Stack>
  );
};

type TriggeredPopoverProps = {
  children: ReactNode;
  renderTrigger?: (
    setAnchorEl: (el: HTMLElement | undefined) => void
  ) => React.ReactNode;
  popoverProps: Omit<PopoverProps, "open" | "anchorEl" | "onClose">;
  trigger?: HTMLElement;
};

export const TriggeredPopover = (props: TriggeredPopoverProps) => {
  const { children, renderTrigger, popoverProps, trigger } = props;
  const [anchorEl, setAnchorEl] = useState<Element | undefined>();

  useEffect(() => {
    setAnchorEl(trigger);
  }, [trigger]);

  const [ref, width, height] = useResizeObserver<HTMLDivElement>();

  return (
    <>
      {renderTrigger && renderTrigger(setAnchorEl)}
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        {...popoverProps}
        anchorPosition={
          popoverProps.anchorPosition
            ? {
                top: popoverProps.anchorPosition?.top - height / 2,
                left: popoverProps.anchorPosition?.left - width,
              }
            : undefined
        }
        onClose={() => setAnchorEl(undefined)}
      >
        <Box ref={ref}>{children}</Box>
      </Popover>
    </>
  );
};

const Embed = ({
  chartWrapperRef,
  configKey,
  locale,
  state,
}: PublishActionProps) => {
  const [iframeHeight, setIframeHeight] = useState(0);

  const handlePopoverOpen = useEvent(() => {
    if (chartWrapperRef?.current) {
      const height = Math.ceil(
        chartWrapperRef.current.getBoundingClientRect().height
      );
      setIframeHeight(height);
    }
  });

  return (
    <TriggeredPopover
      popoverProps={{
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
        transformOrigin: {
          vertical: -4,
          horizontal: "right",
        },
        onClick: handlePopoverOpen,
      }}
      renderTrigger={(setAnchorEl) => (
        <Button
          startIcon={<Icon name="embed" size={16} />}
          variant="contained"
          color="primary"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <Trans id="button.embed">Embed</Trans>
        </Button>
      )}
    >
      <EmbedContent
        iframeHeight={iframeHeight}
        configKey={configKey}
        locale={locale}
        showAdvancedSettings={shouldShowAdvancedEmbedSettings(state)}
      />
    </TriggeredPopover>
  );
};

const EmbedRadio = ({
  infoMessage,
  ...rest
}: {
  value: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label: string;
  infoMessage?: string;
}) => {
  return (
    <Flex sx={{ alignItems: "center", gap: 1 }}>
      <Radio {...rest} formLabelProps={{ sx: { m: 0 } }} />
      {infoMessage && (
        <Tooltip
          arrow
          title={<Typography variant="body2">{infoMessage}</Typography>}
          PopperProps={{ sx: { width: 190, p: 0 } }}
          componentsProps={{
            tooltip: { sx: { color: "secondary.active", px: 4, py: 3 } },
          }}
        >
          <Box sx={{ color: "secondary.active" }}>
            <Icon name="infoOutline" size={16} />
          </Box>
        </Tooltip>
      )}
    </Flex>
  );
};

const EmbedToggleSwitch = ({
  infoMessage,
  label,
  ...rest
}: {
  checked: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
  label: string;
  infoMessage?: string;
}) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <FormControlLabel
        control={<Switch {...rest} />}
        label={<Typography variant="body2">{label}</Typography>}
        sx={{ mr: 0 }}
      />
      {infoMessage && (
        <Tooltip
          arrow
          title={<Typography variant="body2">{infoMessage}</Typography>}
          PopperProps={{ sx: { width: 190, p: 0 } }}
          componentsProps={{
            tooltip: { sx: { color: "secondary.active", px: 4, py: 3 } },
          }}
        >
          <Box sx={{ color: "secondary.active" }}>
            <Icon name="infoOutline" size={16} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

const Share = ({ configKey, locale }: PublishActionProps) => {
  return (
    <TriggeredPopover
      popoverProps={{
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
        transformOrigin: {
          vertical: -4,
          horizontal: "right",
        },
      }}
      renderTrigger={(setAnchorEl) => {
        return (
          <Button
            onClick={(ev) => {
              setAnchorEl(ev.target as HTMLElement);
            }}
            startIcon={<Icon name="linkExternal" size={16} />}
          >
            <Trans id="button.share">Share</Trans>
          </Button>
        );
      }}
    >
      <ShareContent configKey={configKey} locale={locale} />
    </TriggeredPopover>
  );
};

export type LegacyEmbedQueryParam = "disableBorder";

export type EmbedQueryParam =
  | "removeBorder"
  | "optimizeSpace"
  | "removeMoreOptionsButton"
  | "removeAxisLabelsInteractivity"
  | "removeLegend";

export const EmbedContent = ({
  locale,
  configKey,
  iframeHeight,
  showAdvancedSettings,
}: {
  iframeHeight?: number;
  showAdvancedSettings?: boolean;
} & Omit<PublishActionProps, "chartWrapperRef" | "state">) => {
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedAEMUrl, setEmbedAEMUrl] = useState("");
  const [responsive, setResponsive] = useState(true);
  const [queryParams, setQueryParams] = useState<EmbedQueryParam[]>([]);
  const setQueryParam = useCallback(
    (param: EmbedQueryParam, value: boolean) => {
      setQueryParams((prev) => {
        if (value) {
          return [...prev, param];
        } else {
          return prev.filter((qp) => qp !== param);
        }
      });
    },
    []
  );

  useEffect(() => {
    const { origin } = window.location;
    const embedPath = `${configKey}${queryParams.length ? `?${queryParams.map((qp) => `${qp}=true`).join("&")}` : ""}`;
    setEmbedUrl(`${origin}/${locale}/embed/${embedPath}`);
    setEmbedAEMUrl(`${origin}/api/embed-aem-ext/${locale}/${embedPath}`);
  }, [configKey, locale, queryParams]);

  return (
    <Flex sx={{ flexDirection: "column", gap: 4, p: 4 }}>
      <div>
        <Typography component="div" variant="h5">
          <Trans id="publication.embed.iframe">Iframe Embed Code</Trans>
        </Typography>
        <Typography variant="caption">
          <Trans id="publication.embed.iframe.caption">
            Use this link to embed the chart into other webpages.
          </Trans>
        </Typography>
        <Flex sx={{ alignItems: "center", gap: 4, mt: 3, mb: 2 }}>
          <EmbedRadio
            value="responsive"
            checked={responsive}
            onChange={() => setResponsive(true)}
            label={t({
              id: "publication.embed.iframe.responsive",
              message: "Responsive iframe",
            })}
            infoMessage={t({
              id: "publication.embed.iframe.responsive.warn",
              message:
                "For embedding visualizations in web pages without CMS support. The iframe will be responsive. The JavaScript part of the embed code ensures that the iframe always maintains the correct size.",
            })}
          />
          <EmbedRadio
            value="static"
            checked={!responsive}
            onChange={() => setResponsive(false)}
            label={t({
              id: "publication.embed.iframe.static",
              message: "Static iframe",
            })}
            infoMessage={t({
              id: "publication.embed.iframe.static.warn",
              message:
                "For embedding visualizations in systems without JavaScript support (e.g. WordPress).",
            })}
          />
        </Flex>
        {showAdvancedSettings ? (
          <Accordion sx={{ mb: 4 }}>
            <AccordionSummary>
              <Typography variant="h5" component="p">
                <Trans id="publication.embed.advanced-settings">
                  Advanced settings
                </Trans>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <EmbedToggleSwitch
                checked={queryParams.includes("removeBorder")}
                onChange={(_, checked) => {
                  setQueryParam("removeBorder", checked);
                }}
                label={t({
                  id: "publication.embed.iframe.remove-border",
                  message: "Remove border",
                })}
                infoMessage={t({
                  id: "publication.embed.iframe.remove-border.warn",
                  message:
                    "For embedding visualizations in systems without a border.",
                })}
              />
              <EmbedToggleSwitch
                checked={queryParams.includes("optimizeSpace")}
                onChange={(_, checked) => {
                  setQueryParam("optimizeSpace", checked);
                }}
                label={t({
                  id: "publication.embed.iframe.optimize-space",
                  message: "Optimize white space around and within chart",
                })}
              />
              <EmbedToggleSwitch
                checked={queryParams.includes("removeMoreOptionsButton")}
                onChange={(_, checked) => {
                  setQueryParam("removeMoreOptionsButton", checked);
                }}
                label={t({
                  id: "publication.embed.iframe.remove-more-options-button",
                  message:
                    "Remove options for table view, copy & edit, sharing, and downloading",
                })}
              />
              <EmbedToggleSwitch
                checked={queryParams.includes("removeAxisLabelsInteractivity")}
                onChange={(_, checked) => {
                  setQueryParam("removeAxisLabelsInteractivity", checked);
                }}
                label={t({
                  id: "publication.embed.iframe.remove-axis-labels-interactivity",
                  message: "No interactive axis labels",
                })}
              />
              <EmbedToggleSwitch
                checked={queryParams.includes("removeLegend")}
                onChange={(_, checked) => {
                  setQueryParam("removeLegend", checked);
                }}
                label={t({
                  id: "publication.embed.iframe.remove-legend",
                  message: "Remove legend",
                })}
              />
            </AccordionDetails>
          </Accordion>
        ) : null}
        <CopyToClipboardTextInput
          content={`<iframe src="${embedUrl}" width="100%" style="${responsive ? "" : `height: ${iframeHeight || 640}px; `}border: 0px #ffffff none;"  name="visualize.admin.ch"></iframe>${responsive ? `<script type="text/javascript">!function(){window.addEventListener("message", function (e) { if (e.data.type === "${CHART_RESIZE_EVENT_TYPE}") { document.querySelectorAll("iframe").forEach((iframe) => { if (iframe.contentWindow === e.source) { iframe.style.height = e.data.height + "px"; } }); } })}();</script>` : ""}`}
        />
      </div>
      <div>
        <Typography component="div" variant="h5">
          <Trans id="publication.embed.external-application">
            Embed Code for &quot;External Application&quot;
          </Trans>
        </Typography>
        <Typography variant="caption">
          <Trans id="publication.embed.external-application.caption">
            Use this link to embed the chart without iframe tags.
          </Trans>
        </Typography>
        <CopyToClipboardTextInput content={embedAEMUrl} />
      </div>
    </Flex>
  );
};

export const ShareContent = ({
  configKey,
  locale,
}: Omit<PublishActionProps, "chartWrapperRef">) => {
  const [shareUrl, setShareUrl] = useState("");
  const i18n = useI18n();

  useEffect(() => {
    setShareUrl(`${window.location.origin}/${locale}/v/${configKey}`);
  }, [configKey, locale]);

  return (
    <Box m={4} sx={{ "& > * + *": { mt: 4 } }}>
      <Flex
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography component="div" variant="body1" color="grey.700">
          <Trans id="publication.popup.share">Share</Trans>:
        </Typography>
        <Flex color="primary">
          <IconLink
            iconName="facebook"
            title={i18n._(
              t({
                id: "publication.share.linktitle.facebook",
                message: `Share on Facebook`,
              })
            )}
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
          ></IconLink>
          <IconLink
            iconName="twitter"
            title={i18n._(
              t({
                id: "publication.share.linktitle.twitter",
                message: `Share on Twitter`,
              })
            )}
            href={`https://twitter.com/intent/tweet?url=${shareUrl}&via=bafuCH`}
          ></IconLink>
          <IconLink
            iconName="mail"
            title={i18n._(
              t({
                id: "publication.share.linktitle.mail",
                message: `Share via email`,
              })
            )}
            href={`mailto:?subject=${i18n._(
              t({
                id: "publication.share.mail.subject",
                message: `visualize.admin.ch`,
              })
            )}&body=${i18n._(
              t({
                id: "publication.share.mail.body",
                message: `Here is a link to a visualization I created on visualize.admin.ch`,
              })
            )}: ${shareUrl}`}
          ></IconLink>
        </Flex>
      </Flex>
      <Divider />
      <Box mt={2}>
        <Typography component="div" variant="body1" color="grey.700">
          <Trans id="publication.share.chart.url">Chart URL: </Trans>
        </Typography>
        <CopyToClipboardTextInput content={shareUrl} />
      </Box>
    </Box>
  );
};

export const shouldShowAdvancedEmbedSettings = (
  state?: ConfiguratorStatePublished
) => {
  return state?.chartConfigs?.length === 1 && state?.layout.type === "tab";
};
