'use client';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '~/components/ui/tooltip';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { type ReactNode, useState } from 'react';
import ShikiHighlighter, { Element } from 'react-shiki';
import { WrapText, Download, Copy, Check, AlignLeft } from 'lucide-react';

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: {
  node?: Element | undefined;
  inline?: boolean;
  className?: string;
  children?: ReactNode | undefined;
}) {
  const [copied, setCopied] = useState(false);
  const [isWrapped, setIsWrapped] = useState(false);

  const code =
    typeof children === 'string' ? children.trim() : String(children).trim();
  const match = className?.match(/language-(\w+)/);
  const ext = match ? match[1] : 'txt';

  const copyToClipboard = async () => {
    const codeText = typeof children === 'string' ? children : String(children);
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const downloadCode = () => {
    const codeText = typeof children === 'string' ? children : String(children);
    const blob = new Blob([codeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!inline) {
    return (
      <div className="relative mt-2 w-full" {...props}>
        <div className="flex items-center justify-between gap-5 rounded-t-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground border border-b-0">
          <span className="font-mono">{ext}</span>
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

        <div className="relative border border-t-0 rounded-b-lg overflow-hidden">
          <ShikiHighlighter
            delay={150}
            tabindex={2}
            language={ext}
            theme="dark-plus"
            showLanguage={false}
            showLineNumbers={false}
            className={`${isWrapped ? 'shiki-wrap' : ''}`}
          >
            {code}
          </ShikiHighlighter>
        </div>
      </div>
    );
  } else {
    return (
      <code
        className={`mx-0.5 text-sm py-0.5 px-[6px] rounded-md bg-muted text-muted-foreground ${className || ''}`}
        {...props}
      >
        {children}
      </code>
    );
  }
}
