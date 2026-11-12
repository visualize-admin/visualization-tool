import { createRootEditorSubscription$, realmPlugin } from "@mdxeditor/editor";
import { COMMAND_PRIORITY_CRITICAL, KEY_TAB_COMMAND } from "lexical";

export const tabNavigationPlugin = realmPlugin({
  init: (realm) => {
    realm.pub(createRootEditorSubscription$, (editor) => {
      return editor.registerCommand(
        KEY_TAB_COMMAND,
        () => true,
        COMMAND_PRIORITY_CRITICAL
      );
    });
  },
});
