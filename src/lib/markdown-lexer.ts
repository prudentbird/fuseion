/**
 * Lightweight line-based Markdown block lexer.
 *
 * Splits a markdown string into stable top-level blocks while:
 * - Preserving fenced code blocks (``` or ~~~) even with blank lines inside
 * - Treating horizontal rules as standalone blocks
 * - Splitting other content on blank lines
 *
 * This is intentionally simple and fast, not a full Markdown parser.
 */
export function splitMarkdownIntoBlocks(markdown: string): Array<string> {
  if (markdown.trim() === "") return [markdown];

  const lines: Array<string> = markdown.split(/\r?\n/);
  const blocks: Array<string> = [];
  let currentBlockLines: Array<string> = [];

  let insideFence = false;
  let fenceChar: "`" | "~" | null = null;
  let fenceLen = 0;

  const isFenceLine = (line: string) => {
    const trimmed = line.trimStart();
    const match = /^(?:[`~]{3,})/.exec(trimmed);
    if (!match) return null;
    const marker = match[0];
    const char = marker[0] as "`" | "~";
    return { char, len: marker.length } as const;
  };

  const isHorizontalRule = (line: string) => {
    // Markdown HR: --- *** ___ with optional spaces, at least 3
    const trimmed = line.trim();
    if (insideFence) return false;
    return /^ {0,3}(([-*_])([ \t]*\2){2,})$/.test(trimmed);
  };

  const pushCurrent = () => {
    if (currentBlockLines.length === 0) return;
    // Avoid trailing blank lines inside a block
    let end = currentBlockLines.length - 1;
    while (end >= 0 && currentBlockLines[end].trim() === "") end--;
    const slice = currentBlockLines.slice(0, end + 1).join("\n");
    if (slice !== "") blocks.push(slice);
    currentBlockLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle fenced code blocks
    const fenceInfo = isFenceLine(line);
    if (fenceInfo) {
      const { char, len } = fenceInfo;
      if (!insideFence) {
        // starting a fence
        insideFence = true;
        fenceChar = char;
        fenceLen = len;
        currentBlockLines.push(line);
        continue;
      } else if (
        fenceChar === char &&
        line.trimStart().startsWith(char.repeat(fenceLen))
      ) {
        // closing the same fence
        currentBlockLines.push(line);
        insideFence = false;
        fenceChar = null;
        fenceLen = 0;
        continue;
      }
    }

    if (insideFence) {
      currentBlockLines.push(line);
      continue;
    }

    // Standalone horizontal rule block
    if (isHorizontalRule(line)) {
      pushCurrent();
      blocks.push(line.trim());
      continue;
    }

    // Blank line splits blocks (outside fences)
    if (line.trim() === "") {
      pushCurrent();
      continue;
    }

    currentBlockLines.push(line);
  }

  // Flush remaining content
  pushCurrent();

  // Fallback: if nothing parsed, return original
  return blocks.length > 0 ? blocks : [markdown];
}
