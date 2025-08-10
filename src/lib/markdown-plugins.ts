import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import rehypeSanitize from "rehype-sanitize";
import type { PluggableList } from "unified";
import { rehypeInlineCodeProperty } from "react-shiki";

export const remarkPlugins: PluggableList = [
  remarkGfm,
  remarkBreaks,
  [remarkMath, { singleDollarTextMath: false }],
];

export const rehypePlugins: PluggableList = [
  rehypeInlineCodeProperty,
  [rehypeKatex, { output: "html" }],
  rehypeSanitize,
];
