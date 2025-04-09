/* eslint-disable */
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
    (getKnowledgeApiFunction as any)
      .mockImplementationOnce(() => Promise.resolve(pendingKnowledge))
      .mockImplementationOnce(() => Promise.resolve(completedKnowledge))
      // This is for the checkFileStatus call
      .mockImplementationOnce(() => Promise.resolve(pendingKnowledge));

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

    // Clear previous calls to getKnowledgeApiFunction
    vi.clearAllMocks();

    // Directly call the exposed checkFileStatus method
    await act(async () => {
      if (result.current?._checkFileStatus) {
        await result.current._checkFileStatus();
      }
    });

    // Verify getKnowledgeApiFunction was called for the pending file's ID
    expect(getKnowledgeApiFunction).toHaveBeenCalledWith("123");
  });

  it("should update knowledge status when it changes", async () => {
    // Mock initial pending knowledge
    const pendingKnowledge = { id: "123", ingestionStatus: "PENDING" };
    const succeededKnowledge = { id: "123", ingestionStatus: "SUCCEEDED" };

    // Setup mock implementation for getKnowledgeApiFunction
    // First call returns PENDING (during registerFiles)
    (getKnowledgeApiFunction as any)
      .mockImplementationOnce(() => Promise.resolve(pendingKnowledge))
      // Second call returns SUCCEEDED (during checkFileStatus)
      .mockImplementationOnce(() => Promise.resolve(succeededKnowledge));

    // Render the hook
    const { result } = renderHook(() => useFileStatus());

    // Register file
    await act(async () => {
      await result.current.registerFiles(["pending-file"]);
    });

    // Verify the file was added to knowledgeListRef
    expect(result.current.knowledgeList).toEqual([pendingKnowledge]);

    // Clear previous calls
    mockUpdateLocalKnowledge.mockClear();

    // Directly call the exposed checkFileStatus method
    await act(async () => {
      if (result.current?._checkFileStatus) {
        await result.current._checkFileStatus();
      }
    });

    // Verify updateLocalKnowledge was called with the updated knowledge
    expect(mockUpdateLocalKnowledge).toHaveBeenCalledWith([succeededKnowledge]);
  });
});
