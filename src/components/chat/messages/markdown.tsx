import Link from "next/link";
import { CodeBlock } from "./code";
import type { BundledLanguage } from "shiki";
import React, { memo, isValidElement } from "react";
import { cn, getLanguageFromClassName } from "~/lib/utils";
import { Streamdown, type StreamdownProps } from "streamdown";

const components: Partial<StreamdownProps["components"]> = {
  code: ({ node, className, ...props }) => {
    const inline = node?.position?.start.line === node?.position?.end.line;

    if (!inline) {
      return <code className={className} {...props} />;
    }

    return (
      <code
        className={cn(
          "mx-0.5 text-sm py-0.5 px-[6px] rounded-md bg-muted text-muted-foreground",
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

    let code = "";
    if (
      isValidElement(children) &&
      children.props &&
      typeof children.props === "object" &&
      "children" in children.props &&
      typeof children.props.children === "string"
    ) {
      code = children.props.children;
    } else if (typeof children === "string") {
      code = children;
    }

    return <CodeBlock language={lang}>{code}</CodeBlock>;
  },
  a: ({ node, children, ...props }) => {
    return (
      // @ts-expect-error
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return <Streamdown components={components}>{children}</Streamdown>;
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
