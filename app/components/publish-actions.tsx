import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  ButtonProps,
  Flex,
  FlexOwnProps,
  Input,
  Link,
  Text,
} from "theme-ui";
import * as clipboard from "clipboard-polyfill/text";
import Downshift, { DownshiftState, StateChangeOptions } from "downshift";
import {
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { Icon } from "../icons";
import { useLocale } from "../locales/use-locale";
import { IconLink } from "./links";
import { useI18n } from "../lib/use-i18n";
import Stack from "./Stack";

export const PublishActions = ({
  configKey,
  sx,
}: {
  configKey: string;
  sx: FlexOwnProps["sx"];
}) => {
  const locale = useLocale();

  return (
    <Stack direction={["column", "row"]} spacing={2} sx={sx}>
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
  renderTrigger: (toggleProps: ButtonProps) => React.ReactNode;
}) => {
  const [menuIsOpen, toggle] = useState(false);
  const handleOuterClick = () => {
    toggle(false);
  };
  const stateReducer = (
    state: DownshiftState<$FixMe>,
    changes: StateChangeOptions<$FixMe>
  ) => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.clickButton:
        toggle(!menuIsOpen);
        return {
          ...changes,
          isOpen: menuIsOpen,
        };
      case Downshift.stateChangeTypes.keyDownEnter:
      case Downshift.stateChangeTypes.clickItem:
        toggle(true);
        return {
          ...changes,
          isOpen: menuIsOpen,
        };
      case Downshift.stateChangeTypes.blurInput:
      case Downshift.stateChangeTypes.keyDownEscape:
        toggle(false);
        return {
          ...changes,
          isOpen: false,
        };
      default:
        return changes;
    }
  };

  return (
    <Downshift
      stateReducer={stateReducer}
      onOuterClick={handleOuterClick}
      isOpen={menuIsOpen}
    >
      {({ getToggleButtonProps, getMenuProps, isOpen }) => (
        <span style={{ position: "relative" }}>
          {renderTrigger(getToggleButtonProps())}
          <span {...getMenuProps()}>{isOpen ? children : null}</span>
        </span>
      )}
    </Downshift>
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
      renderTrigger={(props) => {
        return (
          <Button {...props}>
            <Icon name="linkExternal" />
            <Text>
              <Trans id="button.share">Share</Trans>
            </Text>
          </Button>
        );
      }}
    >
      <>
        <PublishActionOverlay />
        <PublishActionModal>
          <Flex
            sx={{
              height: 48,
              borderBottomWidth: "1px",
              borderBottomStyle: "solid",
              borderBottomColor: "monochrome500",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text as="div" variant="paragraph1" color="monochrome700">
              <Trans id="publication.popup.share">Share</Trans>:
            </Text>
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
          <Box mt={2}>
            <Text as="div" variant="paragraph1" color="monochrome700">
              <Trans id="publication.share.chart.url">Chart URL: </Trans>
            </Text>
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
        </PublishActionModal>
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
      renderTrigger={(toggleProps) => (
        <Button variant="primary" {...toggleProps}>
          <Icon name="embed" />
          <Text>
            <Trans id="button.embed">Embed</Trans>
          </Text>
        </Button>
      )}
    >
      <>
        <PublishActionOverlay />
        <PublishActionModal>
          <Text as="div" variant="paragraph1" color="monochrome700" mt={2}>
            <Trans id="publication.embed.iframe">Iframe Embed Code: </Trans>
          </Text>

          <CopyToClipboardTextInput
            iFrameCode={`<iframe src="${embedIframeUrl}" style="border:0px #ffffff none;" name="visualize.admin.ch" scrolling="no" frameborder="1" marginheight="0px" marginwidth="0px" height="400px" width="600px" allowfullscreen></iframe>`}
          />
          <Text as="div" variant="paragraph1" color="monochrome700" mt={2}>
            <Trans id="publication.embed.AEM">
              Embed Code for AEM &quot;External Application&quot;:{" "}
            </Trans>
          </Text>

          <CopyToClipboardTextInput iFrameCode={embedAEMUrl} />
        </PublishActionModal>
      </>
    </PopUp>
  );
};

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
  return (
    <Flex sx={{ alignItems: "stretch", height: 48 }} mt={1} mb={2}>
      <Input
        sx={{
          color: "monochrome700",
          px: 2,
          fontFamily: "body",
          fontSize: 4,
          minWidth: 160,
          overflowX: "auto",
          borderTopLeftRadius: "default",
          borderBottomLeftRadius: "default",
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "monochrome500",
        }}
        type="text"
        value={iFrameCode}
        readOnly={true}
      ></Input>

      <Button
        variant="reset"
        onMouseOver={() => toggleTooltip(true)}
        onMouseUp={() =>
          updateTooltipContent(<Trans id="button.hint.copied">copied!</Trans>)
        }
        onMouseLeave={handleMouseLeave}
        onClick={(e) => handleClick(e, iFrameCode)}
        sx={{
          color: "monochrome600",
          bg: "monochrome200",
          position: "relative",

          borderTopRightRadius: "default",
          borderBottomRightRadius: "default",
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,

          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "monochrome500",
          borderLeft: "none",

          cursor: "pointer",

          ":hover": {
            bg: "monochrome300",
            color: "monochrome700",
          },
          ":active": {
            bg: "monochrome400",
            color: "monochrome800",
          },
          ":disabled": {
            cursor: "initial",
            color: "monochrome300",
          },
        }}
      >
        <Icon name="copy" size={16} />

        {showTooltip && <ActionTooltip>{tooltipContent}</ActionTooltip>}
      </Button>
    </Flex>
  );
};

const PublishActionModal = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      position: "fixed",
      bottom: 4,
      left: 4,
      right: 4,
      zIndex: 12,
      py: 2,
      px: 4,
      bg: "monochrome100",
      boxShadow: "primary",
      borderRadius: "default",

      "@media screen and (min-width: 62em)": {
        mt: 2,
        bottom: "unset",
        left: "unset",
        right: "unset",
        position: "absolute",
        minWidth: 340,
        // maxWidth: 340,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "monochrome500",
      },
    }}
  >
    {children}
  </Box>
);
const PublishActionOverlay = () => (
  <Box
    sx={{
      zIndex: 10,
      display: ["block", "none"],
      bg: "monochrome900",
      opacity: 0.25,
      width: "100vw",
      height: "100vh",
      position: "fixed",
      top: 0,
      left: 0,
      pointerEvents: "none",
    }}
  />
);

// Form
const ActionTooltip = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      position: "absolute",
      bottom: "100%",
      left: "50%",
      transform: "translate3d(-50%, 0, 0)",

      bg: "monochrome700",
      borderRadius: "default",
      color: "monochrome100",

      fontSize: 1,
      textAlign: "center",
      whiteSpace: "nowrap",

      px: 2,
      py: 1,
      mx: 0,
      mb: "calc(0.5rem + 2px)",

      zIndex: 13,
      pointerEvents: "none",
      filter: "0 3px 5px 0 rgba(0,0,0,0.90)",

      "&::after": {
        content: "''",
        position: "absolute",
        width: 0,
        height: 0,
        border: "0.5rem solid transparent",
        borderTopColor: "monochrome700",
        left: "50%",
        top: "100%",
        zIndex: -1,
        transform: "translateX(-50%)",
      },
    }}
  >
    {children}
  </Box>
);
