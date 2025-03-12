"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
  Ellipsis,
} from "lucide-react";
import { useWindow } from "@/hooks/useWindow.ts";
import PdfToolbarTools from "@/components/pdf-toolbar-tools.tsx";
import { useHandleClickOutside } from "@/hooks/useHandleClickOutside.ts";

interface PdfToolbarProps {
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onSearch: (searchTerm: string) => void;
  onDownload: () => void;
  onPrint: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onShowFileInfo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  currentZoom: number;
  searchResults: { pageIndex: number; matchIndex: number; text: string }[];
  currentSearchIndex: number;
  onNextSearchResult: () => void;
  onPreviousSearchResult: () => void;
  collapseButtonsBreakpoint: number;
}

const PdfToolbar: React.FC<PdfToolbarProps> = ({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  onSearch,
  onDownload,
  onPrint,
  onRotateLeft,
  onRotateRight,
  onShowFileInfo,
  onZoomIn,
  onZoomOut,
  currentZoom,
  searchResults,
  currentSearchIndex,
  onNextSearchResult,
  onPreviousSearchResult,
  collapseButtonsBreakpoint,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCollapsedTools, setShowCollapsedTools] = useState(false);
  const { innerWidth } = useWindow();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      toolsMenuRef.current &&
      !toolsMenuRef.current.contains(event.target as Node)
    ) {
      setShowCollapsedTools(false);
    }
  };

  const toolsMenuRef =
    useHandleClickOutside<HTMLDivElement>(handleOutsideClick);

  return (
    <div className="flex items-center justify-between p-2 border-b gap-2 bg-primary-foreground">
      <div className="flex items-center">
        <Button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-secondary hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          {currentPage} / {totalPages}
        </span>
        <Button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-secondary hover:text-primary"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 max-w-xs flex items-center">
        <form onSubmit={handleSearch} className="relative flex-1 ">
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="h-8 pr-8 bg-primary-foreground"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0 h-8 w-8 hover:bg-secondary hover:text-primary"
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>
        {searchResults.length > 0 && (
          <>
            <Button
              onClick={onPreviousSearchResult}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-secondary hover:text-primary"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <span className="text-sm text-primary">
              {currentSearchIndex + 1} of {searchResults.length}
            </span>
            <Button
              onClick={onNextSearchResult}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-secondary hover:text-primary"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center">
        {innerWidth > collapseButtonsBreakpoint ? (
          <PdfToolbarTools
            onDownload={onDownload}
            onPrint={onPrint}
            onRotateLeft={onRotateLeft}
            onRotateRight={onRotateRight}
            onShowFileInfo={onShowFileInfo}
          />
        ) : (
          <div className="relative" ref={toolsMenuRef}>
            <Button
              onClick={() => { setShowCollapsedTools(!showCollapsedTools); }}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-secondary hover:text-primary"
            >
              <Ellipsis className="h-4 w-4" />
            </Button>
            {showCollapsedTools && (
              <div className="absolute top-full right-0 mt-1 p-2 bg-background border rounded-md shadow-md z-10">
                <PdfToolbarTools
                  onDownload={onDownload}
                  onPrint={onPrint}
                  onRotateLeft={onRotateLeft}
                  onRotateRight={onRotateRight}
                  onShowFileInfo={onShowFileInfo}
                />
              </div>
            )}
          </div>
        )}
        <Button
          onClick={onZoomOut}
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-secondary hover:text-primary"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm min-w-[48px] text-center">
          {Math.round(currentZoom * 100)}%
        </span>
        <Button
          onClick={onZoomIn}
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-secondary hover:text-primary"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PdfToolbar;
