import { Trans } from "@lingui/macro";
import { Box, Link } from "@mui/material";
import { useCallback } from "react";

import { HintOrange } from "@/components/hint";
import useLocalState from "@/utils/use-local-state";

export const useCautionAlert = () => {
  const [isOpen, setIsOpen] = useLocalState("add-dataset-caution-alert", true);

  return {
    isOpen,
    open: useCallback(() => setIsOpen(true), [setIsOpen]),
    close: useCallback(() => setIsOpen(false), [setIsOpen]),
  };
};

export const CautionAlert = ({ onConfirm }: { onConfirm: () => void }) => {
  return (
    <HintOrange>
      <Trans id="dataset.search.caution.body">
        The linking of different datasets carries risks such as data
        inconsistencies, scalability issues, and unexpected correlations. Be
        sure to use to merge datasets only when you are confident that data
        should be merged together.
      </Trans>
      <Box sx={{ mt: 1 }}>
        <Link
          onClick={(ev) => {
            ev.preventDefault();
            onConfirm();
          }}
          href="#"
        >
          <Trans id="dataset.search.caution.acknowledge">
            Understood, I&apos;ll proceed cautiously.
          </Trans>
        </Link>
      </Box>
    </HintOrange>
  );
};
