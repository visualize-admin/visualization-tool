import {
  BaseLocaleSwitcher,
  TopBar,
} from "@interactivethings/swiss-federal-ci/dist/components";
import { Header as SwissFederalCiHeader } from "@interactivethings/swiss-federal-ci/dist/components/pages-router";
import { Box } from "@mui/material";
import { useRouter } from "next/router";

import { DataSourceMenu } from "@/components/data-source-menu";
import { __HEADER_HEIGHT_CSS_VAR } from "@/components/header-constants";
import contentRoutes from "@/content-routes.json";
import { SOURCE_OPTIONS } from "@/domain/datasource/constants";
import localeConfig from "@/locales/locales.json";
import { useLocale } from "@/locales/use-locale";
import { LoginMenu } from "@/login/components/login-menu";
import { useResizeObserver } from "@/utils/use-resize-observer";

export const Header = ({ contentId }: { contentId?: string }) => {
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
      <TopBar ContentWrapperProps={{ sx: { justifyContent: "space-between" } }}>
        {SOURCE_OPTIONS.length > 1 && <DataSourceMenu />}
        <Box display="flex" alignItems="center" gap={3} marginLeft="auto">
          <LoginMenu />
          <BaseLocaleSwitcher
            activeLocale={currentLocale}
            locales={localeConfig.locales}
            onLocaleChange={(locale: string) => {
              const alternate = alternates?.[locale];

              if (alternate) {
                push(alternate.path, undefined, { locale: false });
              } else {
                push(`${pathname}?${query}`, undefined, { locale });
              }
            }}
          />
        </Box>
      </TopBar>
      <SwissFederalCiHeader
        longTitle="visualize.admin.ch"
        shortTitle="visualize"
        rootHref="/"
        sx={{ backgroundColor: "white" }}
      />
    </div>
  );
};
