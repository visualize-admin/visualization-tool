import { t, Trans } from "@lingui/macro";
import {
  Box,
  BoxProps,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Input,
  Link,
  Popover,
  PopoverProps,
  Radio,
  RadioGroup,
  RadioGroupProps,
  Theme,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/material";
import { makeStyles } from "@mui/styles";
import * as clipboard from "clipboard-polyfill/text";
import {
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useEffect,
  useState,
} from "react";

import Flex from "@/components/flex";
import { IconLink } from "@/components/links";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { useEmbedOptions } from "@/utils/embed";
import { useI18n } from "@/utils/use-i18n";

export const PublishActions = ({
  configKey,
  sx,
}: {
  configKey: string;
  sx?: BoxProps["sx"];
}) => {
  const locale = useLocale();

  return (
    <Stack direction="row" spacing={2} sx={sx}>
      <Share configKey={configKey} locale={locale} />
      <Embed configKey={configKey} locale={locale} />
    </Stack>
  );
};

const TriggeredPopover = ({
  children,
  renderTrigger,
  popoverProps,
}: {
  children: ReactNode;
  renderTrigger: (
    setAnchorEl: (el: HTMLElement | undefined) => void
  ) => React.ReactNode;
  popoverProps: Omit<PopoverProps, "open" | "anchorEl" | "onClose">;
}) => {
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

export const Share = ({ configKey, locale }: EmbedShareProps) => {
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
            variant="outlined"
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
            {/* <Icon name="share"></Icon> */}
          </Box>
        </Box>
      </Box>
    </TriggeredPopover>
  );
};

type EmbedShareProps = {
  configKey: string;
  locale: string;
};

export const Embed = ({ configKey, locale }: EmbedShareProps) => {
  const [embedIframeUrl, setEmbedIframeUrl] = useState("");
  const [embedAEMUrl, setEmbedAEMUrl] = useState("");
  const [embedOptions, setEmbedOptions] = useEmbedOptions();
  const handleChange: RadioGroupProps["onChange"] = (_ev, value) => {
    if (value === "minimal") {
      setEmbedOptions({
        showDatasetTitle: false,
        showDownload: false,
        showLandingPage: false,
        showSource: true,
        showMetadata: false,
        showSparqlQuery: false,
        showDatePublished: false,
        showTableSwitch: false,
      });
    } else {
      setEmbedOptions({
        showDatasetTitle: true,
        showDownload: true,
        showLandingPage: true,
        showSource: true,
        showSparqlQuery: true,
        showDatePublished: true,
        showTableSwitch: true,
        showMetadata: true,
      });
    }
  };
  const isMinimal = embedOptions.showDatasetTitle === false;
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
              value={
                embedOptions.showDatasetTitle === false ? "minimal" : "standard"
              }
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
                    {/* <Typography variant="caption" display="block">
                      <Trans id="publication.embed.style.standard.caption">
                        Chart, download the data links, attribution etc...
                      </Trans>
                    </Typography> */}
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
                    {/* <Typography variant="caption" display="block">
                      <Trans id="publication.embed.style.minimal.caption">
                        Only the chart and a link for more information.
                      </Trans>
                    </Typography> */}
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
            iFrameCode={`<iframe src="${embedIframeUrl}" style="border:0px #ffffff none;" name="visualize.admin.ch" scrolling="no" frameborder="1" marginheight="0px" marginwidth="0px" height="${iFrameHeight}" width="600px" allowfullscreen></iframe>`}
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

          <CopyToClipboardTextInput iFrameCode={embedAEMUrl} />
        </div>
      </Box>
    </TriggeredPopover>
  );
};

const useCopyToClipboardTextInputStyles = makeStyles((theme: Theme) => ({
  input: {
    color: theme.palette.grey[700],
    padding: `${theme.spacing(0)} ${theme.spacing(2)}`,
    flexGrow: 1,
    fontSize: "1rem",
    minWidth: 160,
    overflowX: "auto",
    borderTopLeftRadius: "default",
    borderBottomLeftRadius: "default",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: theme.palette.grey[500],
  },
  button: {
    color: theme.palette.grey[600],
    backgroundColor: theme.palette.grey[200],
    position: "relative",

    borderTopRightRadius: "default",
    borderBottomRightRadius: "default",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    width: 48,
    minWidth: 48,

    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: theme.palette.grey[500],
    borderLeft: "none",

    cursor: "pointer",

    "&:hover": {
      backgroundColor: theme.palette.grey[300],
      color: theme.palette.grey[700],
    },
    "&:active": {
      backgroundColor: theme.palette.grey[400],
      color: theme.palette.grey[800],
    },
    "&:disabled": {
      cursor: "initial",
      color: theme.palette.grey[300],
    },
  },
}));

const CopyToClipboardTextInput = ({ iFrameCode }: { iFrameCode: string }) => {
  const [showTooltip, toggleTooltip] = useState(false);
  const [tooltipContent, updateTooltipContent] = useState(
    <Trans id="button.hint.click.to.copy">click to copy</Trans>
  );

  const handleMouseLeave = () => {
    toggleTooltip(false);
    updateTooltipContent(
      <Trans id="button.hint.click.to.copy">click to copy</Trans>
    );
  };
  const handleClick = (
    e: ReactMouseEvent<HTMLButtonElement, MouseEvent>,
    iFrameCode: string
  ) => {
    e.preventDefault();
    clipboard.writeText(iFrameCode);
  };
  const classes = useCopyToClipboardTextInputStyles();
  return (
    <Flex sx={{ alignItems: "stretch", height: 48 }} mt={1} mb={2}>
      <Input
        className={classes.input}
        type="text"
        value={iFrameCode}
        readOnly={true}
      ></Input>

      <Button
        variant="text"
        onMouseOver={() => toggleTooltip(true)}
        onMouseUp={() =>
          updateTooltipContent(<Trans id="button.hint.copied">copied!</Trans>)
        }
        onMouseLeave={handleMouseLeave}
        onClick={(e) => handleClick(e, iFrameCode)}
        className={classes.button}
      >
        <Icon name="copy" size={16} />

        {showTooltip && <ActionTooltip>{tooltipContent}</ActionTooltip>}
      </Button>
    </Flex>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  actionTooltip: {
    position: "absolute",
    bottom: "100%",
    left: "50%",
    transform: "translate3d(-50%, 0, 0)",

    backgroundColor: theme.palette.grey[700],
    borderRadius: 1.5,
    color: theme.palette.grey[100],

    fontSize: "0.625rem",
    textAlign: "center",
    whiteSpace: "nowrap",

    padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
    marginBottom: "calc(0.5rem + 2px)",

    zIndex: 13,
    pointerEvents: "none",
    filter: "0 3px 5px 0 rgba(0,0,0,0.90)",

    "&::after": {
      content: "''",
      position: "absolute",
      width: 0,
      height: 0,
      border: "0.5rem solid transparent",
      borderTopColor: theme.palette.grey[700],
      left: "50%",
      top: "100%",
      zIndex: -1,
      transform: "translateX(-50%)",
    },
  },
}));

// Form
const ActionTooltip = ({ children }: { children: ReactNode }) => {
  const classes = useStyles();
  return <div className={classes.actionTooltip}>{children}</div>;
};
