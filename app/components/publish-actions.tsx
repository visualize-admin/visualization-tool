import { t, Trans } from "@lingui/macro";
import { I18n } from "@lingui/react";
import { Box, Button, Flex, Input, Link, Text } from "theme-ui";
import * as clipboard from "clipboard-polyfill/text";
import Downshift, { DownshiftState, StateChangeOptions } from "downshift";
import {
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { Icon, IconName } from "../icons";
import { useLocale } from "../locales/use-locale";
import { IconLink } from "./links";

export const PublishActions = ({ configKey }: { configKey: string }) => {
  const locale = useLocale();

  return (
    <Flex sx={{ flexDirection: ["column", "row"] }}>
      {/* <ImageDownload /> */}
      <Share configKey={configKey} locale={locale} />
      <Embed configKey={configKey} locale={locale}></Embed>
    </Flex>
  );
};

const PopUp = ({
  triggerLabel,
  triggerIconName,
  children,
}: {
  triggerLabel: string | ReactNode;
  triggerIconName: IconName;
  children: ReactNode;
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
        <div style={{ position: "relative" }}>
          <Button
            variant="reset"
            sx={{
              display: "flex",
              alignItems: "center",
              color: isOpen ? "primaryActive" : "primary",
              bg: "transparent",
              border: "none",
              borderRadius: "default",
              mr: 4,
              mt: [2, 4],
              pr: 2,
              pl: 0,
              py: [2, 3],
              fontFamily: "body",
              fontSize: [3, 3, 3],
              transition: "background-color .2s",
              cursor: "pointer",
              ":hover": {
                color: "primaryHover",
              },
              ":active": {
                color: "primaryActive",
              },
              ":disabled": {
                cursor: "initial",
                color: "primaryDisabled",
              },
            }}
            {...getToggleButtonProps()}
          >
            <Icon name={triggerIconName}></Icon>
            <Text ml={3}>{triggerLabel}</Text>
          </Button>

          <div {...getMenuProps()}>{isOpen ? children : null}</div>
        </div>
      )}
    </Downshift>
  );
};

export const Share = ({ configKey, locale }: EmbedShareProps) => {
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => {
    setShareUrl(`${window.location.origin}/${locale}/v/${configKey}`);
  }, [configKey, locale]);
  return (
    <PopUp
      triggerLabel={<Trans id="button.share">Share</Trans>}
      triggerIconName="share"
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
            <Text variant="paragraph1" color="monochrome700">
              <Trans id="publication.popup.share">Share</Trans>:
            </Text>
            <Flex color="primary">
              <I18n>
                {({ i18n }) => (
                  <>
                    <IconLink
                      iconName="facebook"
                      title={i18n._(
                        t(
                          "publication.share.linktitle.facebook"
                        )`Share on Facebook`
                      )}
                      href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    ></IconLink>
                    <IconLink
                      iconName="twitter"
                      title={i18n._(
                        t(
                          "publication.share.linktitle.twitter"
                        )`Share on Twitter`
                      )}
                      href={`https://twitter.com/intent/tweet?url=${shareUrl}&via=bafuCH`}
                    ></IconLink>
                    <IconLink
                      iconName="mail"
                      title={i18n._(
                        t("publication.share.linktitle.mail")`Share via email`
                      )}
                      href={`mailto:?subject=${i18n._(
                        t("publication.share.mail.subject")`visualize.admin.ch`
                      )}&body=${i18n._(
                        t(
                          "publication.share.mail.body"
                        )`Here is a link to a visualization I created on visualize.admin.ch`
                      )}: ${shareUrl}`}
                    ></IconLink>
                  </>
                )}
              </I18n>
            </Flex>
          </Flex>
          <Box mt={2}>
            <Text variant="paragraph1" color="monochrome700">
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
      triggerLabel={<Trans id="button.embed">Embed</Trans>}
      triggerIconName="embed"
    >
      <>
        <PublishActionOverlay />
        <PublishActionModal>
          <Text variant="paragraph1" color="monochrome700" mt={2}>
            <Trans id="publication.embed.iframe">Iframe Embed Code: </Trans>
          </Text>

          <CopyToClipboardTextInput
            iFrameCode={`<iframe src="${embedIframeUrl}" style="border:0px #ffffff none;" name="visualize.admin.ch" scrolling="no" frameborder="1" marginheight="0px" marginwidth="0px" height="400px" width="600px" allowfullscreen></iframe>`}
          />
          <Text variant="paragraph1" color="monochrome700" mt={2}>
            <Trans id="publication.embed.AEM">
              Embed Code for AEM "External Application":{" "}
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

// export const ImageDownload = () => {
//   const handleClick = () => {
//     console.log("download image");
//   };
//   return (
//     <Button disabled variant="publishAction" onClick={handleClick}>
//       <Icon name="image"></Icon>
//       <Text ml={3}>
//         <Trans id="button.download.image">Download Image</Trans>
//       </Text>
//     </Button>
//   );
// };

// Presentational Components

// Modal
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
