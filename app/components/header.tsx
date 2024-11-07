import { t, Trans } from "@lingui/macro";
import { Box, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";

import { DataSourceMenu } from "@/components/data-source-menu";
import Flex from "@/components/flex";
import { HEADER_HEIGHT } from "@/components/header-constants";
import { LanguageMenu } from "@/components/language-menu";
import { SOURCE_OPTIONS } from "@/domain/datasource/constants";
import { useFlag } from "@/flags";
import { LoginMenu } from "@/login/components/login-menu";
import { useTheme } from "@/themes";

import { ThemeMenu } from "./theme-menu";

const useHeaderBorderStyles = makeStyles((theme: Theme) => ({
  root: {
    transformOrigin: "0 0",
    width: `100%`,
    borderBottomWidth: "4px",
    borderBottomStyle: "solid",
    borderBottomColor: theme.palette.brand?.main,
  },
}));

const HeaderBorder = () => {
  const theme = useTheme();
  const classes = useHeaderBorderStyles();

  if (!theme.palette.brand) return null;

  return <Box className={classes.root} />;
};

const useHeaderStyles = makeStyles<Theme, { isConfiguring: boolean }>(
  (theme) => ({
    wrapper: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      overflowY: "hidden",
      zIndex: 13,
    },
    content: {
      minHeight: HEADER_HEIGHT,
      maxWidth: ({ isConfiguring }) => (isConfiguring ? undefined : 1400),
      marginLeft: "auto",
      marginRight: "auto",
      color:
        theme.palette.component?.header?.foreground ?? theme.palette.grey[700],
      backgroundColor: theme.palette.component?.header?.background,
    },
  })
);

export const Header = ({
  pageType = "app",
  contentId,
}: {
  pageType?: "content" | "app";
  contentId: string | undefined;
}) => {
  const router = useRouter();
  const isConfiguring = router.pathname === "/create/[chartId]";
  const classes = useHeaderStyles({ isConfiguring });

  return (
    <Box
      className={pageType === "app" ? classes.wrapper : undefined}
      sx={{ backgroundColor: "background.paper" }}
    >
      <Flex
        component="header"
        className={classes.content}
        sx={{
          px: [0, 4, 4],
          pt: [0, 3, 3],
          flexDirection: ["column", "row"],
        }}
      >
        <Logo />
        <MetadataMenu contentId={contentId} />
      </Flex>
      <HeaderBorder />
    </Box>
  );
};

const MetadataMenu = ({ contentId }: { contentId?: string }) => {
  return (
    <Flex
      sx={{
        flexDirection: ["row", "column"],
        order: [1, 2],
        justifyContent: ["flex-end", "flex-start"],
        alignItems: ["center", "flex-end"],
        gap: 3,
        width: ["100%", "auto"],
        height: ["30px", "auto"],
        ml: [0, "auto"],
        pr: [3, 0],
        backgroundColor: ["grey.300", "transparent"],
      }}
    >
      <LanguageMenu contentId={contentId} />
      <LoginMenu />
    </Flex>
  );
};

export const Logo = () => {
  const isDebug = useFlag("debug");
  const { logos, palette } = useTheme();
  return (
    <Flex sx={{ order: [2, 1], alignItems: ["center", "flex-start"] }}>
      <NextLink href="/" passHref legacyBehavior>
        <Box
          component="a"
          role="figure"
          aria-labelledby="logo"
          sx={{ display: ["block", "none"], mx: 4, my: 4, width: 24 }}
        >
          <Image
            priority
            width={30}
            height={34}
            src={logos?.mobile}
            alt={t({ id: "header.logo.title" })}
          />
        </Box>
      </NextLink>

      <NextLink href="/" passHref legacyBehavior>
        <Box
          component="a"
          role="figure"
          aria-labelledby="logo"
          sx={{
            width: "calc(20rem + 4px)",
            display: ["none", "block"],
            borderRightWidth: "1px",
            borderRightStyle: "solid",
            borderRightColor: palette.component?.header?.border ?? "grey.300",
            color: "grey.900",
          }}
        >
          <Image
            priority
            width={224}
            height={56}
            src={logos?.desktop}
            alt={t({ id: "header.logo.title" })}
          />
        </Box>
      </NextLink>

      <Flex sx={{ flexDirection: "column", pl: [0, 6] }}>
        <NextLink href="/" passHref legacyBehavior>
          <Box component="a" sx={{ textDecoration: "none" }}>
            <Typography
              component="h1"
              variant="h4"
              sx={{ color: "grey.800", cursor: "pointer" }}
            >
              <Trans id="header.title" />
            </Typography>
          </Box>
        </NextLink>
        {SOURCE_OPTIONS.length > 1 && <DataSourceMenu />}
        {isDebug ? <ThemeMenu /> : null}
      </Flex>
    </Flex>
  );
};
