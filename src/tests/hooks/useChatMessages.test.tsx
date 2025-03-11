import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useChatMessages from "@/hooks/useChatMessages";
import usePromptApi from "@/hooks/api/useSendPromptApi";
import useGetHistoryApi from "@/hooks/api/useGetHistoryApi";
import type { ReactNode } from "react";
import { AppContextProvider } from "@/services/AppContextService";
import CacheProvider from "@/services/CacheService";
import { LoadingProvider } from "@/services/LoadingService";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { BrowserRouter } from "react-router-dom";

// Mock the configuration
vi.mock("@/config", () => ({
  default: {
    securityConfig: {
      anonymousUserSessionTimeout: 3600,
      anonymousUserEnabled: true,
    },
    // Add other configuration values that might be needed
  },
}));

// Mock the useKeepAliveSession hook
vi.mock("@/hooks/useKeepAliveSession", () => ({
  useKeepAliveSession: vi.fn(),
}));

// Mock the AppContextService
vi.mock("@/services/AppContextService", () => {
  const setCurrentActiveSessionId = vi.fn();
  const useAppContext = vi.fn(() => ({
    setCurrentActiveSessionId,
    currentActiveSessionId: "mock-session-id",
    // Add other context values that might be needed
  }));

  return {
    AppContextProvider: ({ children }: { children: ReactNode }) => children,
    useAppContext,
  };
});

// Mock the GetSessionsService
vi.mock("@/services/GetSessionsService", () => {
  const useGetSessions = vi.fn(() => ({
    sessions: [],
    loading: false,
    error: null,
    fetchSessions: vi.fn(),
    appendSessionLocal: vi.fn(),
    setCurrentActiveSessionId: vi.fn(),
  }));

  return {
    useGetSessions,
  };
});

vi.mock("@/hooks/api/useCreateSessionApi", () => ({
  default: vi.fn(() => ({
    handleCreateSession: vi.fn().mockResolvedValue({ id: "new-session-id" }),
    error: null,
  })),
}));

vi.mock("@/hooks/api/useSendPromptApi", () => ({
  default: vi.fn(() => ({
    response: null,
    loading: false,
    error: null,
    sendPrompt: vi
      .fn()
      .mockResolvedValue({ response: "AI response", sources: [] }),
  })),
}));

vi.mock("@/hooks/api/useGetHistoryApi", () => ({
  default: vi.fn(() => ({
    fetchHistory: vi.fn().mockResolvedValue([]),
    loading: false,
  })),
}));

vi.mock("@/hooks/useLocalStorage", () => ({
  readSelectedModel: vi.fn(() => ({ uid: "mock-model-uid" })),
}));

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        "chatbot.errorGeneratePrompt": "Error generating prompt",
      },
    },
  },
  lng: "en",
  interpolation: {
    escapeValue: false,
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nextProvider i18n={i18n}>
    <AppContextProvider>
      <CacheProvider>
        <LoadingProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </LoadingProvider>
      </CacheProvider>
    </AppContextProvider>
  </I18nextProvider>
);

// Helper function to wait for all pending promises
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("useChatMessages Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize correctly", async () => {
    const { result } = renderHook(() => useChatMessages(), { wrapper });

    await act(async () => {
      await flushPromises();
    });

    expect(result.current.chatMessages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.loadingResponse).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle session update", async () => {
    const mockFetchHistory = vi.fn().mockResolvedValue([
      {
        text: "Old message",
        type: "USER",
        timestamp: "2024-06-01T12:00:00Z",
      },
    ]);
    (useGetHistoryApi as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      fetchHistory: mockFetchHistory,
      loading: false,
    });

    const { result } = renderHook(() => useChatMessages(), { wrapper });

    await act(async () => {
      await result.current.updateSessionId("session-123");
      await flushPromises();
    });

    expect(result.current.chatMessages).toHaveLength(1);
    expect(result.current.chatMessages[0].text).toBe("Old message");
  });

  it("should send a prompt and receive a response", async () => {
    const mockResponse = { response: "AI response", sources: [] };
    (usePromptApi as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      response: mockResponse,
      loading: false,
      error: null,
      sendPrompt: vi.fn().mockResolvedValue(mockResponse),
    });

    const { result } = renderHook(() => useChatMessages(), { wrapper });

    await act(async () => {
      await result.current.handlePromptAndMessages("Hello AI");
      await flushPromises();
    });

    expect(result.current.chatMessages).toHaveLength(2);
    expect(result.current.chatMessages[0].text).toBe("AI response");
    expect(result.current.chatMessages[1].text).toBe("Hello AI");
  });

  it("should handle API errors gracefully", async () => {
    (usePromptApi as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      response: null,
      loading: false,
      error: "API Error",
      sendPrompt: vi.fn().mockRejectedValue(new Error("API Error")),
    });

    const { result } = renderHook(() => useChatMessages(), { wrapper });

    await act(async () => {
      await result.current.handlePromptAndMessages("Test error");
      await flushPromises();
    });

    expect(result.current.chatMessages).toHaveLength(2);
    expect(result.current.chatMessages[1].text).toBe("Test error");
    expect(result.current.chatMessages[0].type).toBe("SYSTEM");
    expect(result.current.chatMessages[0].text).toBe("Error generating prompt");
  });
});
