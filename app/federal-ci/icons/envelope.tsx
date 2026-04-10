import { getCommonIconProps, IconProps } from ".";

export const EnvelopeIcon = (props: IconProps) => {
  return (
    <svg {...getCommonIconProps(props)}>
      <path
        d="m4.08325 5.61572v13.51905h16.5835v-13.51905zm15.42951.75-7.138 4.12061-7.13758-4.12061zm-14.67951 12.01905v-11.38623l7.54151 4.354 7.542-4.35449v11.38672z"
        fill="currentColor"
      />
    </svg>
  );
};
