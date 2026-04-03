"use client";

import type { ChatStatus } from "ai";
import { CornerDownLeftIcon, Loader2Icon, SquareIcon } from "lucide-react";
import type {
  ComponentProps,
  FormEvent,
  HTMLAttributes,
  KeyboardEvent,
} from "react";
import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

export interface PromptInputMessage {
  text: string;
  files: [];
}

interface PromptInputContextValue {
  input: string;
  setInput: (value: string) => void;
}

const PromptInputContext = createContext<PromptInputContextValue | null>(null);

function usePromptInputContext() {
  const context = useContext(PromptInputContext);

  if (!context) {
    throw new Error("PromptInput components must be used within PromptInput");
  }

  return context;
}

export type PromptInputProps = Omit<
  HTMLAttributes<HTMLFormElement>,
  "onSubmit"
> & {
  initialValue?: string;
  onSubmit: (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
};

export function PromptInput({
  children,
  className,
  initialValue = "",
  onSubmit,
  ...props
}: PromptInputProps) {
  const [input, setInput] = useState(initialValue);

  const value = useMemo(() => ({ input, setInput }), [input]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = input.trim();
    if (!text) {
      return;
    }

    await onSubmit({ files: [], text }, event);
    setInput("");
  };

  return (
    <PromptInputContext.Provider value={value}>
      <form className={cn("w-full", className)} onSubmit={handleSubmit} {...props}>
        {children}
      </form>
    </PromptInputContext.Provider>
  );
}

export type PromptInputBodyProps = HTMLAttributes<HTMLDivElement>;

export function PromptInputBody({
  className,
  ...props
}: PromptInputBodyProps) {
  return <div className={cn("flex flex-col", className)} {...props} />;
}

export type PromptInputTextareaProps = ComponentProps<typeof Textarea>;

export function PromptInputTextarea({
  className,
  onChange,
  onKeyDown,
  placeholder = "What would you like to know?",
  ...props
}: PromptInputTextareaProps) {
  const { input, setInput } = usePromptInputContext();

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <Textarea
      className={cn(
        "field-sizing-content min-h-[72px] max-h-48 resize-none border-0 bg-transparent px-0 py-0 text-base shadow-none focus-visible:ring-0",
        className,
      )}
      name="message"
      onChange={(event) => {
        setInput(event.currentTarget.value);
        onChange?.(event);
      }}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      value={input}
      {...props}
    />
  );
}

export type PromptInputFooterProps = HTMLAttributes<HTMLDivElement>;

export function PromptInputFooter({
  className,
  ...props
}: PromptInputFooterProps) {
  return (
    <div
      className={cn("mt-3 flex items-end justify-between gap-3", className)}
      {...props}
    />
  );
}

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export function PromptInputTools({
  className,
  ...props
}: PromptInputToolsProps) {
  return <div className={cn("flex min-w-0 items-center gap-2", className)} {...props} />;
}

export type PromptInputSubmitProps = ComponentProps<typeof Button> & {
  status?: ChatStatus;
  onStop?: () => void;
};

export function PromptInputSubmit({
  className,
  children,
  onClick,
  onStop,
  status,
  ...props
}: PromptInputSubmitProps) {
  const { input } = usePromptInputContext();
  const isGenerating = status === "submitted" || status === "streaming";

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isGenerating && onStop) {
      event.preventDefault();
      onStop();
      return;
    }

    onClick?.(event);
  };

  let icon = <CornerDownLeftIcon className="size-4" />;

  if (status === "submitted") {
    icon = <Loader2Icon className="size-4 animate-spin" />;
  } else if (status === "streaming") {
    icon = <SquareIcon className="size-3.5 fill-current" />;
  }

  return (
    <Button
      className={cn("size-10 rounded-full", className)}
      disabled={!isGenerating && input.trim() === ""}
      onClick={handleClick}
      size="icon"
      type={isGenerating && onStop ? "button" : "submit"}
      {...props}
    >
      {children ?? icon}
      <span className="sr-only">{isGenerating ? "Stop" : "Submit"}</span>
    </Button>
  );
}
