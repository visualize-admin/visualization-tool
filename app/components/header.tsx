import { TopBar } from "@interactivethings/swiss-federal-ci/dist/components";
import { Header as SwissFederalCiHeader } from "@interactivethings/swiss-federal-ci/dist/components/pages-router";
import { Box, NativeSelect } from "@mui/material";
import { useRouter } from "next/router";

import { DataSourceMenu } from "@/components/data-source-menu";
import { __HEADER_HEIGHT_CSS_VAR } from "@/components/header-constants";
import contentRoutes from "@/content-routes.json";
import { SOURCE_OPTIONS } from "@/domain/datasource/constants";
import localeConfig from "@/locales/locales.json";
import { useLocale } from "@/locales/use-locale";
import { LoginMenu } from "@/login/components/login-menu";
import { useResizeObserver } from "@/utils/use-resize-observer";

export const Header = ({
  contentId,
  hideLogo,
  extendTopBar,
}: {
  contentId?: string;
  hideLogo?: boolean;
  extendTopBar?: boolean;
}) => {
  const currentLocale = useLocale();
  const { push, pathname, query } = useRouter();
  const [ref] = useResizeObserver<HTMLDivElement>(({ height }) => {
    if (height) {
      document.documentElement.style.setProperty(
        __HEADER_HEIGHT_CSS_VAR,
        `${height}px`
      );
    }
  });

  const alternates =
    contentId && contentId in contentRoutes
      ? (
          contentRoutes as {
            [k: string]: { [k: string]: { title: string; path: string } };
          }
        )[contentId]
      : undefined;

  return (
    <div ref={ref} style={{ zIndex: 1 }}>
      <TopBar
        ContentWrapperProps={{
          sx: {
            justifyContent: "space-between",
            ...(extendTopBar
              ? { maxWidth: "unset !important", px: "48px !important" }
              : {}),
          },
        }}
      >
        {SOURCE_OPTIONS.length > 1 && <DataSourceMenu />}
        <Box display="flex" alignItems="center" gap={3} marginLeft="auto">
          <LoginMenu />
          <NativeSelect
            value={currentLocale}
            onChange={(e) => {
              const locale = e.currentTarget.value;
              const alternate = alternates?.[locale];

              if (alternate) {
                push(alternate.path, undefined, { locale: false });
              } else {
                push({ pathname, query }, undefined, { locale });
              }
            }}
            sx={{
              padding: 0,
              border: "none !important",
              backgroundColor: "transparent",
              color: "white !important",

              "&:hover": {
                backgroundColor: "transparent",
                color: (t) => `${t.palette.cobalt[100]} !important`,
              },
            }}
          >
            {localeConfig.locales.map((locale) => (
              <option key={locale} value={locale}>
                {locale.toUpperCase()}
              </option>
            ))}
          </NativeSelect>
        </Box>
      </TopBar>
      {hideLogo ? null : (
        <SwissFederalCiHeader
          longTitle="visualize.admin.ch"
          shortTitle="visualize"
          rootHref="/"
          sx={{ backgroundColor: "white" }}
        />
      )}
    </div>
  );
};
