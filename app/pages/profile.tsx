import { Box } from "@mui/material";
import { User } from "@prisma/client";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";

import { Footer } from "@/components/footer";
import { AppLayout } from "@/components/layout";
import { getUserConfigs, ParsedConfig } from "@/db/config";
import { deserializeProps, Serialized, serializeProps } from "@/db/serialize";
import { findBySub } from "@/db/user";
import { userConfigsKey } from "@/domain/user-configs";
import { ProfileContentTabs } from "@/login/components/profile-content-tabs";
import { ProfileHeader } from "@/login/components/profile-header";
import { useRootStyles } from "@/login/utils";
import { useHydrate } from "@/utils/use-fetch-data";

import { nextAuthOptions } from "./api/auth/[...nextauth]";

type PageProps = {
  user: User;
  userConfigs: ParsedConfig[];
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  ctx
) => {
  const { req, res } = ctx;
  const session = await getServerSession(req, res, nextAuthOptions);
  const userSub = session?.user.sub;

  if (userSub) {
    const user = await findBySub(userSub);
    const userConfigs = await getUserConfigs(user.id);

    return {
      props: serializeProps({
        user,
        userConfigs,
      }),
    };
  } else {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};

const ProfilePage = (props: Serialized<PageProps>) => {
  const { user, userConfigs } = deserializeProps(props);
  const rootClasses = useRootStyles();

  useHydrate(userConfigsKey, userConfigs);

  return (
    <AppLayout>
      <Box className={rootClasses.root}>
        <ProfileHeader user={user} />
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <ProfileContentTabs userId={user.id} />
        </Box>
      </Box>
      <Footer />
    </AppLayout>
  );
};

export default ProfilePage;
