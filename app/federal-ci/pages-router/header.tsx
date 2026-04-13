import { useRouter } from "next/router";
import { ComponentProps } from "react";

import { BaseHeader } from "@/federal-ci/components/header";

type HeaderProps = Omit<ComponentProps<typeof BaseHeader>, "asPath">;

export const Header = (props: HeaderProps) => {
  const router = useRouter();
  return <BaseHeader {...props} asPath={router.asPath} />;
};
