import { getCommonIconProps, IconProps } from ".";

export const DownloadIcon = (props: IconProps) => {
  return (
    <svg {...getCommonIconProps(props)}>
      <path
        d="m19.419 13.698-.375-.649-6.294 3.634v-12.228h-.75v12.228l-6.294-3.634-.375.649 7.044 4.067z"
        fill="currentColor"
      />
      <path d="m6.00576 19.91649h12.76855v.75h-12.76855z" fill="currentColor" />
    </svg>
  );
};
