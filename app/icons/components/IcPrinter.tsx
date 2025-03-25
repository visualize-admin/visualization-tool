import * as React from "react";
function SvgIcPrinter(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.127 12.626a.875.875 0 11-.972-1.454.875.875 0 01.972 1.454zm-.439-.84a.125.125 0 00-.172.115c0 .139.25.139.25 0a.127.127 0 00-.037-.088.125.125 0 00-.04-.027z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.715 10.02h2.804v8.668h-2.804v2.061H7.783v-2.061H5V10.02h2.782V4h7.933v6.02zm-.751-5.27H8.53v5.27h6.433V4.75zM8.53 19.997v-4.27h6.432v4.27H8.531zm7.184-2.057h2.054v-7.167H5.75v7.167h2.033v-2.209h-.607v-.75h9.187v.75h-.648v2.21z"
        fill="currentColor"
      />
      <path
        d="M8.984 16.93h5.532v.75H8.984v-.75zM8.984 18.313h5.532v.75H8.984v-.75z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcPrinter;
