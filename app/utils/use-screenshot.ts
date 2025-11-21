import { select } from "d3-selection";
import { toPng, toSvg } from "html-to-image";
import { addMetadata } from "meta-png";
import { useCallback, useState } from "react";

import { CHART_SVG_ID } from "@/charts/shared/containers";
import { TABLE_PREVIEW_WRAPPER_CLASS_NAME } from "@/components/chart-table-preview";
import { animationFrame } from "@/utils/animation-frame";
import { maybeWindow } from "@/utils/maybe-window";

type ScreenshotFileFormat = "png" | "svg";

export type UseScreenshotProps = {
  type: ScreenshotFileFormat;
  screenshotName: string;
  screenshotNode?: HTMLElement | null;
  modifyNode?: (
    clonedNode: HTMLElement,
    originalNode: HTMLElement
  ) => Promise<void>;
  pngMetadata?: { key: PNG_METADATA_KEY; value: string }[];
};

export const useScreenshot = ({
  type,
  screenshotName,
  screenshotNode,
  modifyNode: _modifyNode,
  pngMetadata,
}: UseScreenshotProps) => {
  const [loading, setLoading] = useState(false);
  const modifyNode = useCallback(
    async (clonedNode: HTMLElement, originalNode: HTMLElement) => {
      removeDisabledElements(clonedNode);

      if (_modifyNode) {
        await _modifyNode(clonedNode, originalNode);
      }
    },
    [_modifyNode]
  );
  const screenshot = useCallback(async () => {
    if (screenshotNode) {
      setLoading(true);
      try {
        await makeScreenshot({
          type,
          name: screenshotName,
          node: screenshotNode,
          modifyNode,
          pngMetadata,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  }, [screenshotNode, type, screenshotName, modifyNode, pngMetadata]);

  return {
    loading,
    screenshot,
  };
};

// https://dev.exiv2.org/projects/exiv2/wiki/The_Metadata_in_PNG_files#2-Textual-information-chunks-the-metadata-in-PNG
// We can use custom keys, but we should use keys already used by other software.
type PNG_METADATA_KEY =
  | "Title"
  | "Author"
  | "Description"
  | "Copyright"
  | "Creation Time"
  | "Software"
  | "Disclaimer"
  | "Warning"
  | "Source"
  | "Comment";

const makeScreenshot = async ({
  type,
  name,
  node,
  modifyNode,
  pngMetadata,
}: {
  type: "png" | "svg";
  name: string;
  node: HTMLElement;
  modifyNode?: (
    clonedNode: HTMLElement,
    originalNode: HTMLElement
  ) => Promise<void>;
  pngMetadata?: { key: PNG_METADATA_KEY; value: string }[];
}) => {
  const isUsingSafari = maybeWindow()
    ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    : false;
  // Add wrapper node to prevent overflow issues in the screenshot
  const wrapperNode = document.createElement("div");
  wrapperNode.style.width = `${node.offsetWidth}px`;
  wrapperNode.style.marginTop = `${node.offsetHeight}px`;
  document.body.appendChild(wrapperNode);

  const clonedNode = node.cloneNode(true) as HTMLElement;

  const canvasNodes = select(node)
    .selectAll<HTMLCanvasElement, unknown>("canvas")
    .nodes();
  const clonedCanvasNodes = select(clonedNode)
    .selectAll<HTMLCanvasElement, unknown>("canvas")
    .nodes();

  for (const canvasNode of canvasNodes) {
    const clonedCanvasNode = clonedCanvasNodes[canvasNodes.indexOf(canvasNode)];
    // Cloning the canvas element does not copy the content, so we need to
    // manually copy it.
    const ctx = clonedCanvasNode.getContext("2d") as CanvasRenderingContext2D;
    ctx.drawImage(canvasNode, 0, 0);
    await animationFrame();
  }

  await modifyNode?.(clonedNode, node);
  wrapperNode.appendChild(clonedNode);

  // Make sure the whole chart is visible in the screenshot (currently only an
  // issue with SVG-based, long bar charts).
  const tableWrapper = clonedNode.querySelector(
    `.${TABLE_PREVIEW_WRAPPER_CLASS_NAME}`
  ) as HTMLElement | null;
  const chartSvg = tableWrapper?.querySelector(`#${CHART_SVG_ID}`);
  const chartSvgHeight = chartSvg?.getAttribute("height");
  const chartSvgParent = chartSvg?.parentElement;

  if (tableWrapper && chartSvgHeight && chartSvgParent) {
    tableWrapper.style.height = "fit-content";
    chartSvgParent.style.height = `${chartSvgHeight}px`;
    chartSvgParent.style.overflow = "visible";
  }

  await animationFrame();

  // There's a bug with embedding the fonts in Safari, which appears only when
  // downloading the image for the first time. On subsequent downloads, the
  // font is embedded correctly. To work around this issue, we call the toPng
  // function twice.
  if (isUsingSafari && type === "png") {
    await toPng(wrapperNode);
  }

  await (type === "png" ? toPng : toSvg)(wrapperNode)
    .then((dataUrl) => {
      const download = (dataUrl: string) => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${name}.${type}`;
        a.click();
      };

      switch (type) {
        case "png": {
          let arrayBuffer: Uint8Array = Uint8Array.from(
            atob(dataUrl.split(",")[1]),
            (c) => c.charCodeAt(0)
          );

          pngMetadata?.forEach(({ key, value }) => {
            arrayBuffer = addMetadata(arrayBuffer, key, value);
          });

          const dataUrlWithMetadata = `data:image/png;base64,${Buffer.from(
            arrayBuffer
          ).toString("base64")}`;

          return download(dataUrlWithMetadata);
        }
        case "svg":
          return download(dataUrl);
        default:
          const _exhaustiveCheck: never = type;
          return _exhaustiveCheck;
      }
    })
    .catch((error) => console.error(error))
    .finally(() => {
      wrapperNode.remove();
    });
};

export const DISABLE_SCREENSHOT_ATTR_KEY = "data-disable-screenshot";
/** Apply this attribute to elements that should not be included in the screenshot. */
export const DISABLE_SCREENSHOT_ATTR = {
  [DISABLE_SCREENSHOT_ATTR_KEY]: true,
};
const removeDisabledElements = (node: HTMLElement) => {
  node
    .querySelectorAll(`[${DISABLE_SCREENSHOT_ATTR_KEY}="true"]`)
    .forEach((el) => el.remove());
};
