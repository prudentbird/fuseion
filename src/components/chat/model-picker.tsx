"use client";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { Session } from "next-auth";
import { ChevronDown } from "lucide-react";
import { Model, models } from "~/data/models";
import { Button } from "~/components/ui/button";
import { saveModelAsCookie } from "~/app/(chat)/actions";
import { entitlementsByUserTier } from "~/lib/ai/entitlements";
import { startTransition, useMemo, useOptimistic, useState } from "react";

interface ModelPickerProps {
  session: Session;
  selectedModel: Model;
}

const ModelPicker = ({ session, selectedModel }: ModelPickerProps) => {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] = useOptimistic(
    selectedModel.id,
  );

  const availableModels = useMemo(() => {
    return models.filter((model) => {
      if (session.user.tier === "free") {
        return (
          entitlementsByUserTier.free.availableChatModelIds?.includes(
            model.id,
          ) ?? false
        );
      }

      return true;
    });
  }, [session.user.tier]);

  const selectedChatModel = useMemo(
    () =>
      availableModels.find((chatModel) => chatModel.id === optimisticModelId),
    [optimisticModelId, availableModels],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="px-2 py-1.25 flex items-center justify-center gap-1 h-fit text-[#a0a0a0] hover:bg-[#404040] hover:text-white border-0 bg-transparent text-xs focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {selectedChatModel?.name}
          <ChevronDown className="ml-2 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="bg-[#2a2a2a] border-0 focus:outline-none"
      >
        {availableModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onSelect={() => {
              setOpen(false);

              startTransition(() => {
                setOptimisticModelId(model.id);
                saveModelAsCookie(model);
              });
            }}
            className="text-[#a0a0a0] hover:bg-[#404040] hover:text-white focus:bg-[#404040] focus:text-white focus:outline-none"
          >
            {model.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelPicker;
