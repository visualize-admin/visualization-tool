import { Trans } from "@lingui/macro";
import { Box, Link } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";

import { HintRed } from "@/components/hint";
import { Icon } from "@/icons";

const flashes = {
  CANNOT_FIND_CUBE: "CANNOT_FIND_CUBE",
} as const;

export const getErrorQueryParams = (
  errorId: keyof typeof flashes,
  options: any
) => {
  return `errorId=${errorId}&errorOptions=${encodeURIComponent(
    JSON.stringify(options)
  )}`;
};

const CannotFindCubeContent = () => {
  const { query } = useRouter();
  const errorOptions = useMemo(() => {
    try {
      return JSON.parse(query?.errorOptions as string);
    } catch (e) {
      return {};
    }
  }, [query]);

  return (
    <>
      <Trans id="flashes.couldnt-load-cube.title">Could not load cube</Trans>
      <Link
        href={`https://cube-validator.lindas.admin.ch/validate/${encodeURIComponent(errorOptions.endpointUrl)}/${encodeURIComponent(errorOptions.iri)}?profile=https:%2F%2Fcube.link%2Fref%2Fmain%2Fshape%2Fprofile-visualize`}
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <Trans id="flashes.couldnt-load-cube.view-cube-checker">
          View in Cube Validator
        </Trans>{" "}
        <Icon name="arrowRight" size={16} />
      </Link>
    </>
  );
};

const renderErrorContent: Record<
  keyof typeof flashes,
  (props: any) => React.ReactElement
> = {
  CANNOT_FIND_CUBE: CannotFindCubeContent,
};

const Flashes = () => {
  const router = useRouter();
  const query = router.query;
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const errorId = query.errorId as keyof typeof flashes;
  const ErrorComponent = renderErrorContent[errorId];

  return (
    <Box sx={{ position: "fixed", bottom: "1rem", right: "1rem", zIndex: 1 }}>
      <AnimatePresence>
        {errorId && !dismissed[errorId] ? (
          <motion.div
            initial={{ opacity: 0, y: "1rem" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "1rem" }}
          >
            <HintRed
              smaller
              onClose={() =>
                setDismissed((dismissed) => ({
                  ...dismissed,
                  [errorId]: true,
                }))
              }
              sx={{ px: 4, py: 1, backgroundColor: "red", boxShadow: 2 }}
            >
              {ErrorComponent ? (
                <ErrorComponent />
              ) : (
                <Trans id={`flashes.error.${errorId}`} />
              )}
            </HintRed>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Box>
  );
};

export default Flashes;
