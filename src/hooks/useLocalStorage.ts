import { ChatModelContainer } from "@/api";
import { useEffect } from "react";

const selectedModelKey = "selectedModel";

function useWriteDataToLocalStorage(key: string, value: string) {
  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);
}

function readDataFromLocalStorage(key: string) {
  //return null if key is not found
  return localStorage.getItem(key);
}

export function readSelectedModel(): ChatModelContainer | null {
  const chatModelString = readDataFromLocalStorage(selectedModelKey);
  if (chatModelString && chatModelString !== "") {
    return JSON.parse(chatModelString); // eslint-disable-line @typescript-eslint/no-unsafe-return
  }
  return null;
}

export function useWriteSelectedModel(model: ChatModelContainer | null) {
  let modelJsonString;
  if (!model) {
    modelJsonString = "";
  } else {
    modelJsonString = JSON.stringify(model);
  }
  useWriteDataToLocalStorage(selectedModelKey, modelJsonString);
}
