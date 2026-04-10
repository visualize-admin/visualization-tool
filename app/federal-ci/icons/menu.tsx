import { getCommonIconProps, IconProps } from ".";

export const MenuIcon = (props: IconProps) => {
  return (
    <svg {...getCommonIconProps(props)}>
      <path d="m4.469 5.61572h15.83301v.75h-15.83301z" fill="currentColor" />
      <path d="m4.469 12.00049h15.83301v.75h-15.83301z" fill="currentColor" />
      <path d="m4.469 18.38428h15.83301v.75h-15.83301z" fill="currentColor" />
    </svg>
  );
};
