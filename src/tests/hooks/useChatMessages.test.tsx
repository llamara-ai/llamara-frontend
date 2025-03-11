import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useChatMessages from "@/hooks/useChatMessages";
import usePromptApi from "@/hooks/api/useSendPromptApi";
import useGetHistoryApi from "@/hooks/api/useGetHistoryApi";
import { ReactNode } from "react";
import { AppContextProvider } from "@/services/AppContextService";
import CacheProvider from "@/services/CacheService";
import { LoadingProvider } from "@/services/LoadingService";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";

vi.mock("@/hooks/api/useCreateSessionApi", () => ({
  default: vi.fn(() => ({
    handleCreateSession: vi.fn(),
  })),
}));

vi.mock("@/hooks/api/useSendPromptApi", () => ({
  default: vi.fn(() => ({
    response: null,
    loading: false,
    error: null,
  })),
}));

vi.mock("@/hooks/api/useGetHistoryApi", () => ({
  default: vi.fn(() => ({
    fetchHistory: vi.fn(),
    loading: false,
  })),
}));

const mockAppendSessionLocal = vi.fn();

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        key: "value",
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
        <LoadingProvider>{children}</LoadingProvider>
      </CacheProvider>
    </AppContextProvider>
  </I18nextProvider>
);

describe("useChatMessages Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize correctly", () => {
    const { result } = renderHook(
      () => useChatMessages({ appendSessionLocal: mockAppendSessionLocal }),
      { wrapper },
    );

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

    const { result } = renderHook(
      () => useChatMessages({ appendSessionLocal: mockAppendSessionLocal }),
      { wrapper },
    );
    await act(async () => {
      await result.current.updateSessionId("session-123");
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
    });

    const { result } = renderHook(
      () => useChatMessages({ appendSessionLocal: mockAppendSessionLocal }),
      { wrapper },
    );
    await act(async () => {
      await result.current.handlePromptAndMessages("Hello AI");
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
    });
    const { result } = renderHook(
      () => useChatMessages({ appendSessionLocal: mockAppendSessionLocal }),
      { wrapper },
    );
    await act(async () => {
      await result.current.handlePromptAndMessages("Test error");
    });

    expect(result.current.chatMessages).toHaveLength(2);
    expect(result.current.chatMessages[0].type).toBe("SYSTEM");
  });
});
