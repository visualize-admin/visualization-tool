import { useTheme } from "@/themes";

export const Step1 = () => {
  const { palette } = useTheme();
  return (
    <svg width={288} height={200} viewBox="0 0 288 200">
      <defs>
        <rect id="bg_frame_dataset-b" width={64} height={166} x={0} y={0} />
        <filter
          id="bg_frame_dataset-a"
          width="100%"
          height="100%"
          x="0%"
          y="0%"
          filterUnits="objectBoundingBox"
        >
          <feOffset in="SourceAlpha" result="shadowOffsetOuter1" />
          <feColorMatrix
            in="shadowOffsetOuter1"
            values="0 0 0 0 0.898039216   0 0 0 0 0.898039216   0 0 0 0 0.898039216  0 0 0 1 0"
          />
        </filter>
        <rect id="bg_frame_dataset-c" width={64} height={22} x={0} y={0} />
        <filter
          id="bg_frame_dataset-d"
          width="101.6%"
          height="104.5%"
          x="-.8%"
          y="-2.3%"
          filterUnits="objectBoundingBox"
        >
          <feOffset dy={1} in="SourceAlpha" result="shadowOffsetInner1" />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            k2={-1}
            k3={1}
            operator="arithmetic"
            result="shadowInnerInner1"
          />
          <feColorMatrix
            in="shadowInnerInner1"
            values="0 0 0 0 0.898039216   0 0 0 0 0.898039216   0 0 0 0 0.898039216  0 0 0 1 0"
          />
        </filter>
        <rect id="bg_frame_dataset-e" width={64} height={27} x={0} y={0} />
        <filter
          id="bg_frame_dataset-f"
          width="101.6%"
          height="103.7%"
          x="-.8%"
          y="-1.9%"
          filterUnits="objectBoundingBox"
        >
          <feOffset dy={1} in="SourceAlpha" result="shadowOffsetInner1" />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            k2={-1}
            k3={1}
            operator="arithmetic"
            result="shadowInnerInner1"
          />
          <feColorMatrix
            in="shadowInnerInner1"
            values="0 0 0 0 0.898039216   0 0 0 0 0.898039216   0 0 0 0 0.898039216  0 0 0 1 0"
          />
        </filter>
        <rect id="bg_frame_dataset-g" width={64} height={27} x={0} y={0} />
        <filter
          id="bg_frame_dataset-h"
          width="101.6%"
          height="103.7%"
          x="-.8%"
          y="-1.9%"
          filterUnits="objectBoundingBox"
        >
          <feOffset dy={1} in="SourceAlpha" result="shadowOffsetInner1" />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            k2={-1}
            k3={1}
            operator="arithmetic"
            result="shadowInnerInner1"
          />
          <feColorMatrix
            in="shadowInnerInner1"
            values="0 0 0 0 0.898039216   0 0 0 0 0.898039216   0 0 0 0 0.898039216  0 0 0 1 0"
          />
        </filter>
        <rect id="bg_frame_dataset-i" width={64} height={26} x={0} y={0} />
        <filter
          id="bg_frame_dataset-j"
          width="100%"
          height="100%"
          x="0%"
          y="0%"
          filterUnits="objectBoundingBox"
        >
          <feOffset in="SourceAlpha" result="shadowOffsetInner1" />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            k2={-1}
            k3={1}
            operator="arithmetic"
            result="shadowInnerInner1"
          />
          <feColorMatrix
            in="shadowInnerInner1"
            result="shadowMatrixInner1"
            values="0 0 0 0 0.898039216   0 0 0 0 0.898039216   0 0 0 0 0.898039216  0 0 0 1 0"
          />
          <feOffset in="SourceAlpha" result="shadowOffsetInner2" />
          <feComposite
            in="shadowOffsetInner2"
            in2="SourceAlpha"
            k2={-1}
            k3={1}
            operator="arithmetic"
            result="shadowInnerInner2"
          />
          <feColorMatrix
            in="shadowInnerInner2"
            result="shadowMatrixInner2"
            values="0 0 0 0 0.898039216   0 0 0 0 0.898039216   0 0 0 0 0.898039216  0 0 0 1 0"
          />
          <feMerge>
            <feMergeNode in="shadowMatrixInner1" />
            <feMergeNode in="shadowMatrixInner2" />
          </feMerge>
        </filter>
        <rect id="bg_frame_dataset-k" width={64} height={12} x={0} y={0} />
        <filter
          id="bg_frame_dataset-l"
          width="101.6%"
          height="108.3%"
          x="-.8%"
          y="-4.2%"
          filterUnits="objectBoundingBox"
        >
          <feOffset in="SourceAlpha" result="shadowOffsetInner1" />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            k2={-1}
            k3={1}
            operator="arithmetic"
            result="shadowInnerInner1"
          />
          <feColorMatrix
            in="shadowInnerInner1"
            result="shadowMatrixInner1"
            values="0 0 0 0 0.898039216   0 0 0 0 0.898039216   0 0 0 0 0.898039216  0 0 0 1 0"
          />
          <feOffset dy={-1} in="SourceAlpha" result="shadowOffsetInner2" />
          <feComposite
            in="shadowOffsetInner2"
            in2="SourceAlpha"
            k2={-1}
            k3={1}
            operator="arithmetic"
            result="shadowInnerInner2"
          />
          <feColorMatrix
            in="shadowInnerInner2"
            result="shadowMatrixInner2"
            values="0 0 0 0 0.898039216   0 0 0 0 0.898039216   0 0 0 0 0.898039216  0 0 0 1 0"
          />
          <feMerge>
            <feMergeNode in="shadowMatrixInner1" />
            <feMergeNode in="shadowMatrixInner2" />
          </feMerge>
        </filter>
        <rect id="bg_frame_dataset-m" width={136} height={10} x={0} y={0} />
        <filter
          id="bg_frame_dataset-n"
          width="100.7%"
          height="110%"
          x="-.4%"
          y="-5%"
          filterUnits="objectBoundingBox"
        >
          <feOffset dy={-1} in="SourceAlpha" result="shadowOffsetInner1" />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            k2={-1}
            k3={1}
            operator="arithmetic"
            result="shadowInnerInner1"
          />
          <feColorMatrix
            in="shadowInnerInner1"
            values="0 0 0 0 0.898039216   0 0 0 0 0.898039216   0 0 0 0 0.898039216  0 0 0 1 0"
          />
        </filter>
        <rect id="bg_frame_dataset-o" width={136} height={10} x={0} y={0} />
        <filter
          id="bg_frame_dataset-p"
          width="100.7%"
          height="110%"
          x="-.4%"
          y="-5%"
          filterUnits="objectBoundingBox"
        >
          <feOffset dy={-1} in="SourceAlpha" result="shadowOffsetInner1" />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            k2={-1}
            k3={1}
            operator="arithmetic"
            result="shadowInnerInner1"
          />
          <feColorMatrix
            in="shadowInnerInner1"
            values="0 0 0 0 0.898039216   0 0 0 0 0.898039216   0 0 0 0 0.898039216  0 0 0 1 0"
          />
        </filter>
        <rect id="bg_frame_dataset-q" width={136} height={10} x={0} y={0} />
        <filter
          id="bg_frame_dataset-r"
          width="100.7%"
          height="110%"
          x="-.4%"
          y="-5%"
          filterUnits="objectBoundingBox"
        >
          <feOffset dy={-1} in="SourceAlpha" result="shadowOffsetInner1" />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            k2={-1}
            k3={1}
            operator="arithmetic"
            result="shadowInnerInner1"
          />
          <feColorMatrix
            in="shadowInnerInner1"
            values="0 0 0 0 0.898039216   0 0 0 0 0.898039216   0 0 0 0 0.898039216  0 0 0 1 0"
          />
        </filter>
        <rect id="bg_frame_dataset-s" width={136} height={10} x={0} y={0} />
        <filter
          id="bg_frame_dataset-t"
          width="100.7%"
          height="110%"
          x="-.4%"
          y="-5%"
          filterUnits="objectBoundingBox"
        >
          <feOffset dy={-1} in="SourceAlpha" result="shadowOffsetInner1" />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            k2={-1}
            k3={1}
            operator="arithmetic"
            result="shadowInnerInner1"
          />
          <feColorMatrix
            in="shadowInnerInner1"
            values="0 0 0 0 0.898039216   0 0 0 0 0.898039216   0 0 0 0 0.898039216  0 0 0 1 0"
          />
        </filter>
        <rect id="bg_frame_dataset-u" width={136} height={10} x={0} y={0} />
        <filter
          id="bg_frame_dataset-v"
          width="100.7%"
          height="110%"
          x="-.4%"
          y="-5%"
          filterUnits="objectBoundingBox"
        >
          <feOffset dy={-1} in="SourceAlpha" result="shadowOffsetInner1" />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            k2={-1}
            k3={1}
            operator="arithmetic"
            result="shadowInnerInner1"
          />
          <feColorMatrix
            in="shadowInnerInner1"
            values="0 0 0 0 0.898039216   0 0 0 0 0.898039216   0 0 0 0 0.898039216  0 0 0 1 0"
          />
        </filter>
        <rect id="bg_frame_dataset-w" width={136} height={10} x={0} y={0} />
        <filter
          id="bg_frame_dataset-x"
          width="100.7%"
          height="110%"
          x="-.4%"
          y="-5%"
          filterUnits="objectBoundingBox"
        >
          <feOffset dy={-1} in="SourceAlpha" result="shadowOffsetInner1" />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            k2={-1}
            k3={1}
            operator="arithmetic"
            result="shadowInnerInner1"
          />
          <feColorMatrix
            in="shadowInnerInner1"
            values="0 0 0 0 0.898039216   0 0 0 0 0.898039216   0 0 0 0 0.898039216  0 0 0 1 0"
          />
        </filter>
        <rect id="bg_frame_dataset-y" width={286} height={20} x={0} y={0} />
        <filter
          id="bg_frame_dataset-z"
          width="100.7%"
          height="110%"
          x="-.3%"
          y="-5%"
          filterUnits="objectBoundingBox"
        >
          <feOffset dy={-2} in="SourceAlpha" result="shadowOffsetInner1" />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            k2={-1}
            k3={1}
            operator="arithmetic"
            result="shadowInnerInner1"
          />
          <feColorMatrix
            in="shadowInnerInner1"
            values="0 0 0 0 0.862745098   0 0 0 0 0   0 0 0 0 0.0941176471  0 0 0 1 0"
          />
        </filter>
      </defs>
      <g fill="none" fillRule="evenodd">
        <rect
          width={287}
          height={199}
          x={0.5}
          y={0.5}
          fill={palette.grey[200]}
          stroke={palette.grey[500]}
          rx={2}
        />
        <g transform="translate(1 33)">
          <use
            fill={palette.text.primary}
            filter="url(#bg_frame_dataset-a)"
            xlinkHref="#bg_frame_dataset-b"
          />
          <use
            fill={palette.background.default}
            xlinkHref="#bg_frame_dataset-b"
          />
          <g transform="translate(0 144)">
            <use
              fill={palette.background.default}
              xlinkHref="#bg_frame_dataset-c"
            />
            <use
              fill={palette.text.primary}
              filter="url(#bg_frame_dataset-d)"
              xlinkHref="#bg_frame_dataset-c"
            />
            <g fill={palette.grey[600]} transform="translate(5 6)">
              <path
                d="M52.5,13 C53.3284271,13 54,13.6715729 54,14.5 C54,15.3284271 53.3284271,16 52.5,16 L1.5,16 C0.671572875,16 1.01453063e-16,15.3284271 0,14.5 C-1.01453063e-16,13.6715729 0.671572875,13 1.5,13 L52.5,13 Z M46.5,7 C47.3284271,7 48,7.67157288 48,8.5 C48,9.32842712 47.3284271,10 46.5,10 L1.5,10 C0.671572875,10 1.01453063e-16,9.32842712 0,8.5 C-1.01453063e-16,7.67157288 0.671572875,7 1.5,7 L46.5,7 Z"
                opacity={0.1}
              />
              <rect width={54} height={3} opacity={0.2} rx={1.5} />
            </g>
          </g>
          <g transform="translate(0 117)">
            <use
              fill={palette.background.default}
              xlinkHref="#bg_frame_dataset-e"
            />
            <use
              fill={palette.text.primary}
              filter="url(#bg_frame_dataset-f)"
              xlinkHref="#bg_frame_dataset-e"
            />
            <g fill={palette.grey[600]} transform="translate(5 6)">
              <path
                d="M52.5,13 C53.3284271,13 54,13.6715729 54,14.5 C54,15.3284271 53.3284271,16 52.5,16 L1.5,16 C0.671572875,16 1.01453063e-16,15.3284271 0,14.5 C-1.01453063e-16,13.6715729 0.671572875,13 1.5,13 L52.5,13 Z M46.5,7 C47.3284271,7 48,7.67157288 48,8.5 C48,9.32842712 47.3284271,10 46.5,10 L1.5,10 C0.671572875,10 1.01453063e-16,9.32842712 0,8.5 C-1.01453063e-16,7.67157288 0.671572875,7 1.5,7 L46.5,7 Z"
                opacity={0.1}
              />
              <rect width={54} height={3} opacity={0.2} rx={1.5} />
            </g>
          </g>
          <g transform="translate(0 90)">
            <use
              fill={palette.background.default}
              xlinkHref="#bg_frame_dataset-g"
            />
            <use
              fill={palette.text.primary}
              filter="url(#bg_frame_dataset-h)"
              xlinkHref="#bg_frame_dataset-g"
            />
            <g fill={palette.grey[600]} transform="translate(5 6)">
              <path
                d="M52.5,13 C53.3284271,13 54,13.6715729 54,14.5 C54,15.3284271 53.3284271,16 52.5,16 L1.5,16 C0.671572875,16 1.01453063e-16,15.3284271 0,14.5 C-1.01453063e-16,13.6715729 0.671572875,13 1.5,13 L52.5,13 Z M46.5,7 C47.3284271,7 48,7.67157288 48,8.5 C48,9.32842712 47.3284271,10 46.5,10 L1.5,10 C0.671572875,10 1.01453063e-16,9.32842712 0,8.5 C-1.01453063e-16,7.67157288 0.671572875,7 1.5,7 L46.5,7 Z"
                opacity={0.1}
              />
              <rect width={54} height={3} opacity={0.2} rx={1.5} />
            </g>
          </g>
          <g transform="translate(0 64)">
            <rect width={64} height={26} fill={palette.background.default} />
            <g fill={palette.grey[600]} transform="translate(5 5)">
              <path
                d="M52.5,13 C53.3284271,13 54,13.6715729 54,14.5 C54,15.3284271 53.3284271,16 52.5,16 L1.5,16 C0.671572875,16 1.01453063e-16,15.3284271 0,14.5 C-1.01453063e-16,13.6715729 0.671572875,13 1.5,13 L52.5,13 Z M46.5,7 C47.3284271,7 48,7.67157288 48,8.5 C48,9.32842712 47.3284271,10 46.5,10 L1.5,10 C0.671572875,10 1.01453063e-16,9.32842712 0,8.5 C-1.01453063e-16,7.67157288 0.671572875,7 1.5,7 L46.5,7 Z"
                opacity={0.1}
              />
              <rect width={54} height={3} opacity={0.2} rx={1.5} />
            </g>
          </g>
          <g transform="translate(0 38)">
            <use
              fill={palette.organization?.main ?? palette.primary.main}
              fillOpacity={0.1}
              xlinkHref="#bg_frame_dataset-i"
            />
            <use
              fill={palette.text.primary}
              filter="url(#bg_frame_dataset-j)"
              xlinkHref="#bg_frame_dataset-i"
            />
            <rect
              width={2}
              height={26}
              fill={palette.organization?.main ?? palette.primary.main}
            />
            <g
              fill={palette.organization?.main ?? palette.primary.main}
              transform="translate(5 5)"
            >
              <path
                d="M52.5,13 C53.3284271,13 54,13.6715729 54,14.5 C54,15.3284271 53.3284271,16 52.5,16 L1.5,16 C0.671572875,16 1.01453063e-16,15.3284271 0,14.5 C-1.01453063e-16,13.6715729 0.671572875,13 1.5,13 L52.5,13 Z M46.5,7 C47.3284271,7 48,7.67157288 48,8.5 C48,9.32842712 47.3284271,10 46.5,10 L1.5,10 C0.671572875,10 1.01453063e-16,9.32842712 0,8.5 C-1.01453063e-16,7.67157288 0.671572875,7 1.5,7 L46.5,7 Z"
                opacity={0.2}
              />
              <rect width={54} height={3} rx={1.5} />
            </g>
          </g>
          <g transform="translate(0 12)">
            <rect width={64} height={26} fill={palette.background.default} />
            <g fill={palette.grey[600]} transform="translate(5 5)">
              <path
                d="M52.5,13 C53.3284271,13 54,13.6715729 54,14.5 C54,15.3284271 53.3284271,16 52.5,16 L1.5,16 C0.671572875,16 1.01453063e-16,15.3284271 0,14.5 C-1.01453063e-16,13.6715729 0.671572875,13 1.5,13 L52.5,13 Z M46.5,7 C47.3284271,7 48,7.67157288 48,8.5 C48,9.32842712 47.3284271,10 46.5,10 L1.5,10 C0.671572875,10 1.01453063e-16,9.32842712 0,8.5 C-1.01453063e-16,7.67157288 0.671572875,7 1.5,7 L46.5,7 Z"
                opacity={0.1}
              />
              <rect width={53} height={3} opacity={0.2} rx={1.5} />
            </g>
          </g>
          <use
            fill={palette.background.default}
            xlinkHref="#bg_frame_dataset-k"
          />
          <use
            fill={palette.text.primary}
            filter="url(#bg_frame_dataset-l)"
            xlinkHref="#bg_frame_dataset-k"
          />
          <rect
            width={24}
            height={3}
            x={5}
            y={4}
            fill={palette.grey[600]}
            opacity={0.2}
            rx={1.5}
          />
        </g>
        <g transform="translate(70 38)">
          <rect
            width={147}
            height={107}
            x={0.5}
            y={0.5}
            fill={palette.background.default}
            stroke={palette.grey[300]}
          />
          <g transform="translate(6 35)">
            <g transform="translate(0 50)">
              <use
                fill={palette.background.default}
                xlinkHref="#bg_frame_dataset-m"
              />
              <use
                fill={palette.text.primary}
                filter="url(#bg_frame_dataset-n)"
                xlinkHref="#bg_frame_dataset-m"
              />
              <rect
                width={32}
                height={3}
                y={3}
                fill={palette.grey[600]}
                opacity={0.1}
                rx={1.5}
              />
              <rect
                width={32}
                height={3}
                x={52}
                y={3}
                fill={palette.grey[600]}
                opacity={0.1}
                rx={1.5}
              />
              <rect
                width={32}
                height={3}
                x={104}
                y={3}
                fill={palette.grey[600]}
                opacity={0.1}
                rx={1.5}
              />
            </g>
            <g transform="translate(0 40)">
              <use
                fill={palette.background.default}
                xlinkHref="#bg_frame_dataset-o"
              />
              <use
                fill={palette.text.primary}
                filter="url(#bg_frame_dataset-p)"
                xlinkHref="#bg_frame_dataset-o"
              />
              <rect
                width={32}
                height={3}
                y={3}
                fill={palette.grey[600]}
                opacity={0.1}
                rx={1.5}
              />
              <rect
                width={32}
                height={3}
                x={52}
                y={3}
                fill={palette.grey[600]}
                opacity={0.1}
                rx={1.5}
              />
              <rect
                width={32}
                height={3}
                x={104}
                y={3}
                fill={palette.grey[600]}
                opacity={0.1}
                rx={1.5}
              />
            </g>
            <g transform="translate(0 30)">
              <use
                fill={palette.background.default}
                xlinkHref="#bg_frame_dataset-q"
              />
              <use
                fill={palette.text.primary}
                filter="url(#bg_frame_dataset-r)"
                xlinkHref="#bg_frame_dataset-q"
              />
              <rect
                width={32}
                height={3}
                y={3}
                fill={palette.grey[600]}
                opacity={0.1}
                rx={1.5}
              />
              <rect
                width={32}
                height={3}
                x={52}
                y={3}
                fill={palette.grey[600]}
                opacity={0.1}
                rx={1.5}
              />
              <rect
                width={32}
                height={3}
                x={104}
                y={3}
                fill={palette.grey[600]}
                opacity={0.1}
                rx={1.5}
              />
            </g>
            <g transform="translate(0 20)">
              <use
                fill={palette.background.default}
                xlinkHref="#bg_frame_dataset-s"
              />
              <use
                fill={palette.text.primary}
                filter="url(#bg_frame_dataset-t)"
                xlinkHref="#bg_frame_dataset-s"
              />
              <rect
                width={32}
                height={3}
                y={3}
                fill={palette.grey[600]}
                opacity={0.1}
                rx={1.5}
              />
              <rect
                width={32}
                height={3}
                x={52}
                y={3}
                fill={palette.grey[600]}
                opacity={0.1}
                rx={1.5}
              />
              <rect
                width={32}
                height={3}
                x={104}
                y={3}
                fill={palette.grey[600]}
                opacity={0.1}
                rx={1.5}
              />
            </g>
            <g transform="translate(0 10)">
              <use
                fill={palette.background.default}
                xlinkHref="#bg_frame_dataset-u"
              />
              <use
                fill={palette.text.primary}
                filter="url(#bg_frame_dataset-v)"
                xlinkHref="#bg_frame_dataset-u"
              />
              <rect
                width={32}
                height={3}
                y={3}
                fill={palette.grey[600]}
                opacity={0.1}
                rx={1.5}
              />
              <rect
                width={32}
                height={3}
                x={52}
                y={3}
                fill={palette.grey[600]}
                opacity={0.1}
                rx={1.5}
              />
              <rect
                width={32}
                height={3}
                x={104}
                y={3}
                fill={palette.grey[600]}
                opacity={0.1}
                rx={1.5}
              />
            </g>
            <use
              fill={palette.background.default}
              xlinkHref="#bg_frame_dataset-w"
            />
            <use
              fill={palette.text.primary}
              filter="url(#bg_frame_dataset-x)"
              xlinkHref="#bg_frame_dataset-w"
            />
            <rect
              width={32}
              height={3}
              y={3}
              fill={palette.grey[600]}
              opacity={0.4}
              rx={1.5}
            />
            <rect
              width={32}
              height={3}
              x={52}
              y={3}
              fill={palette.grey[600]}
              opacity={0.4}
              rx={1.5}
            />
            <rect
              width={32}
              height={3}
              x={104}
              y={3}
              fill={palette.grey[600]}
              opacity={0.4}
              rx={1.5}
            />
          </g>
          <path
            fill={palette.grey[600]}
            d="M69.5,99 C70.3284271,99 71,99.6715729 71,100.5 C71,101.328427 70.3284271,102 69.5,102 C68.6715729,102 68,101.328427 68,100.5 C68,99.6715729 68.6715729,99 69.5,99 Z M74.5,99 C75.3284271,99 76,99.6715729 76,100.5 C76,101.328427 75.3284271,102 74.5,102 C73.6715729,102 73,101.328427 73,100.5 C73,99.6715729 73.6715729,99 74.5,99 Z M79.5,99 C80.3284271,99 81,99.6715729 81,100.5 C81,101.328427 80.3284271,102 79.5,102 C78.6715729,102 78,101.328427 78,100.5 C78,99.6715729 78.6715729,99 79.5,99 Z"
            opacity={0.2}
          />
          <g fill={palette.grey[600]} transform="translate(6 9)">
            <path
              d="M92.5,13 C93.3284271,13 94,13.6715729 94,14.5 C94,15.3284271 93.3284271,16 92.5,16 L1.5,16 C0.671572875,16 1.01453063e-16,15.3284271 0,14.5 C-5.45542273e-16,13.6715729 0.671572875,13 1.5,13 L92.5,13 Z M76.5,7 C77.3284271,7 78,7.67157288 78,8.5 C78,9.32842712 77.3284271,10 76.5,10 L1.5,10 C0.671572875,10 1.01453063e-16,9.32842712 0,8.5 C-1.01453063e-16,7.67157288 0.671572875,7 1.5,7 L76.5,7 Z"
              opacity={0.2}
            />
            <rect width={94} height={3} opacity={0.8} rx={1.5} />
          </g>
        </g>
        <g transform="translate(1 13)">
          <use
            fill={palette.background.default}
            xlinkHref="#bg_frame_dataset-y"
          />
          <use
            fill={palette.brand?.main}
            filter="url(#bg_frame_dataset-z)"
            xlinkHref="#bg_frame_dataset-y"
          />
        </g>
        <g transform="translate(1 1)">
          <polygon fill={palette.grey[500]} points="0 0 286 0 286 12 0 12" />
          <path
            fill={palette.grey[600]}
            d="M5.5,4 C6.32842712,4 7,4.67157288 7,5.5 C7,6.32842712 6.32842712,7 5.5,7 C4.67157288,7 4,6.32842712 4,5.5 C4,4.67157288 4.67157288,4 5.5,4 Z M10.5,4 C11.3284271,4 12,4.67157288 12,5.5 C12,6.32842712 11.3284271,7 10.5,7 C9.67157288,7 9,6.32842712 9,5.5 C9,4.67157288 9.67157288,4 10.5,4 Z M15.5,4 C16.3284271,4 17,4.67157288 17,5.5 C17,6.32842712 16.3284271,7 15.5,7 C14.6715729,7 14,6.32842712 14,5.5 C14,4.67157288 14.6715729,4 15.5,4 Z"
          />
        </g>
        <rect
          width={287}
          height={199}
          x={0.5}
          y={0.5}
          stroke={palette.grey[500]}
          rx={2}
        />
      </g>
    </svg>
  );
};
