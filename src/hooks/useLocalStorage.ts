import { ChatModelContainer } from '@/api';
import { useEffect, useState } from 'react';

const selectedModelKey = "selectedModel";


function useWriteDataToLocalStorage(key:string, value:string) {
    useEffect(() => {
        localStorage.setItem(key, value);
    }, [key, value]);    
}

function useReadDataFromLocalStorage(key:string) {
    //return null if key is not found
    const [value] = useState(localStorage.getItem(key));
    return value;
}


export function useReadSelectedModel():(ChatModelContainer | null) {
    const chatModelString = useReadDataFromLocalStorage(selectedModelKey);
    if (chatModelString && chatModelString !== "") {
        return JSON.parse(chatModelString);
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

