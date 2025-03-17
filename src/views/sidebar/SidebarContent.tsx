import {
  SidebarContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar.tsx"
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChatModelContainer } from "@/api";
import useGetSessionsApi from "@/hooks/api/useGetSessionsApi";
import useGetModelsApi from "@/hooks/api/useGetModelsApi";
import { useReadSelectedModel, useWriteSelectedModel } from "@/hooks/useLocalStorage";
import { SidebarSessionList as ChatbotSidebarMain } from "./SidebarSessionList";
import { SidebarModelSelector as ChatbotSidebarHeader } from "./SidebarModelSelector";
import { useToast } from "@/hooks/use-toast";
import { groupSessionsByDateForNavbar } from "@/lib/groupSessionsByDateForNavbar";
import { useNavigate } from 'react-router-dom';
import useGetBackendInformation from "@/hooks/api/useGetBackendInformation";

// No need to provide onSelectedModel if not provided only store the selected model in local storage
interface SidebarProps {
  onSelectedModel? : (modelUid: string | null) => void
}



const SessionModelSidebar: React.FC<SidebarProps> = ({ onSelectedModel }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedModel, setSelectedModel] = useState<ChatModelContainer | null>(useReadSelectedModel());

  const {models} = useGetModelsApi();

  // Update parent component with selected model 
  // If no method is provided store the selected model in local storage
  // Chatbot component will read the selected model from local storage
  useEffect(() => {
    if (onSelectedModel) {
      if (selectedModel?.uid) {
        onSelectedModel(selectedModel.uid);
      } else {
        onSelectedModel(null);
      }
    }
  }, [selectedModel]);

  // Update selected model in local storage
  useWriteSelectedModel(selectedModel);

  
  // check once if previous selected model is available
  // otherwise show notification and reset local storage
  useEffect(() => {
    if (selectedModel && models.indexOf(selectedModel) === -1 && models.length > 0) {
      toast({
        variant: "destructive",
        title: "The selected model is not available",
        description: "Previous model is no longer available. Please select a new model.",
      })
      setSelectedModel(null);
    }
  }, [])


  const onSelectSession = (sessionId: string) => {
      navigate(`/?session=${sessionId}`);
  }



  const {sessions} = useGetSessionsApi();
  const sortedSessions = groupSessionsByDateForNavbar(sessions)

  
  const {isAnonymousMode, loading} = useGetBackendInformation();

  return (
    <>
      <SidebarHeader>
        <ChatbotSidebarHeader models={models} 
                              selectedModel={selectedModel}
                              setActiveModel={setSelectedModel} />
      </SidebarHeader>
      <SidebarContent>
        {!loading &&  // Only show anything when finished loading     
          isAnonymousMode ? 
          <SidebarGroupLabel style={{marginTop: 10, textAlign: "center"}}>{t("chatbot.sidebar.anonymousModeActive")}</SidebarGroupLabel>:
          <ChatbotSidebarMain title={t("chatbot.sidebar.title")} items={sortedSessions} setOnClick={onSelectSession} />
        }
        
      </SidebarContent>
    </>
  )
}

export default SessionModelSidebar;

