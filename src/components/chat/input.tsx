'use client';

import { useState } from 'react';
import ModelPicker from './model-picker';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import type { UIMessage, UseChatHelpers } from '@ai-sdk/react';
import { ArrowUp, Paperclip, FileText, Square } from 'lucide-react';
import { Model } from '~/data/models';
import { MessageMetadata } from '~/types/message';

interface ChatInputProps {
  stop: UseChatHelpers<UIMessage<MessageMetadata>>['stop'];
  status: UseChatHelpers<UIMessage<MessageMetadata>>['status'];
  sendMessage: UseChatHelpers<UIMessage<MessageMetadata>>['sendMessage'];
  models: Model[];
  selectedModel: Model;
  setSelectedModel: (model: Model) => void;
}

const ChatInput = ({
  stop,
  status,
  models,
  sendMessage,
  selectedModel,
  setSelectedModel,
}: ChatInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage({
        role: 'user',
        parts: [
          {
            type: 'text',
            text: inputValue.trim(),
          },
        ],
        metadata: { model: selectedModel },
      });
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <div className="absolute bottom-0 z-10 w-full px-2">
      <div className="relative mx-auto flex w-full max-w-3xl flex-col text-center">
        <div className="relative bg-[#2a2a2a] border border-[#404040] rounded-t-xl p-3 pb-safe-offset-3">
          <form onSubmit={handleSend}>
            <div className="mb-4">
              <Textarea
                id="chat-input"
                name="chat-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message here..."
                className="min-h-[40px] max-h-[120px] resize-none !border-none !bg-transparent text-[#a0a0a0] placeholder:text-[#666666] focus-visible:ring-0 focus-visible:ring-offset-0 text-base p-0 shadow-none focus:shadow-none"
              />
            </div>

            <div className="flex items-end justify-between h-full -mb-px mt-2">
              <div className="flex items-center gap-1 ml-[-7px] mb-[-4px]">
                <ModelPicker
                  selectedModel={selectedModel}
                  models={models}
                  onModelChange={(model) => {
                    setSelectedModel(model);
                  }}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="px-2 py-1.25 flex items-center justify-center gap-1 h-fit text-[#a0a0a0] hover:bg-[#404040] hover:text-white border-0 bg-transparent text-xs rounded-full"
                >
                  <Paperclip className="!h-3 !w-3" />
                  Attach
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="px-2 py-1.25 flex items-center justify-center gap-1 h-fit text-[#a0a0a0] hover:bg-[#404040] hover:text-white border-0 bg-transparent text-xs rounded-full"
                >
                  <FileText className="!h-3 !w-3" />
                  <span className="max-sm:hidden sm:ml-0.5">Import</span>
                </Button>
              </div>
              {status !== 'ready' ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={stop}
                  size="sm"
                  className="h-8 w-8 p-0 mb-[-4px] rounded-md"
                >
                  <Square className="h-4 w-4 fill-[#a0a0a0] text-[#a0a0a0]" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!inputValue.trim()}
                  size="sm"
                  className={`h-8 w-8 p-0 mb-[-4px] bg-[#404040] hover:bg-[#505050] disabled:bg-[#333333] disabled:opacity-50 rounded-md ${inputValue.trim() ? 'bg-[#404040]' : 'bg-[#333333]'}`}
                >
                  <ArrowUp className="h-4 w-4 text-white" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
