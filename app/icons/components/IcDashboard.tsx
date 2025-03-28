import * as React from "react";
function SvgIcDashboard(props: React.SVGProps<SVGSVGElement>) {
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
        d="M3 3h8.571v11.143H3V3zm.857.857v9.429h6.857V3.857H3.857zM12.43 3H21v6h-8.571V3zm.857.857v4.286h6.857V3.857h-6.857zm-.857 6H21V21h-8.571V9.857zm.857.857v9.429h6.857v-9.429h-6.857zM3 15h8.571v6H3v-6zm.857.857v4.286h6.857v-4.286H3.857z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcDashboard;
