import * as React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import useGetKnowledgeFileApi from "@/hooks/api/useGetKnowledgeFileApi";
import LoadingAnimation from "./loading-animation";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import PdfToolbar from "./pdf-toolbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PDFDocumentProxy } from "pdfjs-dist";
import printJS from "print-js";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import { t } from "i18next";

interface PdfViewerProps {
  fileUuid: string;
  label: string;
  collapseToolbarButtonsBreakpoint?: number;
}

interface FileInfo {
  name?: string;
  size: string;
  type: string;
  lastModified?: string;
}

interface SearchResult {
  pageIndex: number;
  matchIndex: number;
  text: string;
}

const PdfViewer = ({
  fileUuid,
  label,
  collapseToolbarButtonsBreakpoint,
}: PdfViewerProps) => {
  const { fileData } = useGetKnowledgeFileApi({ uuid: fileUuid });
  const [url, setUrl] = React.useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [showFileInfo, setShowFileInfo] = useState<boolean>(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState<number>(-1);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);

  useEffect(() => {
    if (fileData) {
      const newUrl = URL.createObjectURL(fileData);
      setUrl(newUrl);
      const info: FileInfo = {
        size: `${(fileData.size / 1024 / 1024).toFixed(2)} MB`,
        type: fileData.type,
      };
      if (fileData instanceof File) {
        info.name = fileData.name;
        info.lastModified = new Date(fileData.lastModified).toLocaleString();
      }
      setFileInfo(info);
    }
  }, [fileData]);

  const onDocumentLoadSuccess = ({ numPages }: PDFDocumentProxy) => {
    setNumPages(numPages);
    setCurrentPage(1);
    pageRefs.current = new Array<HTMLDivElement | null>(numPages).fill(null);

    // Initialize the observer after the document is loaded
    initializeObserver();
  };

  const initializeObserver = useCallback(() => {
    if (observer) {
      observer.disconnect();
    }

    const observerOptions = {
      root: containerRef.current,
      threshold: 0.5,
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const pageNumber = Number.parseInt(
            entry.target.getAttribute("data-page-number") ?? "1",
            10,
          );
          updateCurrentPage(pageNumber);
        }
      });
    };

    const updateCurrentPage = (pageNumber: number) => {
      setCurrentPage((prevPage) => {
        if (prevPage !== pageNumber) return pageNumber;
        return prevPage;
      });
    };

    const newObserver = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );
    setObserver(newObserver);

    pageRefs.current.forEach((ref) => {
      if (ref) {
        newObserver.observe(ref);
      }
    });
  }, [observer]); // Added observer to dependencies

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => {
      const newPage = Math.max(prevPage - 1, 1);
      scrollToPage(newPage);
      return newPage;
    });
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => {
      const newPage = Math.min(prevPage + 1, numPages);
      scrollToPage(newPage);
      return newPage;
    });
  };

  const scrollToPage = (pageNumber: number) => {
    const pageElement = pageRefs.current[pageNumber - 1];
    if (pageElement && containerRef.current) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSearch = async (term: string) => {
    if (!term || !pdfDocument) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const results: SearchResult[] = [];

    for (let pageIndex = 0; pageIndex < pdfDocument.numPages; pageIndex++) {
      const page = await pdfDocument.getPage(pageIndex + 1);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item): item is TextItem => "str" in item)
        .map((item: TextItem) => item.str)
        .join(" ");

      let matchIndex = 0;
      let index = pageText.toLowerCase().indexOf(term.toLowerCase());

      while (index !== -1) {
        results.push({
          pageIndex,
          matchIndex: matchIndex++,
          text: pageText.substring(index, index + term.length),
        });
        index = pageText.toLowerCase().indexOf(term.toLowerCase(), index + 1);
      }
    }

    setSearchResults(results);
    if (results.length > 0) {
      setCurrentSearchIndex(0);
      const firstResultPage = results[0].pageIndex + 1;
      setCurrentPage(firstResultPage);
      scrollToPage(firstResultPage);
    }
  };

  const handleNextSearchResult = () => {
    if (searchResults.length > 0) {
      const nextIndex = (currentSearchIndex + 1) % searchResults.length;
      setCurrentSearchIndex(nextIndex);
      const nextPage = searchResults[nextIndex].pageIndex + 1;
      setCurrentPage(nextPage);
      scrollToPage(nextPage);
    }
  };

  const handlePreviousSearchResult = () => {
    if (searchResults.length > 0) {
      const prevIndex =
        currentSearchIndex <= 0
          ? searchResults.length - 1
          : currentSearchIndex - 1;
      setCurrentSearchIndex(prevIndex);
      const prevPage = searchResults[prevIndex].pageIndex + 1;
      setCurrentPage(prevPage);
      scrollToPage(prevPage);
    }
  };

  const handleDownload = () => {
    // Check if label ends with .pdf
    const labelWithExtension = label.toLowerCase().endsWith(".pdf")
      ? label
      : `${label}.pdf`;

    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = labelWithExtension;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (url) {
      printJS(url);
    }
  };

  const handleRotateLeft = () => {
    setRotation((prevRotation) => (prevRotation - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  const handleShowFileInfo = () => {
    setShowFileInfo(true);
  };

  const handleZoomIn = () => {
    setScale((prevScale) => {
      const newScale = Math.min(prevScale + 0.1, 3);
      setTimeout(() => {
        updatePageNumbersAfterZoom();
      }, 100);
      return newScale;
    });
  };

  const handleZoomOut = () => {
    setScale((prevScale) => {
      const newScale = Math.max(prevScale - 0.1, 0.5);
      setTimeout(() => {
        updatePageNumbersAfterZoom();
      }, 100);
      return newScale;
    });
  };

  const updatePageNumbersAfterZoom = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const visiblePages = pageRefs.current.filter((pageRef) => {
        if (pageRef) {
          const pageRect = pageRef.getBoundingClientRect();
          return (
            pageRect.top < containerRect.bottom &&
            pageRect.bottom > containerRect.top
          );
        }
        return false;
      });
      if (visiblePages.length > 0) {
        const firstVisiblePageIndex = pageRefs.current.indexOf(visiblePages[0]);
        setCurrentPage(firstVisiblePageIndex + 1);
      }
    }
  }, [pageRefs, containerRef]); // Added missing dependencies

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey) {
          e.preventDefault();
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          setScale((prevScale) => {
            const newScale = Math.min(Math.max(prevScale + delta, 0.5), 3);
            setTimeout(() => {
              updatePageNumbersAfterZoom();
            }, 100);
            return newScale;
          });
        }
      };
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => {
        container.removeEventListener("wheel", handleWheel);
      };
    }
  }, []);

  useEffect(() => {
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [observer]);

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <PdfToolbar
        currentPage={currentPage}
        totalPages={numPages}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        onSearch={(searchTerm: string) => {
          void handleSearch(searchTerm);
        }}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onRotateLeft={handleRotateLeft}
        onRotateRight={handleRotateRight}
        onShowFileInfo={handleShowFileInfo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        currentZoom={scale}
        searchResults={searchResults}
        currentSearchIndex={currentSearchIndex}
        onNextSearchResult={handleNextSearchResult}
        onPreviousSearchResult={handlePreviousSearchResult}
        collapseButtonsBreakpoint={collapseToolbarButtonsBreakpoint}
      />
      <div
        ref={containerRef}
        className="flex-grow overflow-auto bg-primary-foreground"
      >
        {url ? (
          <Document
            file={url}
            onLoadSuccess={(pdf) => {
              onDocumentLoadSuccess(pdf);
              setPdfDocument(pdf);
            }}
            className="flex flex-col items-center"
          >
            {Array.from(new Array(numPages), (_, index) => (
              <div
                key={`page_${(index + 1).toString()}`}
                ref={(el) => (pageRefs.current[index] = el)}
                className="mb-4"
              >
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  rotate={rotation}
                  className="shadow-md"
                  inputRef={(ref) => {
                    if (ref) {
                      pageRefs.current[index] = ref;
                      if (observer) {
                        observer.observe(ref);
                      }
                    }
                  }}
                  data-page-number={index + 1}
                  onRenderSuccess={() => {
                    if (index === 0) {
                      setCurrentPage(1);
                    }
                  }}
                />
              </div>
            ))}
          </Document>
        ) : (
          <LoadingAnimation
            loadingMessage="Loading PDF..."
            className="bg-gray-100"
          />
        )}
      </div>
      <Dialog open={showFileInfo} onOpenChange={setShowFileInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("knowledge.header")}</DialogTitle>
          </DialogHeader>
          {fileInfo && (
            <div>
              <p>
                <strong>{t("knowledge.name")}:</strong> {label}
              </p>
              <p>
                <strong>{t("knowledge.size")}:</strong> {fileInfo.size}
              </p>
              <p>
                <strong>{t("knowledge.type")}:</strong> {fileInfo.type}
              </p>
              {fileInfo.lastModified && (
                <p>
                  <strong>{t("knowledge.lastUpdate")}:</strong>{" "}
                  {fileInfo.lastModified}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PdfViewer;
