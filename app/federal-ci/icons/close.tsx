import { getCommonIconProps, IconProps } from ".";

export const CloseIcon = (props: IconProps) => {
  return (
    <svg {...getCommonIconProps(props)}>
      <path
        d="m17.153 7.066-4.8 4.801-4.779-4.779-.53.531 4.779 4.778-4.757 4.756.531.531 4.756-4.757 4.778 4.779.531-.53-4.779-4.779 4.801-4.8z"
        fill="currentColor"
      />
    </svg>
  );
};
