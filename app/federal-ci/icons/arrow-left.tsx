import { getCommonIconProps, IconProps } from ".";

export const ArrowLeftIcon = (props: IconProps) => {
  return (
    <svg {...getCommonIconProps(props)}>
      <path
        d="m8.306 5.116-4.066 7.044 4.066 7.044.65-.375-3.633-6.294h15.187v-.75h-15.187l3.633-6.294z"
        fill="currentColor"
      />
    </svg>
  );
};
