import * as React from "react";
function SvgIcMobile(props: React.SVGProps<SVGSVGElement>) {
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
        d="M7 20.583V4h10.548v16.583H7zm9.798-14.126V4.75H7.75v1.707h9.048zm0 .746v10.17H7.75V7.202h9.048zM7.75 18.125v1.707h9.048v-1.707H7.75z"
        fill="currentColor"
      />
      <path
        d="M11.898 18.602h.75v.75h-.75v-.75zM10.281 5.227h3.994v.75H10.28v-.75z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcMobile;
