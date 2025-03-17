import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeepAliveSession } from "@/hooks/useKeepAliveSession";
import * as api from "@/api";
import * as AppContextService from "@/services/AppContextService";

// Mock the API and context
vi.mock("@/api", () => ({
  keepAliveAnonymousSession: vi.fn(),
}));

vi.mock("@/services/AppContextService", () => ({
  useAppContext: vi.fn(),
}));

describe("useKeepAliveSession", () => {
  // Setup mocks
  const mockKeepAliveApi = vi.mocked(api.keepAliveAnonymousSession);
  const mockUseAppContext = vi.mocked(AppContextService.useAppContext);

  // Mock timer
  const originalSetInterval = global.setInterval;
  const originalClearInterval = global.clearInterval;

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Mock the context
    mockUseAppContext.mockReturnValue({
      securityConfig: {
        anonymousUserEnabled: true,
        anonymousUserSessionTimeout: 300, // 5 minutes in seconds
      },
    } as any);

    // Mock setInterval and clearInterval
    global.setInterval = vi.fn(() => 123) as unknown as typeof setInterval;
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

  it("should start the timer when session ID is provided and tab is visible", () => {
    // Arrange & Act
    renderHook(() => useKeepAliveSession("test-session-id"));

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
    renderHook(() => useKeepAliveSession("test-session-id"));

    // Assert
    expect(global.setInterval).not.toHaveBeenCalled();
  });

  it("should not start the timer when session ID is null", () => {
    // Arrange & Act
    renderHook(() => useKeepAliveSession(null));

    // Assert
    expect(global.setInterval).not.toHaveBeenCalled();
  });

  it("should clean up on unmount", () => {
    // Arrange
    const { unmount } = renderHook(() =>
      useKeepAliveSession("test-session-id"),
    );

    // Act
    unmount();

    // Assert
    expect(global.clearInterval).toHaveBeenCalledWith(123);
    expect(document.removeEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
  });

  it("should handle visibility change events", () => {
    // Arrange
    renderHook(() => useKeepAliveSession("test-session-id"));

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
    expect(global.clearInterval).toHaveBeenCalledWith(123);

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
    renderHook(() => useKeepAliveSession("test-session-id"));

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
