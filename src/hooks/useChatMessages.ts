import { useEffect, useRef, useState } from "react";
import usePromptApi from "./api/useSendPromptApi";
import { useTranslation } from "react-i18next";
import useCreateSessionApi from "./api/useCreateSessionApi";
import { combineErrors } from "@/lib/combineErrors";
import { ChatMessageRecord } from "@/api";
import useGetHistoryApi from "./api/useGetHistoryApi";
import { useLoading } from "@/services/LoadingService";

interface UseAddFileSourceApiProps {
    chatModelUID: string | null
}

interface UseChatMessagesResponse {
    chatMessages: ChatMessageRecord[];
    handlePromptAndMessages: (inputPrompt: string) => Promise<void>;
    updateSessionId: (sessionId: string | null) => Promise<void>;
    loading: boolean;
    loadingResponse: boolean;
    error: string | null;
}


export default function useChatMessages({chatModelUID}: UseAddFileSourceApiProps) : UseChatMessagesResponse {
    const {setLoading: setLoadingSpinner} = useLoading();
    const { t } = useTranslation();
    const sessionIDRef = useRef<string | null>(null); // Need to use Ref because useState is async
    const chatModelUIDRef = useRef<string | null>(chatModelUID);
    const [currentChatMessages, setCurrentChatMessages] = useState<ChatMessageRecord[]>([]);
    const promptInput = useRef<string>('');
    const [loadingResponse, setLoadingResponse] = useState<boolean>(false);
    const [historyMessages, setHistoryMessages] = useState<ChatMessageRecord[]>([]);

    
    const { response, loading, error: errorPrompt} = usePromptApi({
        chatModelUID: chatModelUIDRef.current, 
        sessionID: sessionIDRef.current,
        inputPrompt: promptInput.current,
    });  

    const {handleCreateSession, error: errorSession} = useCreateSessionApi();

    const { fetchHistory, loading : loadingHistory } = useGetHistoryApi();

    const updateSessionId = async (sessionId: string | null) => {

        // Reset chat messages and prompt input when sessionID changes
        setCurrentChatMessages([]);

        if (sessionIDRef.current === null) {
            const historySessions = await fetchHistory({sessionId});
            setHistoryMessages(historySessions);
        }

        sessionIDRef.current = sessionId;

        promptInput.current = ""; // Reset prompt input, need to avoid resend prompt
        setLoadingResponse(false);       
    }

    useEffect(() => {
        setLoadingSpinner(loadingHistory)
    }, [loadingHistory]);

    // Function to handle new user prompt
    const handlePromptAndMessages = async (inputPrompt: string) => {
        setLoadingResponse(true);
        const messageRecord: ChatMessageRecord = {
            text: inputPrompt,
            type: 'USER',
            timestamp: new Date().toISOString(),
        }
        setCurrentChatMessages([...currentChatMessages, messageRecord]);
        if (sessionIDRef.current === null) {
            const newSession = await handleCreateSession();
            if (newSession) {
                sessionIDRef.current = newSession.id!;
            }
        }

        promptInput.current = inputPrompt;        
    }

    // Update chat messages when response is received
    useEffect(() => {   
        if (!loading && errorPrompt === null && response && response !== "") {
            const messageRecord: ChatMessageRecord = {
                text: response,
                type: 'AI',
                timestamp: new Date().toISOString()
            };
            setCurrentChatMessages([...currentChatMessages, messageRecord]);
            setLoadingResponse(false);
        } else if(!loading && errorPrompt !== null) {
            const messageRecord: ChatMessageRecord = {
                text: t("chatbot.errorGeneratePrompt"),
                type: 'SYSTEM',
                timestamp: new Date().toISOString()
            };
            setCurrentChatMessages([...currentChatMessages, messageRecord]);
            setLoadingResponse(false);
        }  
        // In case you type two times the same prompt. If not reset, it will the state doesn't change so no new prompt is sent
        promptInput.current = "";   
    }, [errorPrompt, response]);

   
    // Update Chat Model UID when it changes
    useEffect(() => {
        promptInput.current = ""; // Reset prompt input, need to avoid resend prompt
        setLoadingResponse(false);
        chatModelUIDRef.current = chatModelUID;
    }, [chatModelUID]);
    
    return {chatMessages: historyMessages.concat(currentChatMessages), 
            handlePromptAndMessages, 
            updateSessionId,
            loading, 
            loadingResponse,
            error: combineErrors([errorPrompt, errorSession])};
}