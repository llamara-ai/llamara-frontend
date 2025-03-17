import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useFileStatus from "@/hooks/useFileStatus";
import { getKnowledgeApiFunction } from "@/hooks/api/useGetKnowledgeApi";
import { useGetKnowledgeList } from "@/services/GetKnowledgeListService";

// Mock the dependencies
vi.mock("@/hooks/api/useGetKnowledgeApi", () => ({
  getKnowledgeApiFunction: vi.fn(),
}));

vi.mock("@/services/GetKnowledgeListService", () => ({
  useGetKnowledgeList: vi.fn(),
}));

describe("useFileStatus", () => {
  // Setup mocks
  const mockUpdateLocalKnowledge = vi.fn();
  const mockAddLocalKnowledge = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();

    // Reset mocks
    vi.clearAllMocks();

    // Setup mock implementations
    (useGetKnowledgeList as any).mockReturnValue({
      updateLocalKnowledge: mockUpdateLocalKnowledge,
      addLocalKnowledge: mockAddLocalKnowledge,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should register files and start interval", async () => {
    // Mock knowledge data
    const pendingKnowledge = { id: "123", ingestionStatus: "PENDING" };
    const completedKnowledge = { id: "456", ingestionStatus: "SUCCEEDED" };

    // Setup mock implementation for getKnowledgeApiFunction
    (getKnowledgeApiFunction as any).mockImplementation((fileId: string) => {
      if (fileId === "pending-file") return Promise.resolve(pendingKnowledge);
      if (fileId === "completed-file")
        return Promise.resolve(completedKnowledge);
      return Promise.resolve(null);
    });

    // Render the hook
    const { result } = renderHook(() => useFileStatus());

    // Register files
    await act(async () => {
      await result.current.registerFiles(["pending-file", "completed-file"]);
    });

    // Verify addLocalKnowledge was called with both knowledge objects
    expect(mockAddLocalKnowledge).toHaveBeenCalledWith([
      pendingKnowledge,
      completedKnowledge,
    ]);

    // Verify interval was started and checkFileStatus is called
    await act(async () => {
      vi.advanceTimersByTime(5000); // Advance by fetchTimeout
    });

    // Verify getKnowledgeApiFunction was called for the pending file
    expect(getKnowledgeApiFunction).toHaveBeenCalledWith("123");
  });

  it("should update knowledge status when it changes", async () => {
    // Mock initial pending knowledge
    const pendingKnowledge = { id: "123", ingestionStatus: "PENDING" };
    const succeededKnowledge = { id: "123", ingestionStatus: "SUCCEEDED" };

    // Setup mock implementation for getKnowledgeApiFunction
    // First call returns PENDING, second call returns SUCCEEDED
    (getKnowledgeApiFunction as any)
      .mockImplementationOnce(() => Promise.resolve(pendingKnowledge))
      .mockImplementationOnce(() => Promise.resolve(succeededKnowledge));

    // Render the hook
    const { result } = renderHook(() => useFileStatus());

    // Register file
    await act(async () => {
      await result.current.registerFiles(["pending-file"]);
    });

    // Verify the file was added to knowledgeListRef
    expect(result.current.knowledgeList).toEqual([pendingKnowledge]);

    // Advance timer to trigger checkFileStatus
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // Verify updateLocalKnowledge was called with the updated knowledge
    expect(mockUpdateLocalKnowledge).toHaveBeenCalledWith([succeededKnowledge]);
  });

  it("should clear interval when component unmounts", async () => {
    // Setup spy on clearInterval
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");

    // Render the hook
    const { result, unmount } = renderHook(() => useFileStatus());

    // Register a file to start the interval
    await act(async () => {
      await (getKnowledgeApiFunction as any).mockResolvedValueOnce({
        id: "123",
        ingestionStatus: "PENDING",
      });
      await result.current.registerFiles(["test-file"]);
    });

    // Unmount the component
    unmount();

    // Verify clearInterval was called
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
