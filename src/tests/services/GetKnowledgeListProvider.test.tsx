/* eslint-disable */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import GetKnowledgeListProvider, {
  useGetKnowledgeList,
} from "@/services/GetKnowledgeListService";
import { getAllKnowledge, KnowledgeRecord } from "@/api";
import { useCache } from "@/services/CacheService";
import { useEffect, useRef, useState } from "react";

// Mock dependencies
vi.mock("@/api", () => ({
  getAllKnowledge: vi.fn(),
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

vi.mock("@/services/CacheService", () => ({
  useCache: vi.fn(),
}));

// Mock useRefState directly with React's useState and useRef
vi.mock("react-usestateref", () => {
  return {
    default: function useMockRefState(initialValue: any) {
      const [state, setState] = useState(initialValue);
      const ref = useRef(initialValue);

      useEffect(() => {
        ref.current = state;
      }, [state]);
      return [state, setState, ref];
    },
  };
});

// Test component to access context
function TestComponent({
  testFn,
}: Readonly<{
  testFn: (context: ReturnType<typeof useGetKnowledgeList>) => void;
}>) {
  const context = useGetKnowledgeList();
  testFn(context);
  return <div data-testid="test-component">Test Component</div>;
}

describe("GetKnowledgeListProvider", () => {
  const mockGetCache = vi.fn();
  const mockSetCache = vi.fn();
  const mockGetCacheLoading = vi.fn();
  const mockSetCacheLoading = vi.fn();

  const mockKnowledge: KnowledgeRecord[] = [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      type: "FILE",
      checksum: "abc123",
      ingestionStatus: "SUCCEEDED",
      tokenCount: 1500,
      createdAt: new Date("2024-03-10T12:00:00Z"),
      lastUpdatedAt: new Date("2024-03-10T12:30:00Z"),
      source: "https://example.com/product-docs.pdf",
      contentType: "application/pdf",
      permissions: {
        user123: "READONLY",
        admin456: "READWRITE",
        owner001: "OWNER",
      },
      label: "Produktdokumentation",
      tags: ["API", "User Guide", "Setup"],
    },
    {
      id: "123e4567-e89b-12d3-a456-426614174000",
      type: "WEBLINK",
      checksum: "def456",
      ingestionStatus: "PENDING",
      tokenCount: 3200,
      createdAt: new Date("2023-12-01T08:15:00Z"),
      lastUpdatedAt: new Date("2023-12-05T10:00:00Z"),
      source: "https://arxiv.org/pdf/1234.56789.pdf",
      contentType: "text/html",
      permissions: {
        researcher001: "READONLY",
        guestUser: "NONE",
      },
      label: "KI und maschinelles Lernen",
      tags: ["AI", "Machine Learning", "Deep Learning"],
    },
    {
      id: "98a6b4e2-34f7-4b2c-b2a8-ded3a6e10c3e",
      type: "FILE",
      checksum: "ghi789",
      ingestionStatus: "SUCCEEDED",
      tokenCount: 800,
      createdAt: new Date("2024-02-20T15:30:00Z"),
      lastUpdatedAt: new Date("2024-02-20T16:00:00Z"),
      source: "internal_system",
      contentType: "text/plain",
      permissions: {
        "team-lead": "READWRITE",
        "team-member": "READONLY",
        externalUser: "NONE",
      },
      label: "Sprint-Planning Meeting",
      tags: ["Sprint", "Meeting Notes", "Agile"],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mocks using type assertions
    (useCache as any).mockReturnValue({
      getCache: mockGetCache,
      setCache: mockSetCache,
    });
    (useCache as any)
      .mockReturnValueOnce({
        getCache: mockGetCache,
        setCache: mockSetCache,
      })
      .mockReturnValueOnce({
        getCache: mockGetCacheLoading,
        setCache: mockSetCacheLoading,
      });

    // Mock API response
    (getAllKnowledge as any).mockImplementation(() => {
      return Promise.resolve({
        data: { 200: mockKnowledge },
      });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch knowledge on initial render when no cache exists", async () => {
    mockGetCache.mockReturnValue(null);
    mockGetCacheLoading.mockReturnValue(false);

    let contextValue: any = { allKnowledge: [] };

    const updateContextValue = (context: any) => {
      contextValue = context;
    };

    const { rerender } = render(
      <GetKnowledgeListProvider>
        <TestComponent testFn={updateContextValue} />
      </GetKnowledgeListProvider>,
    );

    // Initial state should be empty array
    expect(contextValue.allKnowledge).toEqual([]);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      rerender(
        <GetKnowledgeListProvider>
          <TestComponent testFn={updateContextValue} />
        </GetKnowledgeListProvider>,
      );
    });

    expect(getAllKnowledge).toHaveBeenCalledTimes(1);

    expect(mockSetCache).toHaveBeenCalledWith("allKnowledge", mockKnowledge);

    expect(contextValue.allKnowledge).toEqual(mockKnowledge);
  });

  it("should use cached knowledge if available", async () => {
    mockGetCache.mockReturnValue(mockKnowledge);

    let contextValue: any;
    render(
      <GetKnowledgeListProvider>
        <TestComponent
          testFn={(context) => {
            contextValue = context;
          }}
        />
      </GetKnowledgeListProvider>,
    );

    // Should use cached data
    expect(contextValue.allKnowledge).toEqual(mockKnowledge);

    // API should not be called
    await act(async () => {
      expect(getAllKnowledge).not.toHaveBeenCalled();
    });
  });

  it("should handle API errors correctly", async () => {
    mockGetCache.mockReturnValue(null);
    mockGetCacheLoading.mockReturnValue(false);
    const errorMessage = "API Error";
    (getAllKnowledge as any).mockRejectedValue(new Error(errorMessage));

    let contextValue: any = { error: null };

    const updateContextValue = (context: any) => {
      contextValue = context;
    };

    render(
      <GetKnowledgeListProvider>
        <TestComponent testFn={updateContextValue} />
      </GetKnowledgeListProvider>,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(toast.error).toHaveBeenCalledWith("Failed to fetch all knowledge", {
      description: errorMessage,
    });

    expect(contextValue.error).toEqual(errorMessage);
  });

  it("should correctly delete knowledge from local state", async () => {
    mockGetCache.mockReturnValue(mockKnowledge);

    let contextValue: any;
    render(
      <GetKnowledgeListProvider>
        <TestComponent
          testFn={(context) => {
            contextValue = context;
          }}
        />
      </GetKnowledgeListProvider>,
    );

    // Initial state should be the mock knowledge
    expect(contextValue.allKnowledge).toEqual(mockKnowledge);

    // Delete one knowledge item
    const knowledgeToDelete = mockKnowledge[1];
    act(() => {
      contextValue.deleteLocalKnowledge(knowledgeToDelete);
    });

    // Check if the knowledge was deleted
    const expectedKnowledge = mockKnowledge.filter(
      (k) => k.id !== knowledgeToDelete.id,
    );
    expect(contextValue.allKnowledge).toEqual(expectedKnowledge);
    expect(mockSetCache).toHaveBeenCalledWith(
      "allKnowledge",
      expectedKnowledge,
    );
  });

  it("should correctly add knowledge to local state", async () => {
    mockGetCache.mockReturnValue(mockKnowledge);

    let contextValue: any;
    render(
      <GetKnowledgeListProvider>
        <TestComponent
          testFn={(context) => {
            contextValue = context;
          }}
        />
      </GetKnowledgeListProvider>,
    );

    // Initial state should be the mock knowledge
    expect(contextValue.allKnowledge).toEqual(mockKnowledge);

    // Add new knowledge items
    const newKnowledge: KnowledgeRecord[] = [
      {
        id: "c2d4e6a8-bf9c-44dd-a1a0-8fcd2e765432",
        type: "WEBLINK",
        checksum: "jkl012",
        ingestionStatus: "SUCCEEDED",
        tokenCount: 5000,
        createdAt: new Date("2022-06-15T09:00:00Z"),
        lastUpdatedAt: new Date("2023-01-10T12:00:00Z"),
        source: "https://www.gesetze-im-internet.de",
        contentType: "text/html",
        permissions: {
          public: "READONLY",
          govAdmin: "OWNER",
        },
        label: "Datenschutz-Grundverordnung (DSGVO)",
        tags: ["GDPR", "Privacy", "Compliance"],
      },
      {
        id: "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
        type: "FILE",
        checksum: "mno345",
        ingestionStatus: "FAILED",
        tokenCount: 1200,
        createdAt: new Date("2024-03-01T11:45:00Z"),
        lastUpdatedAt: new Date("2024-03-02T09:30:00Z"),
        source: "https://support.example.com/article/42",
        contentType: "text/html",
        permissions: {
          customers: "READONLY",
          "support-team": "READWRITE",
          admin: "OWNER",
          blockedUser: "NONE",
        },
        label: "Fehlermeldung 404 beheben",
        tags: ["Troubleshooting", "404 Error", "Web Support"],
      },
    ];

    act(() => {
      contextValue.addLocalKnowledge(newKnowledge);
    });

    // Check if the knowledge was added
    const expectedKnowledge = [...mockKnowledge, ...newKnowledge];
    expect(contextValue.allKnowledge).toEqual(expectedKnowledge);
    expect(mockSetCache).toHaveBeenCalledWith(
      "allKnowledge",
      expectedKnowledge,
    );
  });

  it("should update existing knowledge when adding with same id", async () => {
    mockGetCache.mockReturnValue(mockKnowledge);

    let contextValue: any;
    render(
      <GetKnowledgeListProvider>
        <TestComponent
          testFn={(context) => {
            contextValue = context;
          }}
        />
      </GetKnowledgeListProvider>,
    );

    // Initial state should be the mock knowledge
    expect(contextValue.allKnowledge).toEqual(mockKnowledge);

    // Update existing knowledge
    const updatedKnowledge: KnowledgeRecord[] = [
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        type: "WEBLINK",
        checksum: "def456",
        ingestionStatus: "FAILED",
        tokenCount: 3200,
        createdAt: new Date("2023-12-01T08:15:00Z"),
        lastUpdatedAt: new Date("2023-12-05T10:00:00Z"),
        source: "https://arxiv.org/pdf/1234.56789.pdf",
        contentType: "text/html",
        permissions: {
          researcher001: "READONLY",
          guestUser: "NONE",
        },
        label: "KI und maschinelles Lernen",
        tags: ["AI", "Machine Learning", "Deep Learning"],
      },
      {
        id: "98a6b4e2-34f7-4b2c-b2a8-ded3a6e10c3e",
        type: "FILE",
        checksum: "ghi787",
        ingestionStatus: "SUCCEEDED",
        tokenCount: 1000,
        createdAt: new Date("2024-02-20T15:30:00Z"),
        lastUpdatedAt: new Date("2024-02-25T16:00:00Z"),
        source: "internal_system",
        contentType: "text/plain",
        permissions: {
          "team-lead": "READWRITE",
          "team-member": "READONLY",
          externalUser: "NONE",
        },
        label: "Sprint-Planning Meeting 2.0",
        tags: ["Sprint", "Meeting Notes", "Agile"],
      },
    ];

    act(() => {
      contextValue.updateLocalKnowledge(updatedKnowledge);
    });

    // Check if the knowledge was updated
    const expectedKnowledge: KnowledgeRecord[] = [
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        type: "FILE",
        checksum: "abc123",
        ingestionStatus: "SUCCEEDED",
        tokenCount: 1500,
        createdAt: new Date("2024-03-10T12:00:00Z"),
        lastUpdatedAt: new Date("2024-03-10T12:30:00Z"),
        source: "https://example.com/product-docs.pdf",
        contentType: "application/pdf",
        permissions: {
          user123: "READONLY",
          admin456: "READWRITE",
          owner001: "OWNER",
        },
        label: "Produktdokumentation",
        tags: ["API", "User Guide", "Setup"],
      },
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        type: "WEBLINK",
        checksum: "def456",
        ingestionStatus: "FAILED",
        tokenCount: 3200,
        createdAt: new Date("2023-12-01T08:15:00Z"),
        lastUpdatedAt: new Date("2023-12-05T10:00:00Z"),
        source: "https://arxiv.org/pdf/1234.56789.pdf",
        contentType: "text/html",
        permissions: {
          researcher001: "READONLY",
          guestUser: "NONE",
        },
        label: "KI und maschinelles Lernen",
        tags: ["AI", "Machine Learning", "Deep Learning"],
      },
      {
        id: "98a6b4e2-34f7-4b2c-b2a8-ded3a6e10c3e",
        type: "FILE",
        checksum: "ghi787",
        ingestionStatus: "SUCCEEDED",
        tokenCount: 1000,
        createdAt: new Date("2024-02-20T15:30:00Z"),
        lastUpdatedAt: new Date("2024-02-25T16:00:00Z"),
        source: "internal_system",
        contentType: "text/plain",
        permissions: {
          "team-lead": "READWRITE",
          "team-member": "READONLY",
          externalUser: "NONE",
        },
        label: "Sprint-Planning Meeting 2.0",
        tags: ["Sprint", "Meeting Notes", "Agile"],
      },
    ];

    expect(contextValue.allKnowledge).toEqual(expectedKnowledge);
    expect(mockSetCache).toHaveBeenCalledWith(
      "allKnowledge",
      expectedKnowledge,
    );
  });

  it("should do nothing when updateLocalKnowledge is called with null", async () => {
    mockGetCache.mockReturnValue(mockKnowledge);

    let contextValue: any;
    render(
      <GetKnowledgeListProvider>
        <TestComponent
          testFn={(context) => {
            contextValue = context;
          }}
        />
      </GetKnowledgeListProvider>,
    );

    // Initial state should be the mock knowledge
    expect(contextValue.allKnowledge).toEqual(mockKnowledge);

    // Reset mock to track new calls
    mockSetCache.mockClear();

    act(() => {
      contextValue.updateLocalKnowledge(null);
    });

    // State should remain unchanged
    expect(contextValue.allKnowledge).toEqual(mockKnowledge);
    expect(mockSetCache).not.toHaveBeenCalled();
  });

  it("should throw error when useGetKnowledgeList is used outside provider", () => {
    // Suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(<TestComponent testFn={() => {}} />);
    }).toThrow(
      "useGetKnowledgeList must be used within a GetKnowledgeListProvider",
    );

    // Restore console.error
    console.error = originalConsoleError;
  });
});
