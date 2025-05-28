import { Box, Card, Theme, Tooltip, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { max, sum } from "d3-array";
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { useFlag } from "@/flags/use-flag";
import { formatInteger } from "@/statistics/formatters";

type Datum = [string, { count: number; label: ReactNode }];

export const BaseStatsCard = ({
  title,
  subtitle,
  data,
  columnName = "Date",
  trend,
  showPercentage = false,
}: {
  title: string;
  subtitle: string;
  data: Datum[];
  columnName?: string;
  trend?: {
    direction: "up" | "down";
    lastMonthDailyAverage: number;
    previousThreeMonthsDailyAverage: number;
  };
  showPercentage?: boolean;
}) => {
  const classes = useStyles();
  const totalCount = sum(data, ([, { count }]) => count) ?? 1;
  const maxCount = max(data, ([, { count }]) => count) ?? 1;

  return (
    <Card className={classes.root}>
      <Box sx={{ px: 5 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 24px", gap: 2 }}>
          <Typography variant="h2" sx={{ fontWeight: "normal" }}>
            {title}
          </Typography>
          {trend ? (
            <Tooltip
              title={
                <>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {trend.direction === "up"
                      ? "Upward trend"
                      : "Downward trend"}
                  </Typography>
                  <Typography variant="caption">
                    Last 30 days daily average:{" "}
                    <b>
                      {trend.lastMonthDailyAverage >= 10
                        ? formatInteger(trend.lastMonthDailyAverage)
                        : trend.lastMonthDailyAverage.toFixed(2)}
                    </b>
                  </Typography>
                  <br />
                  <Typography variant="caption">
                    Last 90 days daily average:{" "}
                    <b>
                      {trend.previousThreeMonthsDailyAverage >= 10
                        ? formatInteger(trend.previousThreeMonthsDailyAverage)
                        : trend.previousThreeMonthsDailyAverage.toFixed(2)}
                    </b>
                  </Typography>
                </>
              }
            >
              <Typography variant="h4" component="span" sx={{ mt: "0.5em" }}>
                {trend.direction === "up" ? "📈" : "📉"}
              </Typography>
            </Tooltip>
          ) : null}
        </Box>
        <Typography variant="h3" sx={{ fontWeight: "normal" }}>
          {subtitle}
        </Typography>
      </Box>
      <div
        className={classes.table}
        style={{
          gridTemplateColumns: showPercentage
            ? "auto auto auto 1fr"
            : "auto auto 1fr",
        }}
      >
        <div className={classes.tableHeader}>
          <Typography
            variant="caption"
            sx={{ position: "sticky", top: 0, fontWeight: "bold" }}
          >
            {columnName}
          </Typography>
        </div>
        <div className={classes.tableHeader} style={{ textAlign: "end" }}>
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            Count
          </Typography>
        </div>
        {showPercentage ? (
          <div className={classes.tableHeader} style={{ textAlign: "end" }}>
            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              Share
            </Typography>
          </div>
        ) : null}
        <div className={classes.divider} />
        {data.map(([key, datum]) => (
          <Bar
            key={key}
            {...datum}
            maxCount={maxCount}
            totalCount={totalCount}
            showPercentage={showPercentage}
          />
        ))}
      </div>
    </Card>
  );
};

const Bar = ({
  label,
  count,
  maxCount,
  totalCount,
  showPercentage,
}: Datum[1] & {
  label: ReactNode;
  maxCount: number;
  totalCount: number;
  showPercentage?: boolean;
}) => {
  const classes = useStyles();
  const easterEgg = useFlag("easter-eggs");

  return (
    <>
      <div className={classes.tableCell}>
        <Typography
          variant="caption"
          component="p"
          sx={{
            overflow: "hidden",
            maxWidth: 200,
            cursor: "default",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </Typography>
      </div>
      <div className={classes.tableCell} style={{ textAlign: "end" }}>
        <Typography variant="caption">{formatInteger(count)}</Typography>
      </div>
      {showPercentage ? (
        <div className={classes.tableCell} style={{ textAlign: "end" }}>
          <Typography variant="caption" sx={{ lineHeight: "normal" }}>
            {formatInteger((count / totalCount) * 100)}%
          </Typography>
        </div>
      ) : null}
      <div className={classes.tableCell}>
        {count > 0 ? (
          !easterEgg ? (
            <Box
              sx={{
                width: `${(count / maxCount) * 100}%`,
                height: "100%",
                backgroundColor: "primary.main",
              }}
            />
          ) : (
            <>
              {Array(Math.ceil((count / maxCount) * 40))
                .fill(0)
                .map((_, i) => {
                  return (
                    <motion.div
                      key={i}
                      style={{ display: "inline-block" }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        transition: { delay: i * 0.03 },
                      }}
                    >
                      🥓
                    </motion.div>
                  );
                })}
            </>
          )
        ) : null}
      </div>
    </>
  );
};

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    width: "100%",
    paddingTop: theme.spacing(4),
    boxShadow: theme.shadows[2],
    borderRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: theme.palette.grey[200],
  },
  table: {
    display: "grid",
    gridTemplateRows: "auto",
    gap: "2px",
    width: "100%",
    height: "fit-content",
    // Roughly 12 rows
    maxHeight: "calc(12 * 2.3rem)",
    overflowY: "auto",
    marginTop: theme.spacing(3),
    padding: theme.spacing(1),
    paddingTop: 0,
    backgroundColor: theme.palette.grey[200],
  },
  tableHeader: {
    position: "sticky",
    top: 0,
    width: "100%",
    padding: "0.3rem 0.6rem",
    borderBottom: `2px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  tableCell: {
    width: "100%",
    padding: "0.3rem 0.6rem",
    backgroundColor: theme.palette.background.paper,
  },
  divider: {
    zIndex: 1,
    position: "sticky",
    top: 0,
    width: "100%",
    height: "100%",
    padding: "0.3rem",
    borderBottom: `2px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
}));
