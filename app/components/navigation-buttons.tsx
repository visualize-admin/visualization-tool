import * as React from "react";
import { Button, Flex } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";

export const NavigationButtons = () => {
  const [state, dispatch] = useConfiguratorState();

  return (
    <Flex variant="controlSectionTitle" justifyContent="space-between">
      <Button
        variant="secondary"
        // onClick={() => dispatch({ type: "DATASET_SELECTED", value: d.iri })}
        fontSize={0}
        sx={{ maxWidth: 200 }}
      >
        Zurück
        {/* <Trans>Zurück</Trans> */}
      </Button>
      <Button
        variant="primary"
        // onClick={() => dispatch({ type: "DATASET_SELECTED", value: d.iri })}
        fontSize={0}
        sx={{ maxWidth: 200 }}
      >
        Weiter
        {/* <Trans>Weiter</Trans> */}
      </Button>
    </Flex>
  );
};
