import * as React from "react";
function SvgIcWarningCircle(props: React.SVGProps<SVGSVGElement>) {
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
        d="M12.319 15.885a.693.693 0 00-.547.207.742.742 0 00-.185.511.667.667 0 00.732.705.723.723 0 00.55-.2.706.706 0 00.188-.505.736.736 0 00-.188-.511.703.703 0 00-.55-.207zM12.84 14.47l.094-7.001h-1.301l.087 7.002h1.12z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.685 5.397A8.292 8.292 0 0112.292 4a8.301 8.301 0 018.291 8.292A8.291 8.291 0 117.685 5.397zm.417 13.165a7.542 7.542 0 004.19 1.271 7.55 7.55 0 007.541-7.541 7.542 7.542 0 10-11.731 6.27z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcWarningCircle;
