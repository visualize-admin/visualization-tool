import { getCommonIconProps, IconProps } from ".";

export const ArrowRightIcon = (props: IconProps) => {
  return (
    <svg {...getCommonIconProps(props)}>
      <path
        d="m16.444 19.204 4.066-7.044-4.066-7.044-.65.375 3.633 6.294h-15.187v.75h15.187l-3.633 6.294z"
        fill="currentColor"
      />
    </svg>
  );
};
