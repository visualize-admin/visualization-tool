import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  Divider,
  Popover,
  PopoverProps,
  Stack,
  Typography,
} from "@mui/material";
import { ChangeEvent, ReactNode, RefObject, useEffect, useState } from "react";

import { CHART_RESIZE_EVENT_TYPE } from "@/charts/shared/use-size";
import { CopyToClipboardTextInput } from "@/components/copy-to-clipboard-text-input";
import Flex from "@/components/flex";
import { IconLink } from "@/components/links";
import { Icon } from "@/icons";
import useEvent from "@/utils/use-event";
import { useI18n } from "@/utils/use-i18n";

import { Radio } from "./form";

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
  renderTrigger: (
    setAnchorEl: (el: HTMLElement | undefined) => void
  ) => React.ReactNode;
  popoverProps: Omit<PopoverProps, "open" | "anchorEl" | "onClose">;
};

const TriggeredPopover = (props: TriggeredPopoverProps) => {
  const { children, renderTrigger, popoverProps } = props;
  const [anchorEl, setAnchorEl] = useState<Element | undefined>();
  return (
    <>
      {renderTrigger(setAnchorEl)}
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        {...popoverProps}
        onClose={() => setAnchorEl(undefined)}
      >
        {children}
      </Popover>
    </>
  );
};

const Embed = ({ chartWrapperRef, configKey, locale }: PublishActionProps) => {
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedAEMUrl, setEmbedAEMUrl] = useState("");
  const [isResponsive, setIsResponsive] = useState(true);
  const [iframeHeight, setIframeHeight] = useState(0);

  const handlePopoverOpen = useEvent(() => {
    if (chartWrapperRef?.current) {
      const height = Math.ceil(
        chartWrapperRef.current.getBoundingClientRect().height
      );
      setIframeHeight(height);
    }
  });

  useEffect(() => {
    const { origin } = window.location;
    setEmbedUrl(`${origin}/${locale}/embed/${configKey}`);
    setEmbedAEMUrl(`${origin}/api/embed-aem-ext/${locale}/${configKey}`);
  }, [configKey, locale]);

  const handleChange = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    setIsResponsive(e.target.value === "responsive");
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
      <Box m={4} sx={{ "& > * + *": { mt: 4 } }}>
        <div>
          <Typography component="div" variant="h5">
            <Trans id="publication.embed.iframe">Iframe Embed Code</Trans>
          </Typography>
          <Typography variant="caption">
            <Trans id="publication.embed.iframe.caption">
              Use this link to embed the chart into other webpages.
            </Trans>
          </Typography>
          <Flex sx={{ justifyContent: "flex-start", flexWrap: "wrap" }} mt={3}>
            <Radio
              checked={isResponsive}
              value="responsive"
              name="iframe-type"
              onChange={handleChange}
              label={t({
                id: "publication.embed.iframe.responsive",
                message: "Responsive iframe",
              })}
              warnMessage={t({
                id: "publication.embed.iframe.responsive.warn",
                message:
                  "For embedding visualizations in web pages without CMS support. The iframe will be responsive. The JavaScript part of the embed code ensures that the iframe always maintains the correct size.",
              })}
            />
            <Radio
              checked={!isResponsive}
              value="static"
              name="iframe-type"
              onChange={handleChange}
              label={t({
                id: "publication.embed.iframe.static",
                message: "Static iframe",
              })}
              warnMessage={t({
                id: "publication.embed.iframe.static.warn",
                message:
                  "For embedding visualizations in systems without Web Components or JavaScript support. (e.g. WordPress)",
              })}
            />
          </Flex>
          <CopyToClipboardTextInput
            content={`<iframe src="${embedUrl}" width="100%" height="${`${iframeHeight}px`}" style="border:0px #ffffff none;" name="visualize.admin.ch"></iframe>${isResponsive ? `<script type="text/javascript">!function(){window.addEventListener("message", function (e) { if (e.data.type === "${CHART_RESIZE_EVENT_TYPE}") { document.querySelectorAll("iframe").forEach((iframe) => { if (iframe.contentWindow === e.source) { iframe.style.height = e.data.height + "px"; } }); } })}();</script>` : ""}`}
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
      </Box>
    </TriggeredPopover>
  );
};

const Share = ({ configKey, locale }: PublishActionProps) => {
  const [shareUrl, setShareUrl] = useState("");
  const i18n = useI18n();

  useEffect(() => {
    setShareUrl(`${window.location.origin}/${locale}/v/${configKey}`);
  }, [configKey, locale]);

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
    </TriggeredPopover>
  );
};
