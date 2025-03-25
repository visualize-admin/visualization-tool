import * as React from "react";
function SvgIcTablet(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M9.766 5.227h3.993v.75H9.766v-.75z" fill="currentColor" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 20.583V4h13.519v16.583H5zM17.769 6.457V4.75H5.75v1.707h12.019zm0 .746v10.17H5.75V7.202h12.019zM5.75 18.125v1.707h12.019v-1.707H5.75z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcTablet;
