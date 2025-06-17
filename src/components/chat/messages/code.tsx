'use client';
import { type ReactNode, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '~/components/ui/tooltip';
import { WrapText, Download, Copy, Check, AlignLeft } from 'lucide-react';
import { toast } from 'sonner';

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const [isWrapped, setIsWrapped] = useState(false);

  const copyToClipboard = async () => {
    const codeText = typeof children === 'string' ? children : String(children);
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadCode = () => {
    const codeText = typeof children === 'string' ? children : String(children);
    const language = className?.replace('language-', '') || 'txt';
    const blob = new Blob([codeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!inline && className?.includes('language-')) {
    const language = className.replace('language-', '');

    return (
      <div className="relative mt-2 w-full" {...props}>
        <div className="flex items-center justify-between gap-5 rounded-t-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground border border-b-0">
          <span className="font-mono">{language}</span>
          <TooltipProvider delayDuration={0}>
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadCode}
                    aria-label="Download code"
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download code</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    aria-label="Copy code to clipboard"
                    className="h-8 w-8 p-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsWrapped(!isWrapped)}
                    aria-label="Toggle text wrapping"
                    className="h-8 w-8 p-0"
                  >
                    {isWrapped ? (
                      <WrapText className="h-4 w-4" />
                    ) : (
                      <AlignLeft className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isWrapped ? 'Disable text wrapping' : 'Enable text wrapping'}
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        <div className="relative border border-t-0 rounded-b-lg bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
          <pre
            className={`
              m-0 p-4 text-sm text-zinc-900 dark:text-zinc-50 bg-transparent
              ${isWrapped ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-auto'}
            `}
          >
            <code>{children}</code>
          </pre>
        </div>
      </div>
    );
  } else {
    return (
      <code
        className={`mx-0.5 text-sm py-1 px-[7px] rounded-md bg-muted text-muted-foreground ${className || ''}`}
        {...props}
      >
        {children}
      </code>
    );
  }
}
