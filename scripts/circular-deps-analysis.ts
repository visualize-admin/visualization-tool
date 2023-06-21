import { ArgumentParser } from "argparse";

const fs = require("fs");

const main = () => {
  const parser = new ArgumentParser({
    description:
      "Take the ouput of madge -c and gives the links contributing the most to circular dependencies",
  });
  parser.add_argument("input");
  const args = parser.parse_args();

  const input = fs
    .readFileSync(args.input === "-" ? 0 : args.input, "utf-8")
    .toString();
  const lines = input
    .split("\n")
    .filter((x: string) => x !== "" && /^\d+\)/.exec(x))
    .map((l: string) => l.split(") ")[1]);
  const links = [] as [string, string][];
  for (const line of lines) {
    const nodes = line.split(" > ");
    for (let i = 0; i < nodes.length - 2; i++) {
      links.push([nodes[i], nodes[i + 1]]);
    }
  }
  const counts = new Map<string, number>();
  for (const link of links) {
    const linkKey = `${link[0]} > ${link[1]}`;
    const count = counts.get(linkKey) || 0;
    counts.set(linkKey, count + 1);
  }

  console.log();
  for (let line of lines) {
    console.log(line);
  }

  console.log();
  console.log(
    "Here are the links between files contributing most to circular deps"
  );
  const sorted = [...counts.entries()].sort(([ka, va], [kb, vb]) => {
    return va < vb ? 1 : va > vb ? -1 : 0;
  });
  for (let [link, count] of sorted) {
    console.log(`${count}: ${link}`);
  }
};

main();
