import * as React from "react";
function SvgIcMap(props: React.SVGProps<SVGSVGElement>) {
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
        d="M8.767 3.24l5.552 2.914L20 3v14.62l-5.67 3.148-5.555-2.917L3 21V6.384l5.767-3.145zm5.131 3.66L9.192 4.43v12.673l4.706 2.47V6.902zM3.845 6.893l4.5-2.455v12.665l-4.5 2.455V6.892zM14.741 19.56l4.405-2.447V4.453L14.741 6.9v12.66z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcMap;
