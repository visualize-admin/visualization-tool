import * as React from "react";

function SvgIcTimeHidden(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h24v24H0z" />
        <path
          d="M2.052 1.586l20.534 20.533-1.467 1.467L18.533 21H5c-1.103 0-2-.897-2-2V7c0-.433.138-.834.373-1.161L.586 3.052l1.466-1.466zM8.534 11H5v8h11.533l-4-4H7v-2h3.534l-2-2zM9 3v2h6V3h2v2h2c1.103 0 2 .897 2 2v11.293l-1.999-1.999V11h-5.294l-2-2H19V7H9.707L7 4.293V3h2zm8 10v1.293L15.707 13H17zM6.534 9L5 7.466V9h1.534z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default SvgIcTimeHidden;
