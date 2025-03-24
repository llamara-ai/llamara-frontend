import { ChatModelProvider } from "@/api";

const directory = "providers/";
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
      return directory + azureIcon;
    case "GOOGLE_GEMINI":
      return directory + geminiIcon;
    case "MISTRAL":
      return directory + mistralIcon;
    case "OLLAMA":
      return directory + ollamaIcon;
    case "OPENAI":
      return directory + openaiIcon;
    default:
      return directory + botIcon;
  }
};
