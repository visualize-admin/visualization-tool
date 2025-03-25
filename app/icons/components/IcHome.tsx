import * as React from "react";
function SvgIcHome(props: React.SVGProps<SVGSVGElement>) {
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
        d="M11.548 4L4 8.365v11.556h15.067V8.34L11.548 4zM10 19.17v-6.576h3.056v6.576H10zm3.807.002h4.51V8.776l-6.769-3.909L4.75 8.8v10.372h4.501v-7.326h4.556v7.326z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcHome;
