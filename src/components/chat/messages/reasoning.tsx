"use client";

import { cn } from "~/lib/utils";
import { Markdown } from "./markdown";
import { memo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string;
}

function MessageReasoningComponent({
  isLoading,
  reasoning,
}: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: "0.5rem",
    },
  };

  return (
    <div className="flex flex-col w-full">
      <Button
        data-testid="message-reasoning-toggle"
        variant="ghost"
        size="icon"
        className="p-0 bg-transparent hover:bg-transparent dark:hover:bg-transparent w-full h-fit flex flex-row gap-2 justify-start"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronRight
          className={cn(
            "w-4 h-4 text-zinc-600 dark:text-zinc-400 transition-transform",
            isExpanded ? "rotate-90" : "",
          )}
        />
        <span className="font-medium text-sm text-zinc-600 dark:text-zinc-400">
          Reasoning
        </span>
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      </Button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            data-testid="message-reasoning"
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
            className="text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 flex flex-col gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
          >
            <Markdown>{reasoning}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const MessageReasoning = memo(
  MessageReasoningComponent,
  (prevProps, nextProps) =>
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.reasoning === nextProps.reasoning,
);
