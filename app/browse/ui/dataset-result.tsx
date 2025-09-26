import { Trans } from "@lingui/macro";
import { Box, CardProps, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import sortBy from "lodash/sortBy";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { ComponentProps, MouseEvent } from "react";

import { getBrowseParamsFromQuery } from "@/browse/lib/params";
import { DateFormat } from "@/browse/ui/date-format";
import { Flex } from "@/components/flex";
import { MaybeTooltip } from "@/components/maybe-tooltip";
import { MotionCard, smoothPresenceProps } from "@/components/presence";
import { Tag } from "@/components/tag";
import { PartialSearchCube } from "@/domain/data";
import { DataCubePublicationStatus } from "@/graphql/query-hooks";
import { useEvent } from "@/utils/use-event";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(4),
    padding: `${theme.spacing(8)} 0`,
    borderTop: `1px solid ${theme.palette.monochrome[400]}`,
    borderRadius: 0,
    textAlign: "left",
    boxShadow: "none",
  },
  textWrapper: {
    "& > b": {
      fontWeight: 700,
    },
  },
  titleClickable: {
    display: "inline-block",
    cursor: "pointer",
    transition: "color 0.2s ease",

    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
  description: {
    display: "-webkit-box",
    overflow: "hidden",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
}));

export type DatasetResultProps = ComponentProps<typeof DatasetResult>;

export const DatasetResult = ({
  dataCube: {
    iri,
    publicationStatus,
    title,
    description,
    themes,
    datePublished,
    creator,
    dimensions,
  },
  highlightedTitle,
  highlightedDescription,
  showTags = true,
  disableTitleLink,
  showDimensions,
  onClickTitle,
  ...cardProps
}: {
  dataCube: PartialSearchCube;
  highlightedTitle?: string | null;
  highlightedDescription?: string | null;
  showTags?: boolean;
  disableTitleLink?: boolean;
  showDimensions?: boolean;
  onClickTitle?: (e: MouseEvent<HTMLDivElement>, iri: string) => void;
} & CardProps) => {
  const isDraft = publicationStatus === DataCubePublicationStatus.Draft;
  const router = useRouter();
  const classes = useStyles();

  const handleTitleClick = useEvent((e: MouseEvent<HTMLDivElement>) => {
    onClickTitle?.(e, iri);

    if (e.defaultPrevented) {
      return;
    }

    const browseParams = getBrowseParamsFromQuery(router.query);
    const query = {
      previous: JSON.stringify(browseParams),
      dataset: iri,
    };
    router.push({ pathname: "/browse", query }, undefined, {
      shallow: true,
      scroll: false,
    });
  });

  return (
    <MotionCard
      elevation={1}
      {...smoothPresenceProps}
      {...cardProps}
      className={clsx(classes.root, cardProps.className)}
    >
      <Stack spacing={2}>
        <Flex
          justifyContent="space-between"
          width="100%"
          // To account for the space taken by the draft tag
          minHeight={24}
        >
          <Typography variant="body2" color="monochrome.500">
            {datePublished && <DateFormat date={datePublished} />}
          </Typography>
          {isDraft ? (
            <Tag type="draft">
              <Trans id="dataset.tag.draft">Draft</Trans>
            </Tag>
          ) : null}
        </Flex>
        <Typography
          className={disableTitleLink ? undefined : classes.titleClickable}
          fontWeight={700}
          onClick={disableTitleLink ? undefined : handleTitleClick}
        >
          {highlightedTitle ? (
            <Box
              className={classes.textWrapper}
              component="span"
              fontWeight={highlightedTitle === title ? 700 : 400}
              dangerouslySetInnerHTML={{ __html: highlightedTitle }}
            />
          ) : (
            title
          )}
        </Typography>
        <Typography
          className={classes.description}
          variant="body2"
          title={description ?? ""}
        >
          {highlightedDescription ? (
            <Box
              className={classes.textWrapper}
              component="span"
              dangerouslySetInnerHTML={{ __html: highlightedDescription }}
            />
          ) : (
            description
          )}
        </Typography>
      </Stack>
      <Flex sx={{ flexWrap: "wrap", gap: 2 }}>
        {themes && showTags
          ? sortBy(themes, (t) => t.label).map(
              (t) =>
                t.iri &&
                t.label && (
                  <NextLink
                    key={t.iri}
                    href={`/browse/theme/${encodeURIComponent(t.iri)}`}
                    passHref
                    legacyBehavior
                    scroll={false}
                  >
                    <Tag type="theme">{t.label}</Tag>
                  </NextLink>
                )
            )
          : null}
        {creator?.label ? (
          <NextLink
            key={creator.iri}
            href={`/browse/organization/${encodeURIComponent(creator.iri)}`}
            passHref
            legacyBehavior
            scroll={false}
          >
            <Tag type="organization">{creator.label}</Tag>
          </NextLink>
        ) : null}
        {showDimensions &&
          dimensions?.length !== undefined &&
          dimensions.length > 0 && (
            <>
              {sortBy(dimensions, (dimension) => dimension.label).map(
                (dimension) => {
                  return (
                    <MaybeTooltip
                      key={dimension.id}
                      title={
                        dimension.termsets.length > 0 ? (
                          <>
                            <Typography variant="caption">
                              <Trans id="dataset-result.dimension-joined-by">
                                Contains values of
                              </Trans>
                              <Stack flexDirection="row" gap={1} mt={1}>
                                {dimension.termsets.map((termset) => {
                                  return (
                                    <Tag
                                      key={termset.iri}
                                      type="termset"
                                      style={{ flexShrink: 0 }}
                                    >
                                      {termset.label}
                                    </Tag>
                                  );
                                })}
                              </Stack>
                            </Typography>
                          </>
                        ) : null
                      }
                    >
                      <Tag style={{ cursor: "default" }} type="dimension">
                        {dimension.label}
                      </Tag>
                    </MaybeTooltip>
                  );
                }
              )}
            </>
          )}
      </Flex>
    </MotionCard>
  );
};
