export function stripIndentation(str: string) {
  return str
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
}
