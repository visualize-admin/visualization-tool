import { Trans, t } from "@lingui/macro";
import { Input } from "@rebass/forms";
import Downshift, { DownshiftState, StateChangeOptions } from "downshift";
import React, { ReactNode, useEffect, useState } from "react";
import { Box, Button, Flex, Link, Text } from "rebass";
import { Item } from "vega";
import { Icon, IconName } from "../icons";
import { useLocale } from "../lib/use-locale";
import { IconLink } from "./links";
import { I18n } from "@lingui/react";
import * as clipboard from "clipboard-polyfill";
export const PublishActions = ({ configKey }: { configKey: string }) => {
  const locale = useLocale();

  return (
    <Flex flexDirection={["column", "row"]}>
      {/* <ImageDownload /> */}
      <Share configKey={configKey} locale={locale} />
      <Embed configKey={configKey} locale={locale}></Embed>
    </Flex>
  );
};

const PopUp = ({
  triggerLabel,
  triggerIconName,
  children
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
    state: DownshiftState<Item>,
    changes: StateChangeOptions<Item>
  ) => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.clickButton:
        toggle(!menuIsOpen);
        return {
          ...changes,
          isOpen: menuIsOpen
        };
      case Downshift.stateChangeTypes.keyDownEnter:
      case Downshift.stateChangeTypes.clickItem:
        toggle(true);
        return {
          ...changes,
          isOpen: menuIsOpen
        };
      case Downshift.stateChangeTypes.blurInput:
      case Downshift.stateChangeTypes.keyDownEscape:
        toggle(false);
        return {
          ...changes,
          isOpen: false
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
            variant="publishAction"
            {...getToggleButtonProps()}
            color={isOpen ? "primary.active" : "primary.base"}
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
        <Box variant="publishActionOverlay" />
        <Box variant="publishActionModal">
          <Flex
            justifyContent="space-between"
            alignItems="center"
            height={48}
            sx={{
              borderBottomWidth: "1px",
              borderBottomStyle: "solid",
              borderBottomColor: "monochrome.500"
            }}
          >
            <Text variant="paragraph1" color="monochrome.700">
              <Trans id="publication.popup.share">Share</Trans>:
            </Text>
            <Flex color="primary.base">
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
            <Text variant="paragraph1" color="monochrome.700">
              <Trans id="publication.share.chart.url">Chart URL: </Trans>
            </Text>
            <Box my={1} sx={{ color: "primary.base" }}>
              <Link
                href={shareUrl}
                sx={{
                  color: "primary.base",
                  textDecoration: "underline",
                  cursor: "pointer",
                  mr: 4
                }}
              >
                {shareUrl}
              </Link>
              {/* <Icon name="share"></Icon> */}
            </Box>
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
    setEmbedAEMUrl(`${window.location.origin}/api/embed-aem-ext/${locale}/${configKey}`);
  }, [configKey, locale]);

  return (
    <PopUp
      triggerLabel={<Trans id="button.embed">Embed</Trans>}
      triggerIconName="embed"
    >
      <>
        <Box variant="publishActionOverlay" />
        <Box variant="publishActionModal">
          <Text variant="paragraph1" color="monochrome.700" mt={2}>
            <Trans id="publication.embed.iframe">Iframe Embed Code: </Trans>
          </Text>

          <CopyToClipboardTextInput
            iFrameCode={`<iframe src="${embedIframeUrl}" style="border:0px #ffffff none;" name="visualize.admin.ch" scrolling="no" frameborder="1" marginheight="0px" marginwidth="0px" height="400px" width="600px" allowfullscreen></iframe>`}
          />
          <Text variant="paragraph1" color="monochrome.700" mt={2}>
            <Trans id="publication.embed.AEM">
              Embed Code for AEM "External Application":{" "}
            </Trans>
          </Text>

          <CopyToClipboardTextInput iFrameCode={embedAEMUrl} />
        </Box>
      </>
    </PopUp>
  );
};

const CopyToClipboardTextInput = ({ iFrameCode }: { iFrameCode: string }) => {
  const [showTooltip, toggleTooltip] = useState(false);
  const [tooltipContent, updateTooltipContent] = useState(
    <Trans>click to copy</Trans>
  );

  const handleMouseLeave = () => {
    toggleTooltip(false);
    updateTooltipContent(<Trans>click to copy</Trans>);
  };
  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    iFrameCode: string
  ) => {
    e.preventDefault();
    clipboard.writeText(iFrameCode);
  };
  return (
    <Flex alignItems="stretch" mt={1} mb={2} height={48}>
      <Input
        sx={{
          color: "monochrome.700",
          px: 2,
          fontFamily: "frutigerRegular",
          fontSize: 4,
          minWidth: 160,
          overflowX: "scroll",
          borderTopLedftRadius: "default",
          borderBottomLedftRadius: "default",
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "monochrome.500"
        }}
        type="text"
        value={iFrameCode}
        readOnly={true}
      ></Input>

      <Button
        variant="iconButton"
        onMouseOver={() => toggleTooltip(true)}
        onMouseDown={() => updateTooltipContent(<Trans>copied!</Trans>)}
        onMouseLeave={handleMouseLeave}
        onClick={e => handleClick(e, iFrameCode)}
        sx={{
          position: "relative",
          borderTopRightRadius: "default",
          borderBottomRightRadius: "default",
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "monochrome.500",
          borderLeft: "none"
        }}
      >
        <Icon name="copy" size={16} />

        {showTooltip && (
          <Box
            sx={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translate3d(-50%, 0, 0)",

              bg: "monochrome.700",
              borderRadius: "default",
              color: "monochrome.100",

              fontSize: 1,
              textAlign: "center",
              whiteSpace: "nowrap",

              width: 80,
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
                borderTopColor: "monochrome.700",
                left: "50%",
                top: "100%",
                zIndex: -1,
                transform: "translateX(-50%)"
              }
            }}
          >
            {tooltipContent}
          </Box>
        )}
      </Button>
    </Flex>
  );
};

export const ImageDownload = () => {
  const handleClick = () => {
    console.log("download image");
  };
  return (
    <Button disabled variant="publishAction" onClick={handleClick}>
      <Icon name="image"></Icon>
      <Text ml={3}>
        <Trans id="button.download.image">Download Image</Trans>
      </Text>
    </Button>
  );
};
