import type { Preview } from "@storybook/react";
import type { IndexEntry } from "@storybook/types";
import {
  AppContextDecorator,
  RouterDecorator,
  UrqlDecorator,
} from "./decorators";

const preview: Preview = {
  // @ts-ignore
  nextjs: {
    router: {
      basePath: "/profile",
    },
  },
  decorators: [AppContextDecorator, RouterDecorator, UrqlDecorator],
  options: {
    storySort: (a: IndexEntry, b: IndexEntry) =>
      a.id === b.id
        ? 0
        : a.id.localeCompare(b.id, undefined, { numeric: true }),
  },
  parameters: {
    // Disables Chromatic's snapshotting on a global level
    // We use Argos for snapshots, and only use Chromatic to link to Figma
    chromatic: { disableSnapshot: true },
  }
};

export default preview;
