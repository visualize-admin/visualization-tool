import {
  Box,
  Button,
  FormControlLabel,
  Input,
  Switch,
  Typography,
} from "@mui/material";
import React, { ChangeEvent } from "react";

import { ContentLayout } from "@/components/layout";
import {
  useStore as useFlagStore,
  reset,
} from "@/configurator/components/useStore";
import useEvent from "@/utils/use-event";

const FlagsPage = () => {
  const flagStore = useFlagStore();
  const flags = useFlagStore((s) => s.flags);
  const setFlag = useFlagStore((s) => s.setFlag);

  const handleSwitch = useEvent((ev: ChangeEvent<HTMLInputElement>) => {
    const flagName = ev.currentTarget.getAttribute("name")!;
    // @ts-ignore
    setFlag(flagName, ev.currentTarget.checked);
  });

  const handleInput = useEvent((ev: ChangeEvent<HTMLInputElement>) => {
    const flagName = ev.currentTarget.getAttribute("name")!;
    // @ts-ignore
    setFlag(flagName, ev.currentTarget.value);
  });

  return (
    <ContentLayout>
      <Box maxWidth={800} mx="auto" mt="4rem">
        <Typography variant="h3">Flags</Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Here, you can activate new beta behaviors. Those settings will only be
          active for your current browser.
        </Typography>
        {Object.keys(flags).map((flagName) => {
          const flagValue = flags[flagName as keyof typeof flags];
          return (
            <FormControlLabel
              sx={{ display: "flex", mb: 2 }}
              key={flagName}
              label={flagName}
              control={
                typeof flagValue === "boolean" ? (
                  <Switch
                    name={flagName}
                    checked={flagValue}
                    onChange={handleSwitch}
                  />
                ) : (
                  <Input
                    name={flagName}
                    value={flagValue}
                    onChange={handleInput}
                  />
                )
              }
            />
          );
        })}
        <Button sx={{ mt: 4 }} color="secondary" onClick={() => reset()}>
          reset
        </Button>
      </Box>
    </ContentLayout>
  );
};

export default FlagsPage;
