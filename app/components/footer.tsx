import {
  Footer as SwissFederalCiFooter,
  FooterSection,
  FooterSectionButton,
  FooterSectionSocialMediaButton,
  FooterSectionSocialMediaButtonGroup,
  FooterSectionText,
  FooterSectionTitle,
} from "@interactivethings/swiss-federal-ci/dist/components";
import { t } from "@lingui/macro";
import { Link, SxProps } from "@mui/material";
import NextLink from "next/link";

import contentRoutes from "@/content-routes.json";
import { BUILD_COMMIT, BUILD_GITHUB_REPO, BUILD_VERSION } from "@/domain/env";
import { useLocale } from "@/locales/use-locale";

const mkVersionLink = () => {
  let commitLink = "";
  let href = "";

  if (BUILD_COMMIT) {
    commitLink = `(${BUILD_COMMIT.substr(0, 7)})`;
  }

  if (BUILD_GITHUB_REPO) {
    href = `${BUILD_GITHUB_REPO}/commit/${BUILD_COMMIT}`;
  }

  return {
    title: `${BUILD_VERSION} ${commitLink}`,
    href,
    external: true,
  };
};

export const Footer = ({ sx }: { sx?: SxProps }) => {
  const locale = useLocale();
  const legalLink = {
    title: contentRoutes.legal[locale].title,
    href: contentRoutes.legal[locale].path,
    external: false,
  };
  const imprintLink = {
    title: contentRoutes.imprint[locale].title,
    href: contentRoutes.imprint[locale].path,
    external: false,
  };
  const versionLink = mkVersionLink();

  return (
    <SwissFederalCiFooter
      ContentWrapperProps={{ sx: sx ?? undefined }}
      bottomLinks={[versionLink, imprintLink, legalLink]}
      nCols={3}
    >
      <FooterSection>
        <FooterSectionTitle
          title={t({
            id: "footer.about_us.label",
            message: "About this portal",
          })}
        />
        <FooterSectionText
          text={t({
            id: "footer.about_us.text",
            message:
              "The portal visualize.admin.ch allows the visualization of Swiss Open Government Data provided by the LINDAS Linked Data Service. Open Government Data (OGD) are data that are made available to the public free of charge in computer-readable format.",
          })}
        />
      </FooterSection>
      <FooterSection>
        <FooterSectionTitle
          title={t({ id: "footer.contact.title", message: "Stay informed" })}
        />
        <FooterSectionSocialMediaButtonGroup>
          <FooterSectionSocialMediaButton
            type="youtube"
            href="https://www.youtube.com/@visualizetutorials"
          />
          <FooterSectionSocialMediaButton
            type="news"
            href="mailto:visualize@bafu.admin.ch"
          />
        </FooterSectionSocialMediaButtonGroup>
      </FooterSection>
      <FooterSection>
        <FooterSectionTitle
          title={t({
            id: "footer.information.title",
            message: "Further information",
          })}
        />
        <Link
          href={`https://lindas.admin.ch/?lang=${locale}`}
          target="_blank"
          underline="none"
        >
          <FooterSectionButton
            iconName="external"
            label={t({
              id: "footer.button.lindas",
              message: "LINDAS Linked Data Services",
            })}
          />
        </Link>
        <Link
          href={`https://www.youtube.com/@visualizetutorials`}
          target="_blank"
          underline="none"
        >
          <FooterSectionButton
            iconName="external"
            label={t({
              id: "footer.tutorials",
              message: "Tutorials",
            })}
          />
        </Link>
        <Link
          href={`https://visualization-tool.status.interactivethings.io/`}
          target="_blank"
          underline="none"
        >
          <FooterSectionButton
            iconName="external"
            label={t({
              id: "footer.status",
              message: "Status",
            })}
          />
        </Link>
        <NextLink href="/statistics" passHref legacyBehavior>
          <Link underline="none">
            <FooterSectionButton
              label={t({ id: "footer.statistics", message: "Statistics" })}
            />
          </Link>
        </NextLink>
      </FooterSection>
    </SwissFederalCiFooter>
  );
};
