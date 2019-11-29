import { Trans } from "@lingui/macro";
import Downshift from "downshift";
import React from "react";
import { Box, Button, Flex, Link, Text } from "rebass";
import { Icon, IconName } from "../icons";
import { LocalizedLink } from "./links";
import { Input } from "@rebass/forms";

export const PublishActions = ({ configKey }: { configKey: string }) => {
  return (
    <Flex flexDirection={["column", "row"]}>
      <ImageDownload />
      <Share configKey={configKey} />
      <Embed configKey={configKey}></Embed>
    </Flex>
  );
};

export const Share = ({ configKey }: { configKey: string }) => {
  return (
    <Downshift>
      {({ getToggleButtonProps, getMenuProps, getItemProps, isOpen }) => (
        <div style={{ position: "relative" }}>
          <Button
            variant="publishAction"
            {...getToggleButtonProps()}
            color={isOpen ? "primary.active" : "primary.base"}
          >
            <Icon name="share"></Icon>
            <Text ml={3}>
              <Trans>Share</Trans>
            </Text>
          </Button>

          <div {...getMenuProps()}>
            {isOpen ? (
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
                      <Trans>Share: </Trans>
                    </Text>
                    <Flex color="primary.base">
                      <IconLink iconName="facebook" href="" disabled></IconLink>
                      <IconLink iconName="twitter" href="" disabled></IconLink>
                      <IconLink
                        iconName="mail"
                        href={`mailto:?subject=visualize.admin.ch&body=Here is a link to a visualization I created on visualize.admin.ch: https://dev.visualize.admin.ch/en/v/${configKey}`}
                      ></IconLink>
                    </Flex>
                  </Flex>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    height={48}
                  >
                    <Text variant="paragraph1" color="monochrome.700">
                      <Trans>Chart URL: </Trans>
                    </Text>
                    <Flex sx={{ color: "primary.base" }}>
                      <LocalizedLink
                        pathname={`/[locale]/v/${configKey}`}
                        passHref
                      >
                        <Link
                          sx={{
                            color: "primary.base",
                            textDecoration: "underline",
                            cursor: "pointer",
                            mr: 4
                          }}
                        >
                          {configKey}
                        </Link>
                      </LocalizedLink>
                      <Icon name="share"></Icon>
                    </Flex>
                  </Flex>
                </Box>
              </>
            ) : null}
          </div>
        </div>
      )}
    </Downshift>
  );
};

export const Embed = ({ configKey }: { configKey: string }) => {
  return (
    <Downshift>
      {({ getToggleButtonProps, getMenuProps, isOpen }) => (
        <div style={{ position: "relative" }}>
          <Button
            variant="publishAction"
            {...getToggleButtonProps()}
            color={isOpen ? "primary.active" : "primary.base"}
          >
            <Icon name="embed"></Icon>
            <Text ml={3}>
              <Trans>Embed</Trans>
            </Text>
          </Button>
          <div {...getMenuProps()}>
            {isOpen ? <EmbedMenu link={configKey} /> : null}
          </div>
        </div>
      )}
    </Downshift>
  );
};

export const EmbedMenu = ({ link }: { link: React.ReactNode }) => {
  return (
    <>
      <Box variant="publishActionOverlay" />
      <Box variant="publishActionModal">
        <Text variant="paragraph1" color="monochrome.700" mt={2}>
          <Trans>Embed: </Trans>
        </Text>

        <CopyToClipboardTextInput
          iFrameCode={`<iframe src="" style="border:0px #ffffff none;" name="visualize.admin.ch" scrolling="no" frameborder="1" marginheight="0px" marginwidth="0px" height="400px" width="600px" allowfullscreen></iframe>`}
        />
      </Box>
    </>
  );
};

const CopyToClipboardTextInput = ({ iFrameCode }: { iFrameCode: string }) => {
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
        onClick={e => {
          e.preventDefault();
          navigator.clipboard.writeText(iFrameCode);
        }}
        sx={{
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
        <Trans>Download Image</Trans>
      </Text>
    </Button>
  );
};

const IconLink = ({
  iconName,
  href,
  disabled = false
}: {
  iconName: IconName;
  href: string;
  disabled?: boolean;
}) => (
  <Link variant="iconLink" disabled href={href} target="_blank">
    <Icon name={iconName}></Icon>
  </Link>
);
