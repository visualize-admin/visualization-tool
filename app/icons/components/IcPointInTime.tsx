import * as React from "react";

function SvgIcPointInTime(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <g>
          <path
            fill="currentColor"
            d="M17,8 L16,8 L16,6 L14,6 L14,8 L10,8 L10,6 L8,6 L8,8 L7,8 C6.44771525,8 6,8.44771525 6,9 L6,17 C6,17.5522847 6.44771525,18 7,18 L17,18 C17.5522847,18 18,17.5522847 18,17 L18,9 C18,8.44771525 17.5522847,8 17,8 Z M16,16 L8,16 L8,11 L16,11 L16,16 Z"
          />
        </g>
      </g>
    </svg>
  );
}

export default SvgIcPointInTime;
