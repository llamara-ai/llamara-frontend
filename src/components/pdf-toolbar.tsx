"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  RotateCcw,
  RotateCw,
  FileText,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

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
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

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
            <span className="text-sm text-primary">
              {currentSearchIndex + 1} of {searchResults.length}
            </span>
            <Button
              onClick={onPreviousSearchResult}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-secondary hover:text-primary"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
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
