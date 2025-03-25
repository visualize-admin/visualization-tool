import * as React from "react";
function SvgIcCalendar(props: React.SVGProps<SVGSVGElement>) {
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
        d="M16.453 4.943V4h-.75v.943H7.296V4h-.75v.943H4v15.052h15.05V4.943h-2.597zm1.848.752v3.001H4.75v-3H18.3zM4.75 9.445v9.801H18.3v-9.8H4.75z"
        fill="currentColor"
      />
      <path
        d="M6.547 11.336h.75v1.197h-.75v-1.197zM9.602 11.336h.75v1.197h-.75v-1.197zM12.648 11.336h.75v1.197h-.75v-1.197zM15.703 11.336h.75v1.197h-.75v-1.197z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcCalendar;
