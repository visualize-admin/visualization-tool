import React from "react";
import { Box, Button, Text, Flex, Grid } from "@theme-ui/components";
import { HintRed } from "../hint";
import { LocalizedLink } from "../links";
import { buildExecutionContext } from "graphql/execution/execute";
import { IconArrowDown } from "../../icons/ic-arrow-down";
import { IconX } from "../../icons/ic-x";
import { IconY } from "../../icons/ic-y";
import { IconScatterplot } from "../../icons/ic-scatterplot";
import { IconBarChart } from "../../icons/ic-bar-chart";
import { IconTable } from "../../icons/ic-table";
import { IconAreaChart } from "../../icons/ic-area-chart";
import { IconSegment } from "../../icons/ic-segment";
import { IconFilter } from "../../icons/ic-filter";
import { IconLineChart } from "../../icons/ic-line-chart";
import { IconColumnChart } from "../../icons/ic-column-chart";
import { IconText } from "../../icons/ic-text";

export const Intro = ({
  hint,
  title,
  teaser,
  buttonLabel
}: {
  hint: string;
  title: string;
  teaser: string;
  buttonLabel: string;
}) => {
  return (
    <Box sx={{ maxWidth: 1024, m: "0 auto" }}>
      <Box sx={{ mx: 4, my: 6 }}>
        <HintRed iconName="hintWarning">{hint}</HintRed>
      </Box>
      <Box
        sx={{
          // backgroundImage: [
          //   'url("chart_icons_s.jpg")',
          //   'url("chart_icons.jpg")',
          //   'url("chart_icons.jpg")'
          // ],
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          mx: 4,
          // pt: ["62px", "88px"],
          pb: [7, 8]
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(12, minmax(24px, 1fr))",
            gridTemplateRows: "repeat(5, minmax(60px, 1fr))",
            justifyItems: "center",
            alignItems: "center"
          }}
        >
          <Box sx={{ gridColumnStart: 1, gridRowStart: 1 }}>
            <IconX color="#375172" size={24} />
          </Box>
          <Box sx={{ gridColumnStart: 5, gridRowStart: 1 }}>
            <IconY color="#8D5A54" size={24} />
          </Box>
          <Box sx={{ gridColumnStart: 7, gridRowStart: 2 }}>
            <IconColumnChart color="#008F85" size={24} />
          </Box>
          <Box sx={{ gridColumnStart: 3, gridRowStart: 2 }}>
            <IconScatterplot color="#F38B3C" size={24} />
          </Box>
          <Box sx={{ gridColumnStart: 9, gridRowStart: 1 }}>
            <IconTable color="#928D88" size={24} />
          </Box>
          <Box sx={{ gridColumnStart: 12, gridRowStart: 2 }}>
            <IconScatterplot color="#32B8DF" size={24} />
          </Box>
          <Box sx={{ gridColumnStart: 2, gridRowStart: 3 }}>
            <IconAreaChart color="#008F85" size={24} />
          </Box>
          <Box sx={{ gridColumnStart: 11, gridRowStart: 3 }}>
            <IconSegment color="#8D5A54" size={24} />
          </Box>
          <Box sx={{ gridColumnStart: 1, gridRowStart: 4 }}>
            <IconFilter color="#375172" size={24} />
          </Box>
          <Box sx={{ gridColumnStart: 12, gridRowStart: 4 }}>
            <IconText color="#008F85" size={24} />
          </Box>
          <Box sx={{ gridColumnStart: 3, gridRowStart: 5 }}>
            <IconLineChart color="#C97146" size={24} />
          </Box>
          <Box sx={{ gridColumnStart: 10, gridRowStart: 5 }}>
            <IconBarChart color="#F9C16E" size={24} />
          </Box>
          <Box
            sx={{
              maxWidth: 768,
              m: "0 auto",
              gridColumnStart: 1,
              gridColumnEnd: 13,
              gridRowStart: 2,
              gridRowEnd: 5
            }}
          >
            <Title>{title}</Title>
            <Teaser>{teaser}</Teaser>
            <Flex sx={{ justifyContent: "center" }}>
              <LocalizedLink
                pathname="/[locale]/create/[chartId]"
                query={{ chartId: "new" }}
                passHref
              >
                <Button as="a" variant="primary">
                  {buttonLabel}
                </Button>
              </LocalizedLink>
            </Flex>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export const Title = ({ children }: { children: React.ReactNode }) => (
  <Text
    as="h1"
    sx={{
      color: "monochrome800",
      textAlign: "center",
      fontFamily: "body",
      lineHeight: 1.2,
      fontWeight: "bold",
      fontSize: [8, "3.5rem", "3.5rem"],
      hyphens: "auto",
      mb: [4]
    }}
  >
    {children}
  </Text>
);
export const Teaser = ({ children }: { children: React.ReactNode }) => (
  <Text
    variant="paragraph1"
    sx={{
      fontSize: [4, 4, 4],
      textAlign: "center",
      color: "monochrome700",
      mb: [6, 5]
    }}
  >
    {children}
  </Text>
);
