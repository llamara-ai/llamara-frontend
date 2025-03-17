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


export default function Chatbot() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();


  const chatModelUIDRef = useRef<string | null>(useReadSelectedModel()?.uid ?? null); // Load selected model from local storage
  const [inputLock, setInputLock] = useState<boolean>(false);


  const {chatMessages, loading, loadingResponse, handlePromptAndMessages, updateSessionId} = useChatMessages({
      chatModelUID: chatModelUIDRef.current
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('session');
    updateSessionId(null); // Reset session id
    updateSessionId(sessionId);
  }, [location]);

  const onSubmit = async (prompt: string) => {
    await handlePromptAndMessages(prompt);
  }


  const onClickNewSession = async () => {
    setInputLock(true);
    navigate('/', { replace: true }); // Remove session id from URL
    await updateSessionId(null);
    setInputLock(false);
    toast({
      variant: "default", 
      title: t("chatbot.newSessionCreate")
    });
  }

  return ( 
    <Sidebar sideBarContent={<SidebarContent onSelectedModel={(modelUid) => chatModelUIDRef.current = modelUid}/>}>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 z-50 ">
          <ChatbotHeader onClickNewSession={onClickNewSession}/>
        </div>
        <div className="mx-6 h-full">
          <Chat messages={chatMessages}
                handleSubmit={onSubmit}
                isLoading={loading}
                isGenerating={loadingResponse}
                lockSendPrompt={inputLock}
          />
        </div>
      </div>
    </Sidebar>
  )
}