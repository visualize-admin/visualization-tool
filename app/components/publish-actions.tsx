import { t, Trans } from "@lingui/macro";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Popover,
  PopoverProps,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, ReactNode, RefObject, useEffect, useState } from "react";

import { CHART_RESIZE_EVENT_TYPE } from "@/charts/shared/use-size";
import { CopyToClipboardTextInput } from "@/components/copy-to-clipboard-text-input";
import {
  isEmbedQueryParam,
  useEmbedQueryParams,
} from "@/components/embed-params";
import Flex from "@/components/flex";
import { Radio } from "@/components/form";
import { Icon } from "@/icons";
import useEvent from "@/utils/use-event";
import { useI18n } from "@/utils/use-i18n";
import { useResizeObserver } from "@/utils/use-resize-observer";

type PublishActionProps = {
  chartWrapperRef: RefObject<HTMLDivElement>;
  configKey: string;
  locale: string;
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
  ) => ReactNode;
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
        elevation={4}
        onClose={() => setAnchorEl(undefined)}
      >
        <Box ref={ref}>{children}</Box>
      </Popover>
    </>
  );
};

const Embed = ({ chartWrapperRef, configKey, locale }: PublishActionProps) => {
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
          size="sm"
          startIcon={<Icon name="embed" size={20} />}
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
      <Radio {...rest} />
      {infoMessage && (
        <Tooltip
          arrow
          title={infoMessage}
          PopperProps={{ sx: { width: 190, p: 0 } }}
        >
          <div style={{ fontSize: 0 }}>
            <Icon name="infoCircle" size={16} />
          </div>
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
  onChange: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  label: string;
  infoMessage?: string;
}) => {
  return (
    <Flex sx={{ alignItems: "center", gap: 1 }}>
      <FormControlLabel
        control={<Switch {...rest} />}
        label={<Typography variant="body3">{label}</Typography>}
        sx={{ mr: 0 }}
      />
      {infoMessage && (
        <Tooltip
          arrow
          title={infoMessage}
          PopperProps={{ sx: { width: 190, p: 0 } }}
        >
          <div style={{ fontSize: 0 }}>
            <Icon name="infoCircle" size={16} />
          </div>
        </Tooltip>
      )}
    </Flex>
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
            size="sm"
            onClick={(e) => {
              setAnchorEl(e.target as HTMLElement);
            }}
            startIcon={<Icon name="share" size={20} />}
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

export const EmbedContent = ({
  locale,
  configKey,
  iframeHeight,
}: {
  iframeHeight?: number;
} & Omit<PublishActionProps, "chartWrapperRef" | "state">) => {
  const router = useRouter();
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedAEMUrl, setEmbedAEMUrl] = useState("");
  const { embedParams, setEmbedQueryParam } = useEmbedQueryParams();
  const [responsive, setResponsive] = useState(true);

  useEffect(() => {
    const { origin } = window.location;
    const activeEmbedParams = Object.entries(embedParams)
      .filter(([_, value]) => value)
      .map(([key]) => `${key}=true`)
      .join("&");
    const embedPath = `${configKey}${activeEmbedParams ? `?${activeEmbedParams}` : ""}`;
    setEmbedUrl(`${origin}/${locale}/embed/${embedPath}`);
    setEmbedAEMUrl(`${origin}/api/embed-aem-ext/${locale}/${embedPath}`);

    if (router.isReady) {
      const nonEmbedParams = Object.fromEntries(
        Object.entries(router.query).filter(([key]) => !isEmbedQueryParam(key))
      );
      const updatedQuery = {
        ...nonEmbedParams,
        ...Object.fromEntries(
          Object.entries(embedParams)
            .filter(([_, v]) => v)
            .map(([k]) => [k, "true"])
        ),
      } as Record<string, string>;
      const currentQueryString = new URLSearchParams(
        router.query as Record<string, string>
      ).toString();
      const newQueryString = new URLSearchParams(updatedQuery).toString();

      if (currentQueryString !== newQueryString) {
        router.replace(
          { pathname: router.pathname, query: updatedQuery },
          undefined,
          { shallow: true }
        );
      }
    }
  }, [configKey, locale, embedParams, router]);

  return (
    <Flex sx={{ flexDirection: "column", gap: 4, p: 4 }}>
      <Flex sx={{ flexDirection: "column", gap: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          <Trans id="publication.embed.iframe">Iframe Embed Code</Trans>
        </Typography>
        <Typography variant="body3">
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
        <Accordion
          defaultExpanded={Object.values(embedParams).some((d) => d)}
          sx={{
            boxShadow: 0,

            "&::before": {
              display: "none",
            },
          }}
        >
          <AccordionSummary
            sx={{
              width: "fit-content",
              gap: 1,
              minHeight: 0,
              color: "primary.main",
              transition: "color 0.2s ease",

              "&:hover": {
                color: "primary.dark",
              },

              "& > .MuiAccordionSummary-content": {
                m: 0,
                p: 0,
              },

              "& svg": {
                color: "primary.main",
              },
            }}
          >
            <Typography variant="h6" component="p">
              <Trans id="publication.embed.advanced-settings">
                Advanced settings
              </Trans>
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 3 }}>
            <EmbedToggleSwitch
              checked={embedParams.removeBorder}
              onChange={(_, checked) => {
                setEmbedQueryParam("removeBorder", checked);
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
              checked={embedParams.optimizeSpace}
              onChange={(_, checked) => {
                setEmbedQueryParam("optimizeSpace", checked);
              }}
              label={t({
                id: "publication.embed.iframe.optimize-space",
                message: "Optimize white space around and within chart",
              })}
            />
            <EmbedToggleSwitch
              checked={embedParams.removeMoreOptionsButton}
              onChange={(_, checked) => {
                setEmbedQueryParam("removeMoreOptionsButton", checked);
              }}
              label={t({
                id: "publication.embed.iframe.remove-more-options-button",
                message:
                  "Remove options for table view, copy & edit, sharing, and downloading",
              })}
            />
            <EmbedToggleSwitch
              checked={embedParams.removeLabelsInteractivity}
              onChange={(_, checked) => {
                setEmbedQueryParam("removeLabelsInteractivity", checked);
              }}
              label={t({
                id: "publication.embed.iframe.remove-axis-labels-interactivity",
                message: "Hide interactive labels",
              })}
            />
            <EmbedToggleSwitch
              checked={embedParams.removeFootnotes}
              onChange={(_, checked) => {
                setEmbedQueryParam("removeFootnotes", checked);
              }}
              label={t({
                id: "publication.embed.iframe.remove-legend",
                message: "Hide footnotes",
              })}
            />
            <EmbedToggleSwitch
              checked={embedParams.removeFilters}
              onChange={(_, checked) => {
                setEmbedQueryParam("removeFilters", checked);
              }}
              label={t({
                id: "publication.embed.iframe.remove-filters",
                message: "Hide filters",
              })}
            />
          </AccordionDetails>
        </Accordion>
      </Flex>
      <CopyToClipboardTextInput
        content={`<iframe src="${embedUrl}" width="100%" style="${responsive ? "" : `height: ${iframeHeight || 640}px; `}border: 0px #ffffff none;"  name="visualize.admin.ch"></iframe>${responsive ? `<script type="text/javascript">!function(){window.addEventListener("message", function (e) { if (e.data.type === "${CHART_RESIZE_EVENT_TYPE}") { document.querySelectorAll("iframe").forEach((iframe) => { if (iframe.contentWindow === e.source) { iframe.style.height = e.data.height + "px"; } }); } })}();</script>` : ""}`}
      />
      <Flex sx={{ flexDirection: "column", gap: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          <Trans id="publication.embed.external-application">
            Embed Code for &quot;External Application&quot;
          </Trans>
        </Typography>
        <Typography variant="body3">
          <Trans id="publication.embed.external-application.caption">
            Use this link to embed the chart without iframe tags.
          </Trans>
        </Typography>
        <CopyToClipboardTextInput content={embedAEMUrl} />
      </Flex>
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
    <Flex sx={{ flexDirection: "column", gap: 2, p: 4 }}>
      <Flex sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          <Trans id="publication.popup.share">Share</Trans>
        </Typography>
        <Flex>
          <IconButton
            title={i18n._(
              t({
                id: "publication.share.linktitle.facebook",
                message: `Share on Facebook`,
              })
            )}
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
          >
            <Icon name="facebook" />
          </IconButton>
          <IconButton
            title={i18n._(
              t({
                id: "publication.share.linktitle.twitter",
                message: `Share on Twitter`,
              })
            )}
            href={`https://twitter.com/intent/tweet?url=${shareUrl}&via=bafuCH`}
          >
            <Icon name="twitter" />
          </IconButton>
          <IconButton
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
          >
            <Icon name="envelope" />
          </IconButton>
        </Flex>
      </Flex>
      <div>
        <Typography
          variant="h6"
          component="div"
          sx={{ mb: 1, fontWeight: 700 }}
        >
          <Trans id="publication.share.chart.url">Chart URL</Trans>
        </Typography>
        <CopyToClipboardTextInput content={shareUrl} />
      </div>
    </Flex>
  );
};
