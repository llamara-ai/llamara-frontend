import { ChatModelProvider } from "@/api";

const azureIcon = "azure.svg";
const geminiIcon = "gemini.svg";
const mistralIcon = "mistral.svg";
const ollamaIcon = "ollama.svg";
const openaiIcon = "openai.svg";
const botIcon = "bot.svg";

export const getLogoFromModelProvider = (
  provider: ChatModelProvider | undefined,
) => {
  switch (provider) {
    case "AZURE":
      return azureIcon;
    case "GOOGLE_GEMINI":
      return geminiIcon;
    case "MISTRAL":
      return mistralIcon;
    case "OLLAMA":
      return ollamaIcon;
    case "OPENAI":
      return openaiIcon;
    default:
      return botIcon;
  }
};
