import * as React from "react";
function SvgIcChartDualAxisLine(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      {...props}
    >
      <filter id="grayscale">
        <feColorMatrix
          type="matrix"
          values="0.3333 0.3333 0.3333 0 0
    0.3333 0.3333 0.3333 0 0
    0.3333 0.3333 0.3333 0 0
    0 0 0 1 0"
        />
      </filter>
      <path
        d="M20.346 12.923l.078-.073-.078-.073-1.057-.99-.068-.064-.069.064-4.633 4.34-3.95-3.7-.069-.064-.068.064-1.057.99-.078.073.078.073 5.075 4.755.069.064.068-.064zM6.875 11.064l.068.064.069-.064 1.056-.99.078-.072-.078-.073-2.086-1.955-.069-.064-.068.064-2.023 1.895-.078.073.078.073 1.057.99.068.064.069-.064.897-.841z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={0.2}
        filter="url(#grayscale)"
      />
      <path
        d="M4.988 16.163l.069.064.068-.064 5.754-5.391 2.547 2.386.068.064.069-.064 6.505-6.095.078-.073-.078-.073-1.056-.99-.069-.064-.068.064-5.38 5.04-2.547-2.385-.069-.064-.068.064-6.88 6.445-.077.073.078.073z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={0.2}
      />
      <path d="M1 2h1.396v20H1z" fill="currentColor" />
      <path
        d="M21.602 2h1.396v20h-1.396z"
        fill="currentColor"
        filter="url(#grayscale)"
      />
    </svg>
  );
}
export default SvgIcChartDualAxisLine;
