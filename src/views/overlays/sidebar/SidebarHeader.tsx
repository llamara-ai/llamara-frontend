import { SidebarHeader } from "@/components/ui/sidebar.tsx";
import { useEffect, useState } from "react";
import { ChatModelContainer } from "@/api";
import useGetModelsApi from "@/hooks/api/useGetModelsApi";
import {
  readSelectedModel,
  useWriteSelectedModel,
} from "@/hooks/useLocalStorage";
import { SidebarModelSelector } from "./SidebarModelSelector";
import { toast } from "sonner";
import { SidebarLogo } from "@/views/overlays/sidebar/SidebarLogo.tsx";

const SidebarHeaderFunc = () => {
  const { models } = useGetModelsApi();

  const [selectedModel, setSelectedModel] = useState<ChatModelContainer | null>(
    readSelectedModel(),
  );
  // Update selected model in local storage
  useWriteSelectedModel(selectedModel);

  // check once if previous selected model is available
  // otherwise show notification and reset local storage
  useEffect(() => {
    if (
      selectedModel &&
      !models.some((model) => model.uid === selectedModel.uid) &&
      models.length > 0
    ) {
      toast.error("The selected model is not available", {
        description:
          "Previous model is no longer available. Please select a new model.",
      });
      setSelectedModel(null);
    }
  }, [models]);

  return (
    <SidebarHeader
      className="p-2 flex flex-col align-top"
      style={{
        marginTop: "env(safe-area-inset-top, 0)",
        marginLeft: "env(safe-area-inset-left, 0)",
      }}
    >
      <SidebarLogo className="mb-1" />
      <SidebarModelSelector
        models={models}
        selectedModel={selectedModel}
        setActiveModel={setSelectedModel}
      />
    </SidebarHeader>
  );
};

export default SidebarHeaderFunc;
