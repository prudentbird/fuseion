'use client';

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { Model } from '~/data/models';

interface ModelPickerProps {
  selectedModel: Model;
  models: Model[];
  onModelChange: (model: Model) => void;
}

const ModelPicker = ({
  selectedModel,
  models,
  onModelChange,
}: ModelPickerProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="px-2 py-1.25 flex items-center justify-center gap-1 h-fit text-[#a0a0a0] hover:bg-[#404040] hover:text-white border-0 bg-transparent text-xs focus:outline-none"
        >
          {selectedModel.name}
          <ChevronDown className="ml-2 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="bg-[#2a2a2a] border-[#404040]"
      >
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model)}
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
