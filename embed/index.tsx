import iframeResize from "iframe-resizer/js/iframeResizer.js";

Array.from(document.querySelectorAll("[data-visualize-iframe]")).forEach(
  (el) => {
    iframeResize({ log: false }, el);
  }
);
