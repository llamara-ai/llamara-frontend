import { useState } from "react";
import {
  removeKnowledgePermission,
  setKnowledgePermission,
  type Knowledge,
  type Permission,
} from "@/api";
import { useToast } from "@/hooks/use-toast";
import { useGetKnowledgeList } from "@/services/GetKnowledgeListService";

interface UseKnowledgePermissionApiProps {
  knowledge: Knowledge | null;
}

interface UseKnowledgePermissionApiResponse {
  updateKnowledgePermissions: (
    permissions: Record<string, Permission>,
  ) => Promise<void>;
  error: string | null;
}

export default function useKnowledgePermissionApi({
  knowledge,
}: UseKnowledgePermissionApiProps): UseKnowledgePermissionApiResponse {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const { updateLocalKnowledge } = useGetKnowledgeList();

  const updateKnowledgePermissions = async (
    permissionsInput: Record<string, Permission>,
  ) => {
    if (!knowledge) return;

    const currentPermissions = knowledge.permissions ?? {};
    const updatedPermissions: Record<string, Permission> = {};

    // Handle permissions to remove
    for (const [username, currentPermission] of Object.entries(
      currentPermissions,
    )) {
      if (!(username in permissionsInput)) {
        try {
          const options = {
            path: {
              id: knowledge.id ?? "",
              username: username,
            },
          };
          const response = await removeKnowledgePermission(options);
          if (!response.response.ok) {
            throw new Error(response.response.statusText);
          }
        } catch (error) {
          handleError(error, `Failed to remove permission for ${username}`);
          updatedPermissions[username] = currentPermission;
        }
      }
    }

    // Handle permissions to add or update
    for (const [username, newPermission] of Object.entries(permissionsInput)) {
      const currentPermission = currentPermissions[username];
      if (
        newPermission !== currentPermission ||
        !(username in currentPermissions)
      ) {
        if (newPermission === "NONE" || newPermission === "OWNER") {
          updatedPermissions[username] = newPermission;
          continue;
        }

        try {
          const options = {
            path: {
              id: knowledge.id ?? "",
              username: username,
            },
            body: newPermission,
          };
          const response = await setKnowledgePermission(options);
          if (!response.response.ok) {
            throw new Error(response.response.statusText);
          }
          updatedPermissions[username] = newPermission;
        } catch (error) {
          handleError(error, `Failed to set permission for ${username}`);
          updatedPermissions[username] = currentPermission;
        }
      } else {
        updatedPermissions[username] = currentPermission;
      }
    }

    // Sort permissions (OWNER first, then alphabetically)
    const sortedPermissions = Object.entries(updatedPermissions).sort(
      ([key1, value1], [key2, value2]) => {
        if (value1 === "OWNER") return -1;
        if (value2 === "OWNER") return 1;
        return key1.localeCompare(key2);
      },
    );

    // Update local knowledge with the new permissions
    await updateLocalKnowledge([
      { ...knowledge, permissions: Object.fromEntries(sortedPermissions) },
    ]);
  };

  const handleError = (error: unknown, message: string) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    setError(errorMessage);
    toast({
      variant: "destructive",
      title: message,
      description: errorMessage,
    });
  };

  return { updateKnowledgePermissions, error };
}
