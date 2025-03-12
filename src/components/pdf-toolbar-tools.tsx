"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, RotateCcw, RotateCw, FileText } from "lucide-react";

interface PdfToolbarToolsProps {
  onDownload: () => void;
  onPrint: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onShowFileInfo: () => void;
}

const PdfToolbarTools: React.FC<PdfToolbarToolsProps> = ({
  onDownload,
  onPrint,
  onRotateLeft,
  onRotateRight,
  onShowFileInfo,
}) => {
  return (
    <div className="flex gap-1 items-center">
      <Button
        onClick={onDownload}
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-secondary hover:text-primary"
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        onClick={onPrint}
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-secondary hover:text-primary"
      >
        <Printer className="h-4 w-4" />
      </Button>
      <Button
        onClick={onRotateLeft}
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-secondary hover:text-primary"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button
        onClick={onRotateRight}
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-secondary hover:text-primary"
      >
        <RotateCw className="h-4 w-4" />
      </Button>
      <Button
        onClick={onShowFileInfo}
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-secondary hover:text-primary"
      >
        <FileText className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PdfToolbarTools;
