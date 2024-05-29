import * as React from "react";

function SvgIcLayoutCanvas(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <clipPath id="ic_layout_canvas_svg__a">
        <path d="M0 0h24v24H0z" />
      </clipPath>
      <g clipPath="url(#ic_layout_canvas_svg__a)">
        <path
          clipRule="evenodd"
          d="M2 6.583h1.833v-2.75h2.75V2H2zm0 13.75h4.583V18.5h-2.75v-2.75H2zm18.333-13.75H18.5v-2.75h-2.75V2h4.583zM13 2H9.333v1.833H13zM9.333 18.5H13v1.833H9.333zm11-9.167H18.5V13h1.833zM2 9.333h1.833V13H2zm11.914 4.581L23 16.392l-3.304 1.652L23 21.348 21.348 23l-3.304-3.304L16.392 23z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

export default SvgIcLayoutCanvas;

