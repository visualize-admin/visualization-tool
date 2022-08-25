import { t, Trans } from "@lingui/macro";
import {
  Box,
  BoxProps,
  Button,
  Divider,
  Input,
  Link,
  Popover,
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
      <Embed configKey={configKey} locale={locale}></Embed>
    </Stack>
  );
};

const PopUp = ({
  children,
  renderTrigger,
}: {
  children: ReactNode;
  renderTrigger: (
    setAnchorEl: (el: HTMLElement | undefined) => void
  ) => React.ReactNode;
}) => {
  const [anchorEl, setAnchorEl] = useState<Element | undefined>();

  return (
    <>
      {renderTrigger(setAnchorEl)}
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 48,
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={() => setAnchorEl(undefined)}
      >
        <Box m={4}>{children}</Box>
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
    <PopUp
      renderTrigger={(setAnchorEl) => {
        return (
          <Button
            onClick={(ev) => {
              setAnchorEl(ev.target as HTMLElement);
            }}
            size="large"
            startIcon={<Icon name="linkExternal" />}
          >
            <Trans id="button.share">Share</Trans>
          </Button>
        );
      }}
    >
      <>
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
      </>
    </PopUp>
  );
};

type EmbedShareProps = {
  configKey: string;
  locale: string;
};

export const Embed = ({ configKey, locale }: EmbedShareProps) => {
  const [embedIframeUrl, setEmbedIframeUrl] = useState("");
  const [embedAEMUrl, setEmbedAEMUrl] = useState("");
  useEffect(() => {
    setEmbedIframeUrl(`${window.location.origin}/${locale}/embed/${configKey}`);
    setEmbedAEMUrl(
      `${window.location.origin}/api/embed-aem-ext/${locale}/${configKey}`
    );
  }, [configKey, locale]);

  return (
    <PopUp
      renderTrigger={(setAnchorEl) => (
        <Button
          startIcon={<Icon name="embed" />}
          size="large"
          variant="contained"
          color="primary"
          onClick={(ev) => setAnchorEl(ev.currentTarget)}
        >
          <Trans id="button.embed">Embed</Trans>
        </Button>
      )}
    >
      <Typography component="div" variant="body1" color="grey.700" mt={2}>
        <Trans id="publication.embed.iframe">Iframe Embed Code: </Trans>
      </Typography>

      <CopyToClipboardTextInput
        iFrameCode={`<iframe src="${embedIframeUrl}" style="border:0px #ffffff none;" name="visualize.admin.ch" scrolling="no" frameborder="1" marginheight="0px" marginwidth="0px" height="400px" width="600px" allowfullscreen></iframe>`}
      />
      <Typography component="div" variant="body1" color="grey.700" mt={2}>
        <Trans id="publication.embed.AEM">
          Embed Code for AEM &quot;External Application&quot;:{" "}
        </Trans>
      </Typography>

      <CopyToClipboardTextInput iFrameCode={embedAEMUrl} />
    </PopUp>
  );
};

const useCopyToClipboardTextInputStyles = makeStyles((theme: Theme) => ({
  input: {
    color: "grey.700",
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
    borderColor: "grey.500",
  },
  button: {
    color: "grey.600",
    backgroundColor: "grey.200",
    position: "relative",

    borderTopRightRadius: "default",
    borderBottomRightRadius: "default",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    width: 48,
    minWidth: 48,

    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "grey.500",
    borderLeft: "none",

    cursor: "pointer",

    ":hover": {
      backgroundColor: "grey.300",
      color: "grey.700",
    },
    ":active": {
      backgroundColor: "grey.400",
      color: "grey.800",
    },
    ":disabled": {
      cursor: "initial",
      color: "grey.300",
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
        sx={{}}
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

    backgroundColor: "grey.700",
    borderRadius: 1.5,
    color: "grey.100",

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
      borderTopColor: "grey.700",
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
