import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeepAliveSession } from "@/hooks/useKeepAliveSession";
import * as api from "@/api";
import * as AppContextService from "@/services/AppContextService";
import * as GetSessionsService from "@/services/GetSessionsService";

// Mock the API and contexts
vi.mock("@/api", () => ({
  keepAliveAnonymousSession: vi.fn(),
}));

vi.mock("@/services/AppContextService", () => ({
  useAppContext: vi.fn(),
}));

vi.mock("@/services/GetSessionsService", () => ({
  useGetSessions: vi.fn(),
}));

describe("useKeepAliveSession", () => {
  // Setup mocks
  const mockKeepAliveApi = vi.mocked(api.keepAliveAnonymousSession);
  const mockUseAppContext = vi.mocked(AppContextService.useAppContext);
  const mockUseGetSessions = vi.mocked(GetSessionsService.useGetSessions);

  // Create a mutable ref object that we can update in tests
  let sessionIdRef: { current: string | null } = { current: "test-session-id" };

  // Mock timer
  const originalSetInterval = global.setInterval;
  const originalClearInterval = global.clearInterval;
  let intervalId: number;

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    sessionIdRef = { current: "test-session-id" };

    // Mock the contexts
    mockUseAppContext.mockReturnValue({
      securityConfig: {
        anonymousUserEnabled: true,
        anonymousUserSessionTimeout: 300, // 5 minutes in seconds
      },
    } as any);

    mockUseGetSessions.mockReturnValue({
      activeSessionIdRef: sessionIdRef,
      // Add other properties that useGetSessions returns but aren't used in the hook
      sessions: [],
      activeSessionId: "test-session-id",
      setActiveSessionId: vi.fn(),
      appendSessionLocal: vi.fn(),
      updateSessionLabelLocal: vi.fn(),
      deleteSessionLocal: vi.fn(),
      animateInSession: null,
      error: null,
      loading: false,
    } as any);

    // Mock setInterval and clearInterval
    intervalId = 123;
    global.setInterval = vi.fn(
      () => intervalId,
    ) as unknown as typeof setInterval;
    global.clearInterval = vi.fn();

    // Mock document.hidden
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });

    // Mock addEventListener and removeEventListener
    document.addEventListener = vi.fn();
    document.removeEventListener = vi.fn();
  });

  afterEach(() => {
    // Restore original timers
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
  });

  it("should start the timer when session ID is available and tab is visible", () => {
    // Arrange & Act
    renderHook(() => useKeepAliveSession());

    // Assert
    expect(global.setInterval).toHaveBeenCalledTimes(1);
    expect(global.setInterval).toHaveBeenCalledWith(
      expect.any(Function),
      240000,
    ); // 300 * 800 ms
    expect(document.addEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
  });

  it("should not start the timer when anonymousUserEnabled is false", () => {
    // Arrange
    mockUseAppContext.mockReturnValue({
      securityConfig: {
        anonymousUserEnabled: false,
        anonymousUserSessionTimeout: 300,
      },
    } as any);

    // Act
    renderHook(() => useKeepAliveSession());

    // Assert
    expect(global.setInterval).not.toHaveBeenCalled();
  });

  it("should not start the timer when session ID is null", () => {
    // Arrange
    sessionIdRef.current = null;

    // Act
    renderHook(() => useKeepAliveSession());

    // Assert
    expect(global.setInterval).not.toHaveBeenCalled();
  });

  it("should clean up on unmount", () => {
    // Arrange
    const { unmount } = renderHook(() => useKeepAliveSession());

    // Make sure setInterval was called
    expect(global.setInterval).toHaveBeenCalled();

    // Act
    unmount();

    // Assert
    expect(global.clearInterval).toHaveBeenCalledWith(intervalId);
    expect(document.removeEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
  });

  it("should handle visibility change events", () => {
    // Arrange
    renderHook(() => useKeepAliveSession());

    // Make sure setInterval was called
    expect(global.setInterval).toHaveBeenCalled();

    // Get the visibility change handler
    const visibilityHandler = (document.addEventListener as any).mock
      .calls[0][1];

    // Act - simulate tab becoming hidden
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    visibilityHandler();

    // Assert - timer should be cleared
    expect(global.clearInterval).toHaveBeenCalledWith(intervalId);

    // Reset clearInterval mock
    vi.mocked(global.clearInterval).mockClear();

    // Act - simulate tab becoming visible again
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    visibilityHandler();

    // Assert - timer should be restarted
    expect(global.setInterval).toHaveBeenCalledTimes(2);
  });

  it("should call the API with correct parameters", () => {
    // Arrange
    renderHook(() => useKeepAliveSession());

    // Make sure setInterval was called
    expect(global.setInterval).toHaveBeenCalled();

    // Get the interval callback
    const intervalCallback = (global.setInterval as any).mock.calls[0][0];

    // Act - simulate timer firing
    intervalCallback();

    // Assert
    expect(mockKeepAliveApi).toHaveBeenCalledWith({
      path: {
        sessionId: "test-session-id",
      },
    });
  });
});
