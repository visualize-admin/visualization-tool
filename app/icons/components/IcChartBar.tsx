import * as React from "react";
function SvgIcChartBar(props: React.SVGProps<SVGSVGElement>) {
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
        d="M4.836 18.385V5.992h-.75v13.143h16.209v-.75H4.835z"
        fill="currentColor"
      />
      <path
        d="M5.453 7.422h5.211v.75h-5.21v-.75zM5.453 9.71h8.365v.75H5.453v-.75zM5.453 12h11.5v.75h-11.5V12zM5.453 14.29h7.17v.75h-7.17v-.75zM5.453 16.578h10.422v.75H5.453v-.75z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcChartBar;
