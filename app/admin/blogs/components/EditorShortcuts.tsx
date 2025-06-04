"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const EditorShortcuts = () => {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
              aria-label="Show editor shortcuts"
            >
              <Info size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Editor shortcuts</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editor Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Formatting</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-700">Bold</div>
                <div className="font-mono bg-gray-100 px-1.5 rounded text-xs">Ctrl + B</div>
                <div className="text-gray-700">Italic</div>
                <div className="font-mono bg-gray-100 px-1.5 rounded text-xs">Ctrl + I</div>
                <div className="text-gray-700">Underline</div>
                <div className="font-mono bg-gray-100 px-1.5 rounded text-xs">Ctrl + U</div>
                <div className="text-gray-700">Link</div>
                <div className="font-mono bg-gray-100 px-1.5 rounded text-xs">Ctrl + K</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Lists</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-700">Bullet list</div>
                <div className="font-mono bg-gray-100 px-1.5 rounded text-xs">* + Space</div>
                <div className="text-gray-700">Numbered list</div>
                <div className="font-mono bg-gray-100 px-1.5 rounded text-xs">1. + Space</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Blocks</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-700">Heading 1</div>
                <div className="font-mono bg-gray-100 px-1.5 rounded text-xs"># + Space</div>
                <div className="text-gray-700">Heading 2</div>
                <div className="font-mono bg-gray-100 px-1.5 rounded text-xs">## + Space</div>
                <div className="text-gray-700">Blockquote</div>
                <div className="font-mono bg-gray-100 px-1.5 rounded text-xs"> + Space</div>
                <div className="text-gray-700">Code block</div>
                <div className="font-mono bg-gray-100 px-1.5 rounded text-xs">```</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditorShortcuts;
