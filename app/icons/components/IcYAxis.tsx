import * as React from "react";
function SvgIcYAxis(props: React.SVGProps<SVGSVGElement>) {
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
        d="M21.003 19.002v1H7.379V5.574L3.54 7.83 3 6.878 7.896 4l4.896 2.878-.54.952-3.934-2.312v13.527l12.685-.043zm0-15h-1.205L18.08 7.896l-1.789-3.894h-1.288l2.47 5.02-1.432 2.98h1.228l3.734-8z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcYAxis;
