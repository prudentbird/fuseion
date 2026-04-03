"use client";

import Link from "next/link";
import { isValidElement } from "react";
import type { BundledLanguage } from "shiki";
import type { StreamdownProps } from "streamdown";

import { CodeBlock } from "~/components/chat/messages/code";
import { cn, getLanguageFromClassName } from "~/lib/utils";

export const streamdownComponents: Partial<StreamdownProps["components"]> = {
  code: ({ node, className, ...props }) => {
    const inline = node?.position?.start.line === node?.position?.end.line;

    if (!inline) {
      return <code className={className} {...props} />;
    }

    return (
      <code
        className={cn(
          "mx-0.5 rounded-md bg-muted px-[6px] py-0.5 text-sm text-muted-foreground",
          className,
        )}
        {...props}
      />
    );
  },
  pre: ({ node, children }) => {
    let language: BundledLanguage | null = getLanguageFromClassName(
      node?.properties?.className,
    );

    if (!language && isValidElement(children)) {
      language = getLanguageFromClassName(
        (children as unknown as { props: { className: string } })?.props
          ?.className,
      );
    }

    const lang = (language ?? "txt") as BundledLanguage;

    let source = "";
    if (
      isValidElement(children) &&
      children.props &&
      typeof children.props === "object" &&
      "children" in children.props &&
      typeof children.props.children === "string"
    ) {
      source = children.props.children;
    } else if (typeof children === "string") {
      source = children;
    }

    return <CodeBlock language={lang}>{source}</CodeBlock>;
  },
  a: ({ children, ...props }) => {
    return (
      // @ts-expect-error Streamdown anchor props are broader than Next Link props
      <Link
        className="text-blue-500 underline-offset-4 hover:underline"
        rel="noreferrer"
        target="_blank"
        {...props}
      >
        {children}
      </Link>
    );
  },
};
