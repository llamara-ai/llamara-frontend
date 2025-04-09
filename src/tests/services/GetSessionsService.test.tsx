/* eslint-disable */
import React from "react";
import { render, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import GetSessionsProvider, {
  useGetSessions,
} from "@/services/GetSessionsService";
import { getSessions } from "@/api";
import { useCache } from "@/services/CacheService";
import { BrowserRouter } from "react-router";

// Mock the dependencies
vi.mock("@/api", () => ({
  getSessions: vi.fn(),
}));

vi.mock("@/services/CacheService", () => ({
  useCache: vi.fn(),
}));

vi.mock("sonner", () => {
  const mockToast = {
    message: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    custom: vi.fn(),
    promise: vi.fn(),
    dismiss: vi.fn(),
    loading: vi.fn(),
  };

  return {
    toast: mockToast,
    Toaster: vi.fn(() => null),
  };
});
import { toast } from "sonner";

// Fix for react-usestateref mock - provide a default export
vi.mock("react-usestateref", () => {
  // Create the mock function
  const useStateRefMock = (initialValue: any) => {
    const [state, setState] = React.useState(initialValue);
    const ref = React.useRef(state);

    const setStateWithRef = (newValue: any) => {
      ref.current = typeof newValue === "function" ? newValue(state) : newValue;
      setState(ref.current);
    };

    return [state, setStateWithRef, ref];
  };

  // Return an object with a default property
  return {
    default: useStateRefMock,
  };
});

// Test component to access the context
function TestComponent() {
  const {
    sessions,
    appendSessionLocal,
    updateSessionLabelLocal,
    deleteSessionLocal,
  } = useGetSessions();

  return (
    <div>
      <button
        data-testid="append-button"
        onClick={() =>
          appendSessionLocal({ id: "new-session", label: "New Session" })
        }
      >
        Append Session
      </button>
      <button
        data-testid="update-button"
        onClick={() => updateSessionLabelLocal("session-1", "Updated Label")}
      >
        Update Session
      </button>
      <button
        data-testid="delete-button"
        onClick={() => deleteSessionLocal("session-1")}
      >
        Delete Session
      </button>
      <div data-testid="sessions-count">{sessions.length}</div>
      <div>
        {sessions.map((session) => (
          <div key={session.id} data-testid={`session-${session.id}`}>
            {session.label}
          </div>
        ))}
      </div>
    </div>
  );
}

describe("GetSessionsProvider", () => {
  const mockGetCache = vi.fn();
  const mockSetCache = vi.fn();

  const mockSessions = [
    { id: "session-1", label: "Session 1", createdAt: "2023-01-01T00:00:00Z" },
    { id: "session-2", label: "Session 2", createdAt: "2023-01-02T00:00:00Z" },
  ];

  beforeEach(() => {
    vi.resetAllMocks();

    // Setup mocks
    (useCache as any).mockReturnValue({
      getCache: mockGetCache,
      setCache: mockSetCache,
    });
    (getSessions as any).mockResolvedValue({
      data: mockSessions,
    });
  });

  it("should load sessions from API when cache is empty", async () => {
    mockGetCache.mockReturnValue(null);

    const { getByTestId } = render(
      <BrowserRouter>
        <GetSessionsProvider>
          <TestComponent />
        </GetSessionsProvider>
      </BrowserRouter>,
    );

    // Initially no sessions should be displayed
    expect(getByTestId("sessions-count").textContent).toBe("0");

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Wait for the API call to resolve
    expect(getSessions).toHaveBeenCalledTimes(1);
    expect(getByTestId("sessions-count").textContent).toBe("2");
    expect(getByTestId("session-session-1")).toBeDefined();
    expect(getByTestId("session-session-2")).toBeDefined();
  });

  it("should load sessions from cache when available", () => {
    mockGetCache.mockReturnValue(mockSessions);

    const { getByTestId } = render(
      <BrowserRouter>
        <GetSessionsProvider>
          <TestComponent />
        </GetSessionsProvider>
      </BrowserRouter>,
    );

    // Sessions should be loaded from cache
    expect(mockGetCache).toHaveBeenCalledWith("sessions");
    expect(getSessions).not.toHaveBeenCalled();
    expect(getByTestId("sessions-count").textContent).toBe("2");
  });

  it("should append a session locally", async () => {
    mockGetCache.mockReturnValue(mockSessions);

    const { getByTestId } = render(
      <BrowserRouter>
        <GetSessionsProvider>
          <TestComponent />
        </GetSessionsProvider>
      </BrowserRouter>,
    );

    // Initially 2 sessions
    expect(getByTestId("sessions-count").textContent).toBe("2");

    // Append a new session
    act(() => {
      getByTestId("append-button").click();
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Should now have 3 sessions
    expect(getByTestId("sessions-count").textContent).toBe("3");
    expect(getByTestId("session-new-session")).toBeDefined();
    expect(getByTestId("session-new-session").textContent).toBe("New Session");
  });

  it("should update a session label locally", async () => {
    mockGetCache.mockReturnValue(mockSessions);

    const { getByTestId } = render(
      <BrowserRouter>
        <GetSessionsProvider>
          <TestComponent />
        </GetSessionsProvider>
      </BrowserRouter>,
    );

    // Initially session-1 has label "Session 1"
    expect(getByTestId("session-session-1").textContent).toBe("Session 1");

    // Update the label
    act(() => {
      getByTestId("update-button").click();
    });

    // Label should be updated
    await act(async () => {
      expect(getByTestId("session-session-1").textContent).toBe(
        "Updated Label",
      );
    });
  });

  it("should delete a session locally", async () => {
    mockGetCache.mockReturnValue(mockSessions);

    const { queryByTestId, getByTestId } = render(
      <BrowserRouter>
        <GetSessionsProvider>
          <TestComponent />
        </GetSessionsProvider>
      </BrowserRouter>,
    );

    // Initially 2 sessions
    expect(getByTestId("sessions-count").textContent).toBe("2");
    expect(getByTestId("session-session-1")).toBeDefined();

    // Delete a session
    act(() => {
      getByTestId("delete-button").click();
    });

    // Should now have 1 session and session-1 should be removed
    await act(async () => {
      expect(getByTestId("sessions-count").textContent).toBe("1");
      expect(queryByTestId("session-session-1")).toBeNull();
      expect(getByTestId("session-session-2")).toBeDefined();
    });
  });

  it("should handle API errors", async () => {
    mockGetCache.mockReturnValue(null);
    const errorMessage = "Failed to fetch sessions";
    (getSessions as any).mockRejectedValue(new Error(errorMessage));

    render(
      <BrowserRouter>
        <GetSessionsProvider>
          <TestComponent />
        </GetSessionsProvider>
      </BrowserRouter>,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(getSessions).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith("Failed to fetch sessions", {
      description: errorMessage,
    });
  });
});
