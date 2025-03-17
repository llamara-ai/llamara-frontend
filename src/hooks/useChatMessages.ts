import { useEffect, useRef, useState } from "react";
import usePromptApi from "./api/useSendPromptApi";
import { useTranslation } from "react-i18next";
import useCreateSessionApi from "./api/useCreateSessionApi";
import { combineErrors } from "@/lib/combineErrors";
import { ChatMessageRecord, Session } from "@/api";
import useGetHistoryApi from "./api/useGetHistoryApi";
import { useLoading } from "@/services/LoadingService";
import useAvailableModels from "./api/useGetModelsApi";
import { readSelectedModel } from "./useLocalStorage";
import { useKeepAliveSession } from "./useKeepAliveSession";

interface UseAddFileSourceApiProps {
  appendSessionLocal: (session: Session | null) => void;
}

interface UseChatMessagesResponse {
  chatMessages: ChatMessageRecord[];
  handlePromptAndMessages: (inputPrompt: string) => Promise<void>;
  updateSessionId: (sessionId: string | null) => Promise<void>;
  loading: boolean;
  loadingResponse: boolean;
  error: string | null;
}

export default function useChatMessages({
  appendSessionLocal,
}: UseAddFileSourceApiProps): UseChatMessagesResponse {
  const { setLoading: setLoadingSpinner } = useLoading();
  const { t } = useTranslation();
  const { getModelProviderFromUid } = useAvailableModels();

  // Keep alive session id, need to be useState but should be keep in sync with sessionIDRef.current
  const [keepAliveSessionId, setKeepAliveSessionId] = useState<string | null>(
    null,
  );
  useKeepAliveSession(keepAliveSessionId);

  const sessionIDRef = useRef<string | null>(null); // Need to use Ref because useState is async
  const chatModelUIDRef = useRef<string | null>(
    readSelectedModel()?.uid ?? null,
  );
  const [currentChatMessages, setCurrentChatMessages] = useState<
    ChatMessageRecord[]
  >([]);
  const promptInput = useRef<string>("");
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false);
  const [historyMessages, setHistoryMessages] = useState<ChatMessageRecord[]>(
    [],
  );

  const {
    response,
    loading,
    error: errorPrompt,
  } = usePromptApi({
    chatModelUID: chatModelUIDRef.current,
    sessionID: sessionIDRef.current,
    inputPrompt: promptInput.current,
  });

  const { handleCreateSession, error: errorSession } = useCreateSessionApi();

  const { fetchHistory, loading: loadingHistory } = useGetHistoryApi();

  // Update session Id (keep keepAliveSessionId and sessionIDRef.current in sync)
  const setSessionId = (sessionId: string | null) => {
    sessionIDRef.current = sessionId;
    setKeepAliveSessionId(sessionId);
  };

  const updateSessionId = async (sessionId: string | null) => {
    // Reset chat messages and prompt input when sessionID changes
    setCurrentChatMessages([]);

    if (sessionIDRef.current === null) {
      const historySessions = await fetchHistory({ sessionId });
      setHistoryMessages(historySessions);
    }

    setSessionId(sessionId);

    promptInput.current = ""; // Reset prompt input, need to avoid resend prompt
    setLoadingResponse(false);
  };

  useEffect(() => {
    setLoadingSpinner(loadingHistory);
  }, [loadingHistory]);

  // Function to handle new user prompt
  const handlePromptAndMessages = async (inputPrompt: string) => {
    setLoadingResponse(true);
    const messageRecord: ChatMessageRecord = {
      text: inputPrompt,
      type: "USER",
      timestamp: new Date().toISOString(),
    };
    setCurrentChatMessages([...currentChatMessages, messageRecord]);
    if (sessionIDRef.current === null) {
      const newSession = await handleCreateSession();

      // Add session to local session list
      appendSessionLocal(newSession);

      if (newSession?.id) {
        setSessionId(newSession.id);
      }
    }
    chatModelUIDRef.current = readSelectedModel()?.uid ?? null;
    promptInput.current = inputPrompt;
  };

  // Update chat messages when response is received
  useEffect(() => {
    if (!loading && errorPrompt === null && response?.response !== undefined) {
      const messageRecord: ChatMessageRecord = {
        text: response.response,
        type: "AI",
        modelProvider: getModelProviderFromUid(chatModelUIDRef.current),
        sources: response.sources,
        timestamp: new Date().toISOString(),
      };
      setCurrentChatMessages([...currentChatMessages, messageRecord]);
      setLoadingResponse(false);
    } else if (!loading && errorPrompt !== null) {
      const messageRecord: ChatMessageRecord = {
        text: t("chatbot.errorGeneratePrompt"),
        type: "SYSTEM",
        timestamp: new Date().toISOString(),
      };
      setCurrentChatMessages([...currentChatMessages, messageRecord]);
      setLoadingResponse(false);
    }
    // In case you type two times the same prompt. If not reset, it will the state doesn't change so no new prompt is sent
    promptInput.current = "";
  }, [errorPrompt, response]);

  return {
    chatMessages: historyMessages.concat(currentChatMessages),
    handlePromptAndMessages,
    updateSessionId,
    loading,
    loadingResponse,
    error: combineErrors([errorPrompt, errorSession]),
  };
}
