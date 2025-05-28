import { prisma } from "@/db/client";

export const findBySub = async (sub: string) => {
  return prisma.user.findFirstOrThrow({
    where: {
      sub,
    },
  });
};

/**
 * Ensures an authenticated user has an account
 * on our side.
 *
 * - Uses the "sub" field from the JWT token to ensure
 * uniqueness.
 * - Updates the user name with what is found in the JWT token
 */
export const ensureUserFromSub = async (
  sub: string,
  name: string | undefined | null
) => {
  const user = await prisma.user.findFirst({
    where: {
      sub,
    },
  });
  if (user) {
    if (user.name !== name) {
      console.log(`Updating user name from auth provider info`);
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: name,
        },
      });
    }
    return user;
  } else {
    const newUser = await prisma.user.create({
      data: {
        sub: sub,
      },
    });
    return newUser;
  }
};
