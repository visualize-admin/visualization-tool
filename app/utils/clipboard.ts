import { exec } from "child_process";

/** Can be used in development, for example to copy SPARQL query for debugging */
export function copyToClipboard(text: string): void {
  const child = exec("pbcopy");
  if (!child.stdin) {
    return;
  }
  child.stdin.write(text);
  child.stdin.end();
}
