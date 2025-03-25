import * as React from "react";
function SvgIcInfoCircle(props: React.SVGProps<SVGSVGElement>) {
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
        d="M11.719 9.977h1.24v7.26h-1.24v-7.26zM12.35 7.33a.693.693 0 00-.548.208.74.74 0 00-.184.51.715.715 0 00.184.503.704.704 0 00.547.202.672.672 0 00.738-.705.734.734 0 00-.188-.51.706.706 0 00-.55-.208z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.685 5.397A8.292 8.292 0 0112.292 4a8.301 8.301 0 018.291 8.292A8.291 8.291 0 117.685 5.397zm.417 13.165a7.542 7.542 0 004.19 1.271 7.55 7.55 0 007.541-7.541 7.54 7.54 0 10-11.731 6.27z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcInfoCircle;
