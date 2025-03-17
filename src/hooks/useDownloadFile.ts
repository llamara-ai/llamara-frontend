import { useGetKnowledgeFileApiFunction } from "./api/useGetKnowledgeFileApi";

interface UseDownloadFileResponse {
  downloadFile: (
    uuid: string,
    knowledgeLabel: string | undefined,
  ) => Promise<void>;
}

export default function useDownloadFile(): UseDownloadFileResponse {
  const { requestKnowledgeFileApi } = useGetKnowledgeFileApiFunction();

  const downloadFile = async (
    uuid: string,
    knowledgeLabel: string | undefined,
  ): Promise<void> => {
    const file = await requestKnowledgeFileApi(uuid);
    if (!file) return;
    const fileName = knowledgeLabel ?? "download";
    const downloadUrl = window.URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  };

  return { downloadFile };
}
