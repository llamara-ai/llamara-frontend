import useChatMessages from "@/hooks/useChatMessages";
import ChatbotHeader from "./Header";
import SidebarContent from "../sidebar/SidebarContent";
import Chat from "./Chat";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import Sidebar from "../sidebar/Sidebar";
import { useReadSelectedModel } from "@/hooks/useLocalStorage";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "@/views/overlays/Footer.tsx";
import useGetSessionsApi from "@/hooks/api/useGetSessionsApi";

export default function Chatbot() {
  const { toast } = useToast();
  const { t } = useTranslation();

  const useSessionsApiInstance = useGetSessionsApi();
  const { appendSessionLocal } = useSessionsApiInstance;

  const navigate = useNavigate();
  const location = useLocation();

  const chatModelUIDRef = useRef<string | null>(
    useReadSelectedModel()?.uid ?? null,
  ); // Load selected model from local storage
  const [inputLock, setInputLock] = useState<boolean>(false);

  const {
    chatMessages,
    loading,
    loadingResponse,
    handlePromptAndMessages,
    updateSessionId,
  } = useChatMessages({
    chatModelUID: chatModelUIDRef.current,
    appendSessionLocal,
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get("session");
    void updateSessionId(null); // Reset session id
    void updateSessionId(sessionId);
  }, [location]);

  const onSubmit = async (prompt: string) => {
    await handlePromptAndMessages(prompt);
  };

  const onClickNewSession = async () => {
    setInputLock(true);
    await navigate("/", { replace: true }); // Remove session id from URL
    await updateSessionId(null);
    setInputLock(false);
    toast({
      variant: "default",
      title: t("chatbot.newSessionCreate"),
    });
  };

  return (
    <Sidebar
      sideBarContent={
        <SidebarContent
          useSessionsApiInstance={useSessionsApiInstance}
          onSelectedModel={(modelUid) => (chatModelUIDRef.current = modelUid)}
        />
      }
    >
      <div className="h-full flex flex-col">
        <div className="sticky top-0 z-50 ">
          <ChatbotHeader onClickNewSession={() => void onClickNewSession()} />
        </div>
        <div className="mx-6 h-full">
          <Chat
            messages={chatMessages}
            handleSubmit={onSubmit}
            currentSelectedModelId={chatModelUIDRef.current}
            isLoading={loading}
            isGenerating={loadingResponse}
            lockSendPrompt={inputLock}
          />
        </div>
      </div>
      <small className="block mt-2 text-xs text-muted-foreground text-center w-full pb-2">
        {t("footer.hint")}
      </small>
      <Footer />
    </Sidebar>
  );
}
