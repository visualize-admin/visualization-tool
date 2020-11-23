import * as React from "react";

function SvgIcPieChart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h48v48H0z" />
        <path
          d="M35.463 10.003c6.22 4.839 8.253 12.975 5.209 20.412l-.316.585L25 23l10.463-12.997zM25 6c2.557.143 5.043.784 7.348 1.96.395.204.779.42 1.152.65L25 19.5V6zm-2 0v18l16 9c-3.154 5.61-8.966 9-15.274 9-2.835 0-5.67-.685-8.222-2.02-4.181-2.237-7.265-6.024-8.682-10.605-1.418-4.617-.992-9.487 1.205-13.744 2.812-5.441 8.14-9.049 14.086-9.6L23 6z"
          fill="#069"
        />
      </g>
    </svg>
  );
}

export default SvgIcPieChart;
