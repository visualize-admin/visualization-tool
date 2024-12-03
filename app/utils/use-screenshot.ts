import { select } from "d3-selection";
import { toPng, toSvg } from "html-to-image";
import { useCallback, useState } from "react";

type ScreenshotFileFormat = "png" | "svg";

export const useScreenshot = ({
  type,
  screenshotName,
  screenshotNode,
  modifyNode: _modifyNode,
}: {
  type: ScreenshotFileFormat;
  screenshotName: string;
  screenshotNode?: HTMLElement | null;
  modifyNode?: (d: HTMLElement) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const modifyNode = useCallback(
    (node: HTMLElement) => {
      removeDisabledElements(node);

      if (_modifyNode) {
        _modifyNode(node);
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
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  }, [type, screenshotName, screenshotNode, modifyNode]);

  return { loading, screenshot };
};

const makeScreenshot = async ({
  type,
  name,
  node,
  modifyNode,
}: {
  type: "png" | "svg";
  name: string;
  node: HTMLElement;
  modifyNode?: (d: HTMLElement) => void;
}) => {
  const isUsingSafari =
    typeof window !== "undefined"
      ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      : false;
  // Add wrapper node to prevent overflow issues in the screenshot
  const wrapperNode = document.createElement("div");
  wrapperNode.style.width = `${node.offsetWidth}px`;
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
  }

  wrapperNode.appendChild(clonedNode);
  modifyNode?.(clonedNode);

  // There's a bug with embedding the fonts in Safari, which appears only when
  // downloading the image for the first time. On subsequent downloads, the
  // font is embedded correctly. To work around this issue, we call the toPng
  // function twice.
  if (isUsingSafari && type === "png") {
    await toPng(wrapperNode);
  }

  await (type === "png" ? toPng : toSvg)(wrapperNode)
    .then((dataUrl) => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${name}.${type}`;
      a.click();
    })
    .catch((error) => console.error(error))
    .finally(() => wrapperNode.remove());
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
