import * as React from "react";

function SvgIcCategories(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="currentColor" fillRule="evenodd">
        <path d="M4 4h8.379l7.857 7.858a2.607 2.607 0 01.14 3.535l-.14.152-4.69 4.691a2.607 2.607 0 01-3.536.14l-.152-.14L10.72 19.1l1.415-1.414 1.136 1.136a.607.607 0 00.786.062l.073-.062 4.691-4.691a.607.607 0 00.062-.786l-.062-.073L11.55 6H6v5.55l3.993 3.993L8.7 17.23 4 12.379V4z" />
        <path d="M9.286 7.179a2.107 2.107 0 100 4.214 2.107 2.107 0 000-4.214zm0 1a1.107 1.107 0 110 2.214 1.107 1.107 0 010-2.214z" />
        <path d="M10 11v9.5H8.7V11z" />
      </g>
    </svg>
  );
}

export default SvgIcCategories;
