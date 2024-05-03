import React from "react";

function SvgIcReset(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h24v24H0z" />
        <path
          fill="currentColor"
          d="M21 15a1 1 0 01.117 1.993L21 17h-3a1 1 0 00-.993.883L17 18v3a1 1 0 01-1.993.117L15 21v-3a3 3 0 012.824-2.995L18 15h3zM6 15a3 3 0 012.995 2.824L9 18v3a1 1 0 01-1.993.117L7 21v-3a1 1 0 00-.883-.993L6 17H3a1 1 0 01-.117-1.993L3 15h3zM8 2a1 1 0 01.993.883L9 3v3a3 3 0 01-2.824 2.995L6 9H3a1 1 0 01-.117-1.993L3 7h3a1 1 0 00.993-.883L7 6V3a1 1 0 011-1zm8 0a1 1 0 01.993.883L17 3v3a1 1 0 00.883.993L18 7h3a1 1 0 01.117 1.993L21 9h-3a3 3 0 01-2.995-2.824L15 6V3a1 1 0 011-1z"
        />
      </g>
    </svg>
  );
}

export default SvgIcReset;
