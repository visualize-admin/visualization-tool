import { Box } from "@mui/material";
import { User } from "@prisma/client";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";

import { AppLayout } from "@/components/layout";
import { ParsedConfig, getUserConfigs } from "@/db/config";
import { Serialized, deserializeProps, serializeProps } from "@/db/serialize";
import { findBySub } from "@/db/user";
import { ProfileContentTabs } from "@/login/components/profile-content-tabs";
import { ProfileHeader } from "@/login/components/profile-header";
import { useRootStyles } from "@/login/utils";

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

  return (
    <AppLayout>
      <Box className={rootClasses.root}>
        <ProfileHeader user={user} />
        <ProfileContentTabs userConfigs={userConfigs} />
      </Box>
    </AppLayout>
  );
};

export default ProfilePage;
