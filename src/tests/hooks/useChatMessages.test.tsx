import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useChatMessages from "@/hooks/useChatMessages";
import useCreateSessionApi from "@/hooks/api/useCreateSessionApi";
import useGetHistoryApi from "@/hooks/api/useGetHistoryApi";
import { useLoading } from "@/services/LoadingService";
import { useGetSessions } from "@/services/GetSessionsService";
import * as toastModule from "@/hooks/use-toast";
import { readSelectedModel } from "@/hooks/useLocalStorage";
import * as apiModule from "@/api";
import { useTranslation } from "react-i18next";

// Mock all dependencies
vi.mock("@/hooks/api/useCreateSessionApi");
vi.mock("@/hooks/api/useGetHistoryApi");
vi.mock("@/services/LoadingService");
vi.mock("@/services/GetSessionsService");
vi.mock("@/hooks/useLocalStorage");
vi.mock("react-i18next");

// Mock react-usestateref
vi.mock("react-usestateref", () => ({
  default: function useStateRef(initialValue: any) {
    const [state, setState] = React.useState(initialValue);
    const ref = React.useRef(initialValue);

    const setStateWithRef = (newValue: any) => {
      ref.current = newValue;
      setState(newValue);
      return newValue; // Return the value to ensure it's available immediately
    };

    return [state, setStateWithRef, ref];
  },
}));

