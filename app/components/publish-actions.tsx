import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Link,
  Popover,
  PopoverProps,
  Radio,
  RadioGroup,
  RadioGroupProps,
  Stack,
  Typography,
} from "@mui/material";
import { ReactNode, useEffect, useState } from "react";

import { CopyToClipboardTextInput } from "@/components/copy-to-clipboard-text-input";
import Flex from "@/components/flex";
import { IconLink } from "@/components/links";
import { Icon } from "@/icons";
import { useEmbedOptions } from "@/utils/embed";
import { useI18n } from "@/utils/use-i18n";

type PublishActionProps = {
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

const Embed = ({ configKey, locale }: PublishActionProps) => {
  const [embedIframeUrl, setEmbedIframeUrl] = useState("");
  const [embedAEMUrl, setEmbedAEMUrl] = useState("");
  const [embedOptions, setEmbedOptions] = useEmbedOptions();
  const handleChange: RadioGroupProps["onChange"] = (_ev, value) => {
    if (value === "minimal") {
      setEmbedOptions({
        showDownload: false,
        showMetadata: false,
        showDatePublished: false,
      });
    } else {
      setEmbedOptions({
        showDownload: true,
        showMetadata: true,
        showDatePublished: true,
      });
    }
  };
  const isMinimal = embedOptions.showDownload === false;
  const iFrameHeight = isMinimal ? "560px" : "640px";

  useEffect(() => {
    const embedOptionsParam = encodeURIComponent(JSON.stringify(embedOptions));
    setEmbedIframeUrl(
      `${window.location.origin}/${locale}/embed/${configKey}?embedOptions=${embedOptionsParam}`
    );
    setEmbedAEMUrl(
      `${window.location.origin}/api/embed-aem-ext/${locale}/${configKey}?embedOptions=${embedOptionsParam}`
    );
  }, [configKey, locale, embedOptions]);

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
      renderTrigger={(setAnchorEl) => (
        <Button
          startIcon={<Icon name="embed" size={16} />}
          variant="contained"
          color="primary"
          onClick={(ev) => setAnchorEl(ev.currentTarget)}
        >
          <Trans id="button.embed">Embed</Trans>
        </Button>
      )}
    >
      <Box m={4} sx={{ "& > * + *": { mt: 4 } }}>
        <div>
          <FormControl>
            <Typography variant="h5" gutterBottom>
              Embed style
            </Typography>

            <RadioGroup
              aria-labelledby="published-chart-embed-options"
              name="controlled-radio-buttons-group"
              value={isMinimal ? "minimal" : "standard"}
              onChange={handleChange}
            >
              <FormControlLabel
                value="standard"
                control={<Radio />}
                sx={{ alignItems: "flex-start", mb: 2 }}
                label={
                  <div>
                    <Typography variant="body2" display="block">
                      <Trans id="publication.embed.style.standard">
                        Standard
                      </Trans>
                    </Typography>
                    <Typography variant="caption" display="block">
                      <Trans id="publication.embed.style.standard.caption">
                        Provides metadata and download links for the dataset
                      </Trans>
                    </Typography>
                  </div>
                }
                disableTypography
              />
              <FormControlLabel
                value="minimal"
                control={<Radio />}
                sx={{ alignItems: "flex-start" }}
                label={
                  <div>
                    <Typography variant="body2" display="block">
                      <Trans id="publication.embed.style.minimal">
                        Minimal
                      </Trans>
                    </Typography>
                    <Typography variant="caption" display="block">
                      <Trans id="publication.embed.style.minimal.caption">
                        Chart only with link to full information on
                        visualize.admin.ch.
                      </Trans>
                    </Typography>
                  </div>
                }
                disableTypography
              />
            </RadioGroup>
          </FormControl>
        </div>
        <div>
          <Typography component="div" variant="h5">
            <Trans id="publication.embed.iframe">Iframe Embed Code</Trans>
          </Typography>
          <Typography variant="caption">
            <Trans id="publication.embed.iframe.caption">
              Use this link to embed the chart into other webpages.
            </Trans>
          </Typography>
          <CopyToClipboardTextInput
            content={`<iframe src="${embedIframeUrl}" style="border:0px #ffffff none; max-width: 100%" name="visualize.admin.ch" scrolling="no" frameborder="1" marginheight="0px" marginwidth="0px" height="${iFrameHeight}" width="600px" allowfullscreen></iframe>`}
          />
        </div>

        <div>
          <Typography component="div" variant="h5">
            <Trans id="publication.embed.AEM">
              Embed Code for AEM &quot;External Application&quot;
            </Trans>
          </Typography>
          <Typography variant="caption">
            <Trans id="publication.embed.AEM.caption">
              Use this link to embed the chart into Adobe Experience Manager
              assets.
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
      <Box m={4}>
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
          <Box my={1} sx={{ color: "primary" }}>
            <Link
              href={shareUrl}
              sx={{
                color: "primary",
                textDecoration: "underline",
                cursor: "pointer",
                mr: 4,
              }}
            >
              {shareUrl}
            </Link>
          </Box>
        </Box>
      </Box>
    </TriggeredPopover>
  );
};
