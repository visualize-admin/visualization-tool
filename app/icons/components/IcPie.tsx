import * as React from "react";
function SvgIcPie(props: React.SVGProps<SVGSVGElement>) {
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
        d="M12.121 7v4.5L16 13.75c-.765 1.402-2.174 2.25-3.703 2.25a4.204 4.204 0 01-1.993-.505c-1.014-.56-1.761-1.506-2.105-2.651a4.665 4.665 0 01.292-3.436c.682-1.36 1.974-2.262 3.415-2.4L12.121 7z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcPie;