describe("useChatMessages", () => {
  // Setup common mocks
  const mockSetLoading = vi.fn();
  const mockTranslate = vi.fn((key) => key);
  const mockAppendSessionLocal = vi.fn();
  const mockSetActiveSessionId = vi.fn();
  const mockToast = vi.fn();
  const mockFetchHistory = vi.fn();
  const mockHandleCreateSession = vi.fn();
  const mockPrompt = vi.fn();

  const mockActiveSessionIdRef: { current: string | null } = { current: null };
  const mockActiveSessionIsNew = false;

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();

    // Setup default mock implementations
    (useLoading as any).mockReturnValue({
      setLoading: mockSetLoading,
    });
    (useTranslation as any).mockReturnValue({
      t: mockTranslate,
    });
    (useGetSessions as any).mockReturnValue({
      appendSessionLocal: mockAppendSessionLocal,
      setActiveSessionId: mockSetActiveSessionId,
      activeSessionIdRef: mockActiveSessionIdRef,
      activeSessionIsNew: mockActiveSessionIsNew,
    });

    // Mock toast properly
    vi.spyOn(toastModule, "toast").mockImplementation(mockToast);
    (useGetHistoryApi as any).mockReturnValue({
      fetchHistory: mockFetchHistory,
      loading: false,
    });
    (useCreateSessionApi as any).mockReturnValue({
      handleCreateSession: mockHandleCreateSession,
      error: null,
    });
    (readSelectedModel as any).mockReturnValue({ uid: "model-123" });

    // Mock prompt properly
    vi.spyOn(apiModule, "prompt").mockImplementation(mockPrompt);
    mockPrompt.mockResolvedValue({
      response: { ok: true },
      data: {
        response: "AI response",
        sources: [],
      },
    });

    mockFetchHistory.mockResolvedValue([]);
    mockHandleCreateSession.mockResolvedValue({ id: "new-session-123" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty chat messages", async () => {
    const { result } = renderHook(() => useChatMessages());

    // Wrap any state updates in act
    await act(async () => {
      // Allow any state updates to process
      await Promise.resolve();
    });

    expect(result.current.chatMessages).toEqual([]);
    expect(result.current.loadingHistory).toBe(false);
    expect(result.current.loadingResponse).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle sending a prompt with existing session", async () => {
    mockActiveSessionIdRef.current = "existing-session-123";

    const { result } = renderHook(() => useChatMessages());

    // Wrap any state updates in act
    await act(async () => {
      // Allow any state updates to process
      await Promise.resolve();
    });

    // We need to use a real Promise to ensure state updates are captured
    let resolvePromise: () => void;
    const waitForPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });

    mockPrompt.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            response: { ok: true },
            data: {
              response: "AI response",
              sources: [],
            },
          });
          resolvePromise();
        }, 10);
      });
    });

    await act(async () => {
      result.current.handlePromptAndMessages("Hello AI");
      await waitForPromise;
    });

    // Verify the prompt was sent correctly
    expect(mockPrompt).toHaveBeenCalledWith({
      body: "Hello AI",
      query: {
        sessionId: "existing-session-123",
        uid: "model-123",
      },
      headers: {
        "Content-Type": "text/plain",
      },
    });
  });

  it("should create a new session when sending a prompt without an active session", async () => {
    mockActiveSessionIdRef.current = null;

    // Mock the session creation and update
    mockHandleCreateSession.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newSession = { id: "new-session-123" };
          mockActiveSessionIdRef.current = "new-session-123";
          resolve(newSession);
        }, 10);
      });
    });

    const { result } = renderHook(() => useChatMessages());

    // Wrap any state updates in act
    await act(async () => {
      // Allow any state updates to process
      await Promise.resolve();
    });

    // We need to use a real Promise to ensure state updates are captured
    let resolvePromise: () => void;
    const waitForPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });

    mockPrompt.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            response: { ok: true },
            data: {
              response: "AI response",
              sources: [],
            },
          });
          resolvePromise();
        }, 20);
      });
    });

    await act(async () => {
      result.current.handlePromptAndMessages("Hello AI");
      await waitForPromise;
    });

    // Verify session creation
    expect(mockHandleCreateSession).toHaveBeenCalled();
    expect(mockAppendSessionLocal).toHaveBeenCalledWith({
      id: "new-session-123",
    });
    expect(mockSetActiveSessionId).toHaveBeenCalledWith(
      "new-session-123",
      true,
    );

    // Verify the prompt was sent correctly
    expect(mockPrompt).toHaveBeenCalledWith({
      body: "Hello AI",
      query: {
        sessionId: "new-session-123",
        uid: "model-123",
      },
      headers: {
        "Content-Type": "text/plain",
      },
    });
  });

  it("should handle error when no chat model is selected", async () => {
    (readSelectedModel as any).mockReturnValue(null);

    const { result } = renderHook(() => useChatMessages());

    // Wrap any state updates in act
    await act(async () => {
      // Allow any state updates to process
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.handlePromptAndMessages("Hello AI");
    });

    // Verify error handling
    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "No chat model selected",
      description: "Select a chat model at the sidebar to start chatting",
    });
  });

  it("should handle error when session creation fails", async () => {
    mockActiveSessionIdRef.current = null;
    mockHandleCreateSession.mockResolvedValue(null);

    const { result } = renderHook(() => useChatMessages());

    // Wrap any state updates in act
    await act(async () => {
      // Allow any state updates to process
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.handlePromptAndMessages("Hello AI");
    });

    // Verify error handling
    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Provided session id is invalid",
      description: "Something went wrong. Please try again",
    });
  });

  it("should handle API error when sending prompt", async () => {
    mockActiveSessionIdRef.current = "session-123";
    mockPrompt.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useChatMessages());

    // Wrap any state updates in act
    await act(async () => {
      // Allow any state updates to process
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.handlePromptAndMessages("Hello AI");
    });

    // Verify error handling
    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Failed to get response to prompt",
      description: "Network error",
    });
  });

  it("should handle non-OK response from API", async () => {
    mockActiveSessionIdRef.current = "session-123";
    mockPrompt.mockResolvedValue({
      response: { ok: false, status: 500 },
      data: undefined,
    });

    const { result } = renderHook(() => useChatMessages());

    // Wrap any state updates in act
    await act(async () => {
      // Allow any state updates to process
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.handlePromptAndMessages("Hello AI");
    });

    // Verify error handling
    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Failed to get response to prompt",
      description: "Request failed with status: 500",
    });
  });

  it("should handle null response data", async () => {
    mockActiveSessionIdRef.current = "session-123";
    mockPrompt.mockResolvedValue({
      response: { ok: true },
      data: null,
    });

    const { result } = renderHook(() => useChatMessages());

    // Wrap any state updates in act
    await act(async () => {
      // Allow any state updates to process
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.handlePromptAndMessages("Hello AI");
    });

    // Verify error handling
    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Failed to get response to prompt",
      description: "No response from server",
    });
  });

  it("should update loading states correctly", async () => {
    mockActiveSessionIdRef.current = "session-123";

    // Create a controlled promise to track loading state changes
    let resolvePrompt: () => void;
    mockPrompt.mockImplementation(() => {
      return new Promise((resolve) => {
        resolvePrompt = () => {
          resolve({
            response: { ok: true },
            data: {
              response: "AI response",
              sources: [],
            },
          });
        };
      });
    });

    const { result } = renderHook(() => useChatMessages());

    // Wrap any state updates in act
    await act(async () => {
      // Allow any state updates to process
      await Promise.resolve();
    });

    // Initially not loading
    expect(result.current.loadingResponse).toBe(false);

    // Start the prompt request but don't resolve it yet
    let promptPromise: Promise<void>;
    await act(async () => {
      promptPromise = result.current.handlePromptAndMessages("Hello AI");
    });

    // Should be loading now
    expect(result.current.loadingResponse).toBe(true);

    // Now resolve the prompt
    await act(async () => {
      resolvePrompt();
      await promptPromise;
    });

    // No longer loading after response
    expect(result.current.loadingResponse).toBe(false);
  });

  it("should handle history loading state", async () => {
    (useGetHistoryApi as any).mockReturnValue({
      fetchHistory: mockFetchHistory,
      loading: true,
    });

    const { result } = renderHook(() => useChatMessages());

    // Wrap any state updates in act
    await act(async () => {
      // Allow any state updates to process
      await Promise.resolve();
    });

    expect(result.current.loadingHistory).toBe(true);
    expect(mockSetLoading).toHaveBeenCalledWith(true);
  });
});
