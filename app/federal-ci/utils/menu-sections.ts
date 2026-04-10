import { ReactNode } from "react";

type BaseSection = {
  title: string | ReactNode;
  active?: boolean;
  isHighlighted?: boolean;
};

type RecursiveSection = BaseSection & {
  href?: string;
  fadedOut?: boolean;
  sections?: RecursiveSection[];
};

/** Section that appears only on mobile view. */
type MobileOnlySection = RecursiveSection & {
  mobileOnly: true;
};

export type SectionWithSubsections = Omit<MobileOnlySection, "sections"> & {
  sections: NonNullable<RecursiveSection["sections"]>;
};

export type UniversalSection = BaseSection & {
  href: string;
  mobileOnly?: false;
};

export const isSectionWithSubsections = (
  d: Section
): d is SectionWithSubsections => {
  return "sections" in d && d.sections !== undefined && d.sections.length > 0;
};

export const isNotMobileSection = (
  s: Section
): s is Exclude<MobileOnlySection, Section> => {
  return !("mobileOnly" in s && s.mobileOnly === true);
};

export const isMobileSection = (s: Section): s is MobileOnlySection => {
  return "mobileOnly" in s && s.mobileOnly === true;
};

export type Section = UniversalSection | MobileOnlySection | RecursiveSection;
