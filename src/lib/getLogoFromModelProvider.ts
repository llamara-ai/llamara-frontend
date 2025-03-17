import { ChatModelProvider } from "@/api";

const azureIcon = "azure.svg";
const openaiIcon = "openai.svg";
const ollamaIcon = "ollama.svg";
const botIcon = "bot.svg";

export const getLogoFromModelProvider = (
  provider: ChatModelProvider | undefined,
) => {
  switch (provider) {
    case "AZURE":
      return azureIcon;
    case "OPENAI":
      return openaiIcon;
    case "OLLAMA":
      return ollamaIcon;
    default:
      return botIcon;
  }
};
