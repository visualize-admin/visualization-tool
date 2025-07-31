import { TopBar } from "@interactivethings/swiss-federal-ci/dist/components";
import { Header as SwissFederalCiHeader } from "@interactivethings/swiss-federal-ci/dist/components/pages-router";
import { useRouter } from "next/router";

import { DataSourceMenu } from "@/components/data-source-menu";
import { Flex } from "@/components/flex";
import { Select } from "@/components/form";
import { __HEADER_HEIGHT_CSS_VAR } from "@/components/header-constants";
import contentRoutes from "@/content-routes.json";
import { SOURCE_OPTIONS } from "@/domain/data-source/constants";
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
        <Flex alignItems="center" gap={3} marginLeft="auto">
          <LoginMenu />
          <Select
            id="localeSwitcherSelect"
            variant="standard"
            value={currentLocale}
            onChange={(e) => {
              const locale = e.target.value as string;
              const alternate = alternates?.[locale];

              if (alternate) {
                push(alternate.path, undefined, { locale: false });
              } else {
                push({ pathname, query }, undefined, { locale });
              }
            }}
            options={localeConfig.locales.map((locale) => ({
              label: locale.toUpperCase(),
              value: locale,
            }))}
            sortOptions={false}
            sx={{
              width: "fit-content",
              color: "white !important",

              "&:hover": {
                color: "cobalt.100",
              },

              "& .MuiSelect-select": {
                "&:hover, &[aria-expanded='true']": {
                  backgroundColor: "transparent !important",
                },
              },
            }}
          />
        </Flex>
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
