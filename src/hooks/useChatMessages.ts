import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useCreateSessionApi from "./api/useCreateSessionApi";
import { ChatMessageRecord, ChatResponseRecord, prompt } from "@/api";
import useGetHistoryApi from "./api/useGetHistoryApi";
import { useLoading } from "@/services/LoadingService";
import { readSelectedModel } from "./useLocalStorage";
import { useGetSessions } from "@/services/GetSessionsService";
import useStateRef from "react-usestateref";
import { toast } from "sonner";

interface UseChatMessagesResponse {
  chatMessages: ChatMessageRecord[];
  handlePromptAndMessages: (inputPrompt: string) => Promise<void>;
  loadingHistory: boolean;
  loadingResponse: boolean;
  error: string | null;
}

export default function useChatMessages(): UseChatMessagesResponse {
  const { setLoading: setLoadingSpinner } = useLoading();
  const { t } = useTranslation();
  const {
    appendSessionLocal,
    setActiveSessionId,
    activeSessionIdRef,
    activeSessionIsNew,
  } = useGetSessions();
  const previousSessionId = useRef<string | null>(null);

  const [currentChatMessages, setCurrentChatMessages, currentChatMessagesRef] =
    useStateRef<ChatMessageRecord[]>([]);
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false);
  const [historyMessages, setHistoryMessages] = useState<ChatMessageRecord[]>(
    [],
  );

  const [error, setError] = useState<string | null>(null);

  const { handleCreateSession, error: errorSession } = useCreateSessionApi();

  const { fetchHistory, loading: loadingHistory } = useGetHistoryApi();

  useEffect(() => {
    const resetChatMessages = async () => {
      // Reset chat messages when sessionID changes
      if (!activeSessionIsNew) {
        setLoadingResponse(false);
        setError(null);
        setCurrentChatMessages([]);
        setHistoryMessages([]);

        if (activeSessionIdRef.current !== null) {
          const response = await fetchHistory({
            sessionId: activeSessionIdRef.current,
          });
          setHistoryMessages(response);
        }

        previousSessionId.current = activeSessionIdRef.current;
      }
    };

    void resetChatMessages();
  }, [activeSessionIdRef.current]);

  useEffect(() => {
    setLoadingSpinner(loadingHistory);
  }, [loadingHistory]);

  // Function to handle new user prompt
  const handlePromptAndMessages = async (inputPrompt: string) => {
    setLoadingResponse(true);

    const messageRecord: ChatMessageRecord = {
      text: inputPrompt,
      type: "USER",
      timestamp: new Date(),
    };
    setCurrentChatMessages([...currentChatMessagesRef.current, messageRecord]);

    const chatModelUID = readSelectedModel()?.uid;
    if (!chatModelUID) {
      errorChatMessage(
        "No chat model selected",
        "Select a chat model at the sidebar to start chatting",
      );
      return;
    }

    if (activeSessionIdRef.current === null) {
      const newSession = await handleCreateSession();

      // Add session to local session list
      appendSessionLocal(newSession);

      if (newSession?.id) {
        setActiveSessionId(newSession.id, true);
      }
    }

    const sessionId = activeSessionIdRef.current;
    if (!sessionId) {
      errorChatMessage(
        "Provided session id is invalid",
        "Something went wrong. Please try again",
      );
      return;
    }

    const options = {
      body: inputPrompt,
      query: {
        sessionId: sessionId,
        uid: chatModelUID,
      },
      headers: {
        "Content-Type": "text/plain",
      },
    };

    let responseData: ChatResponseRecord | null = null;

    try {
      const response = await prompt(options);

      if (!response.response.ok || response.data === undefined) {
        throw new Error(
          "Request failed with status: " + response.response.status.toString(),
        );
      }

      responseData = response.data[200];
    } catch (error: unknown) {
      if (error instanceof Error) {
        errorChatMessage("Failed to get response to prompt", error.message);
        return;
      }
    }

    if (responseData === null) {
      errorChatMessage(
        "Failed to get response to prompt",
        "No response from server",
      );
      return;
    }

    if (activeSessionIdRef.current === sessionId) {
      const messageResponse: ChatMessageRecord = {
        text: responseData.response,
        type: "AI",
        modelUID: chatModelUID,
        sources: responseData.sources,
        timestamp: new Date(),
      };
      setCurrentChatMessages([
        ...currentChatMessagesRef.current,
        messageResponse,
      ]);
    }
    setLoadingResponse(false);
  };

  const errorChatMessage = (errorTitle: string, errorMessage: string) => {
    toast.error(errorTitle, {
      description: errorMessage,
    });
    console.error(errorTitle + ": " + errorMessage);
    setError(errorMessage);

    const messageRecord: ChatMessageRecord = {
      text: t("chatbot.errorGeneratePrompt"),
      type: "SYSTEM",
      timestamp: new Date(),
    };
    setCurrentChatMessages([...currentChatMessagesRef.current, messageRecord]);
    setLoadingResponse(false);
  };

  return {
    chatMessages: historyMessages.concat(currentChatMessages),
    loadingHistory,
    handlePromptAndMessages,
    loadingResponse,
    error: error || errorSession ? (error ?? "") + (errorSession ?? "") : null,
  };
}
