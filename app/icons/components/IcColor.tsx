import * as React from "react";
function SvgIcColor(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M19 19H5V5h14v14zM6 18h12V6H6v12z" fill="currentColor" />
    </svg>
  );
}
export default SvgIcColor;
