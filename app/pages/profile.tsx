import {
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Box,
} from "@mui/material";
import { User } from "@prisma/client";
import { GetServerSideProps } from "next";
import Link from "next/link";

import { AppLayout } from "@/components/layout";
import {
  PanelLayout,
  PanelMiddleWrapper,
} from "@/configurator/components/layout";
import { getUserConfigs, ParsedConfig } from "@/db/config";
import { deserializeProps, serializeProps, Serialized } from "@/db/serialize";
import { findBySub } from "@/db/user";

import { getServerSideSession } from "./api/session";

type PageProps = {
  user: User;
  userConfigs: ParsedConfig[];
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  const session = await getServerSideSession(context.req, context.res);
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

  return (
    <AppLayout>
      <PanelLayout>
        <PanelMiddleWrapper sx={{ mt: 6 }}>
          <Typography variant="h1" gutterBottom>
            Hello {user.name} 👋
          </Typography>
          <Typography variant="h2">Charts</Typography>
          <Box sx={{ mt: 4 }}>
            {userConfigs.length > 0 ? (
              <Table>
                <TableHead>
                  <TableCell>Type</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Link</TableCell>
                </TableHead>
                <TableBody>
                  {userConfigs.map((uc) => {
                    return (
                      <TableRow key={uc.id}>
                        <TableCell>{uc.data.chartConfig.chartType}</TableCell>
                        <TableCell>{uc.data.meta.title.en}</TableCell>
                        <TableCell>
                          <Link href={`/v/${uc.key}`}>See chart</Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body1">
                No charts yet, <Link href="/browse">create one</Link>.
              </Typography>
            )}
          </Box>
        </PanelMiddleWrapper>
      </PanelLayout>
    </AppLayout>
  );
};

export default ProfilePage;
