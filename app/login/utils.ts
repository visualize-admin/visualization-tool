import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { getProviders, useSession } from "next-auth/react";
import React from "react";

import { HEADER_HEIGHT } from "@/components/header";

export const useRootStyles = makeStyles<Theme>((theme) => ({
  root: {
    marginTop: `${HEADER_HEIGHT}px`,
    backgroundColor: theme.palette.muted.main,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    padding: `0 ${theme.spacing(6)}`,
  },
  sectionContent: {
    width: "100%",
    maxWidth: 1400,
    margin: "0 auto",
  },
}));

export const useUser = () => {
  const { data: session, status: sessionStatus } = useSession();
  const { data: providers, status: providersStatus } = useProviders();

  if (sessionStatus === "loading" || providersStatus === "loading") {
    return null;
  }

  if (!providers || !Object.keys(providers).length) {
    return null;
  }

  if (!session) {
    return null;
  }

  return session.user;
};

type Providers = Awaited<ReturnType<typeof getProviders>>;

const useProviders = () => {
  const [state, setState] = React.useState({
    status: "loading",
    data: undefined as Providers | undefined,
  });

  React.useEffect(() => {
    const run = async () => {
      const providers = await getProviders();
      setState({ status: "loaded", data: providers });
    };

    run();
  }, []);

  return state;
};
