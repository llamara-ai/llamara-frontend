import { addFileSource, UUID } from '@/api';
import { useState } from 'react';
import { useToast } from '../use-toast';


interface UseAddFileSourceApiProps {
    files: (Blob | File)[];
}

interface UseAddFileSourceApiResponse {
    fileUUIDs:  UUID[] ;
    handleAddFileSource: () => Promise<void>;
    error: string | null;
}

export default function useAddFileSourceApi({ files } : UseAddFileSourceApiProps) : UseAddFileSourceApiResponse {
    const [fileUUIDs, setFileUUIDs] = useState<UUID[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    
    const handleAddFileSource = async () => {
        const options = {
            body: {
                files: files
            }
        }

        addFileSource(options).then((response) => {
            if (response.data) {
                setFileUUIDs(response.data);
            } else {
                setFileUUIDs([]);
            }
        }).catch((error) => {
            toast({
                variant: "destructive", 
                title: "Failed to add files to the knowledge!", 
                description: error.message,
            });
            setError(error.message);
        });
    };
    

    return {fileUUIDs, handleAddFileSource, error};
}