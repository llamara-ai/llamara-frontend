import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import GetSessionsProvider, {
  useGetSessions,
} from "@/services/GetSessionsService";
import { getSessions } from "@/api";
import { useCache } from "@/services/CacheService";
import { useToast } from "@/hooks/use-toast";
import { BrowserRouter } from "react-router";

// Mock the dependencies
vi.mock("@/api", () => ({
  getSessions: vi.fn(),
}));

vi.mock("@/services/CacheService", () => ({
  useCache: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

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
  const mockToast = { toast: vi.fn() };
  const mockGetCache = vi.fn();
  const mockSetCache = vi.fn();

  const mockSessions = [
    { id: "session-1", label: "Session 1", createdAt: "2023-01-01T00:00:00Z" },
    { id: "session-2", label: "Session 2", createdAt: "2023-01-02T00:00:00Z" },
  ];

  beforeEach(() => {
    vi.resetAllMocks();

    // Setup mocks
    (useToast as any).mockReturnValue(mockToast);
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

    render(
      <BrowserRouter>
        <GetSessionsProvider>
          <TestComponent />
        </GetSessionsProvider>
      </BrowserRouter>,
    );

    // Initially no sessions should be displayed
    expect(screen.getByTestId("sessions-count").textContent).toBe("0");

    // Wait for the API call to resolve
    await waitFor(() => {
      expect(getSessions).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("sessions-count").textContent).toBe("2");
      expect(screen.getByTestId("session-session-1")).toBeDefined();
      expect(screen.getByTestId("session-session-2")).toBeDefined();
    });
  });

  it("should load sessions from cache when available", () => {
    mockGetCache.mockReturnValue(mockSessions);

    render(
      <BrowserRouter>
        <GetSessionsProvider>
          <TestComponent />
        </GetSessionsProvider>
      </BrowserRouter>,
    );

    // Sessions should be loaded from cache
    expect(mockGetCache).toHaveBeenCalledWith("sessions");
    expect(getSessions).not.toHaveBeenCalled();
    expect(screen.getByTestId("sessions-count").textContent).toBe("2");
  });

  it("should append a session locally", async () => {
    mockGetCache.mockReturnValue(mockSessions);

    render(
      <BrowserRouter>
        <GetSessionsProvider>
          <TestComponent />
        </GetSessionsProvider>
      </BrowserRouter>,
    );

    // Initially 2 sessions
    expect(screen.getByTestId("sessions-count").textContent).toBe("2");

    // Append a new session
    act(() => {
      screen.getByTestId("append-button").click();
    });

    // Should now have 3 sessions
    await waitFor(() => {
      expect(screen.getByTestId("sessions-count").textContent).toBe("3");
      expect(screen.getByTestId("session-new-session")).toBeDefined();
      expect(screen.getByTestId("session-new-session").textContent).toBe(
        "New Session",
      );
    });
  });

  it("should update a session label locally", async () => {
    mockGetCache.mockReturnValue(mockSessions);

    render(
      <BrowserRouter>
        <GetSessionsProvider>
          <TestComponent />
        </GetSessionsProvider>
      </BrowserRouter>,
    );

    // Initially session-1 has label "Session 1"
    expect(screen.getByTestId("session-session-1").textContent).toBe(
      "Session 1",
    );

    // Update the label
    act(() => {
      screen.getByTestId("update-button").click();
    });

    // Label should be updated
    await waitFor(() => {
      expect(screen.getByTestId("session-session-1").textContent).toBe(
        "Updated Label",
      );
    });
  });

  it("should delete a session locally", async () => {
    mockGetCache.mockReturnValue(mockSessions);

    render(
      <BrowserRouter>
        <GetSessionsProvider>
          <TestComponent />
        </GetSessionsProvider>
      </BrowserRouter>,
    );

    // Initially 2 sessions
    expect(screen.getByTestId("sessions-count").textContent).toBe("2");
    expect(screen.getByTestId("session-session-1")).toBeDefined();

    // Delete a session
    act(() => {
      screen.getByTestId("delete-button").click();
    });

    // Should now have 1 session and session-1 should be removed
    await waitFor(() => {
      expect(screen.getByTestId("sessions-count").textContent).toBe("1");
      expect(screen.queryByTestId("session-session-1")).toBeNull();
      expect(screen.getByTestId("session-session-2")).toBeDefined();
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

    await waitFor(() => {
      expect(getSessions).toHaveBeenCalledTimes(1);
      expect(mockToast.toast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Failed to fetch sessions",
        description: errorMessage,
      });
    });
  });
});
