import * as React from "react";
function SvgIcChartColumnLine(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      {...props}
    >
      <filter id="greyscale">
        <feColorMatrix
          type="matrix"
          values="0.3333 0.3333 0.3333 0 0
    0.3333 0.3333 0.3333 0 0
    0.3333 0.3333 0.3333 0 0
    0 0 0 1 0"
        />
      </filter>
      <path
        d="M10.529 13.701L2.887 21 1.5 19.675l9.029-8.623 3.432 3.278 7.152-6.83L22.5 8.825l-8.539 8.154z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <g fill="currentColor" filter="url(#greyscale)">
        <path d="M10.535 9.03l.867.828V6.789H7.508v5.132l2.017-1.927zM7.508 18.617v2.386H11.4v-4.449l-.866-.827zM6.376 11.523H2.453v5.216l3.923-3.747zM6.374 21v-1.312L5 21zM13.954 19l-1.01-.963-.35-.335v3.297h3.896v-4.42l-1.527 1.458zM17.625 21h3.923v-5.625h-3.787l-.136.13zM16.49 9.886V3h-3.896v8.01l1.36 1.299z" />
      </g>
    </svg>
  );
}
export default SvgIcChartColumnLine;
